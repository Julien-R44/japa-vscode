import { basename } from 'path'
import { Range, workspace } from 'vscode'
import ExtConfig from '../utilities/ext_config'
import { TestsExtractor } from '../tests_extractor'
import type {
  CancellationToken,
  CodeLens,
  CodeLensProvider,
  ProviderResult,
  TextDocument,
} from 'vscode'

export class TestsCodeLensProvider implements CodeLensProvider {
  private getProjetRootDirectory(document: TextDocument) {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri)
    return workspaceFolder?.uri.path
  }

  /**
   * Build a CodeLens for the given parameters.
   */
  private buildCodeLens(options: {
    line: number
    title: string
    commandArguments?: string[]
    document: TextDocument
  }) {
    const codeLensLine = options.line - 1 < 0 ? 0 : options.line - 1
    const baseCommandArguments = [
      ExtConfig.tests?.watchMode ? '--watch' : '',
      `--files "${basename(options.document.fileName)}"`,
    ]

    console.log

    return {
      range: new Range(codeLensLine, 0, codeLensLine, 0),
      isResolved: true,
      command: {
        command: ExtConfig.buildCommandId('invokeCmd'),
        title: options.title,
        arguments: [
          {
            cwd: this.getProjetRootDirectory(options.document),
            command: `npm run test -- ${baseCommandArguments
              .concat(options.commandArguments || [])
              .join(' ')}`,
          },
        ],
      },
    }
  }

  /**
   * Provide CodeLens for each test in the file.
   */
  public provideCodeLenses(
    document: TextDocument,
    _token: CancellationToken
  ): ProviderResult<CodeLens[]> {
    const { tests, groups } = new TestsExtractor().extract(document.getText())

    const testsCodeLenses = [...tests, ...groups.flatMap((group) => group.tests)].map((test) =>
      this.buildCodeLens({
        line: test.location.start.line,
        title: `Run test ${test.title}`,
        commandArguments: [`--tests "${test.title}"`],
        document,
      })
    )

    return [
      ...testsCodeLenses,
      this.buildCodeLens({
        line: 0,
        title: 'Run tests for this file',
        document,
      }),
    ]
  }
}
