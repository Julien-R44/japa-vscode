import { Range, workspace } from 'vscode'
import ExtConfig from '../utilities/ext_config'
import { TestsExtractor } from '../tests_extractor'
import type { CmdInvokerExecTestsOptions } from '../contracts'
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
    return workspaceFolder!
  }

  /**
   * Build a CodeLens for the given parameters.
   */
  private buildCodeLens(options: {
    line: number
    title: string
    document: TextDocument
    command: {
      name: string
      arguments?: Omit<CmdInvokerExecTestsOptions, 'filename' | 'cwd'>
    }
  }) {
    const codeLensLine = options.line - 1 < 0 ? 0 : options.line - 1

    const commandArguments = {
      cwd: this.getProjetRootDirectory(options.document).uri.path,
      files: [workspace.asRelativePath(options.document.fileName)],
      ...options.command.arguments,
    }

    return {
      range: new Range(codeLensLine, 0, codeLensLine, 0),
      isResolved: true,
      command: {
        command: ExtConfig.buildCommandId(options.command.name),
        title: options.title,
        arguments: [commandArguments],
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
    if (!ExtConfig.tests.enableCodeLens) {
      return []
    }

    const { tests, groups } = new TestsExtractor().extract(document.getText())

    const testsCodeLenses = [...tests, ...groups.flatMap((group) => group.tests)].map((test) =>
      this.buildCodeLens({
        line: test.location.start.line,
        title: `Run the below test`,
        command: {
          name: 'runTest',
          arguments: { tests: [test.title] },
        },
        document,
      })
    )

    return [
      ...testsCodeLenses,
      this.buildCodeLens({
        line: 0,
        title: 'Run tests for this file',
        command: { name: 'runTestFile' },
        document,
      }),
    ]
  }
}
