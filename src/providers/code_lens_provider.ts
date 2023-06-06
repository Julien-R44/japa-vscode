import { Range, workspace } from 'vscode'
import ExtConfig from '../utilities/ext_config'
import { AstExtractor } from '../ast_extractor'
import { getNearestDirContainingPkgJson } from '../utilities'
import type { SnapshotMatchNode } from '../ast_extractor/nodes/snapshot_match_node'
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
    const nearestPkgJsonDir = getNearestDirContainingPkgJson({ cwd: document.fileName })

    return nearestPkgJsonDir || workspaceFolder?.uri.path
  }

  /**
   * Build a CodeLens for the given parameters.
   */
  private buildTestRunCodeLens(options: {
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
      cwd: this.getProjetRootDirectory(options.document),
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
   * Build a CodeLens for a snapshot match call expression
   */
  private buildSeeSnapshotCodeLens(document: TextDocument, snapshot: SnapshotMatchNode) {
    return {
      isResolved: true,
      range: new Range(snapshot.location.start.line - 1, 0, snapshot.location.start.line - 1, 0),
      command: {
        title: 'See snapshot',
        command: ExtConfig.buildCommandId('openSnapshotFile'),
        arguments: [
          {
            testPath: document.fileName,
            testName: snapshot.test.title,
            snapshotIndex: snapshot.index,
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
    if (!ExtConfig.tests.enableCodeLens) {
      return []
    }

    const { tests, groups, snapshots } = new AstExtractor().extract(document.getText())
    const allTests = [...tests, ...groups.flatMap((group) => group.tests)]

    const testsCodeLenses = allTests.map((test) =>
      this.buildTestRunCodeLens({
        line: test.location.start.line,
        title: `Run test`,
        command: {
          name: 'runTest',
          arguments: { tests: [test.title] },
        },
        document,
      })
    )

    const snapshotCodeLenses = snapshots.map((snapshot) =>
      this.buildSeeSnapshotCodeLens(document, snapshot)
    )

    return [
      ...testsCodeLenses,
      ...snapshotCodeLenses,
      this.buildTestRunCodeLens({
        line: 0,
        title: 'Run tests for this file',
        command: { name: 'runTestFile' },
        document,
      }),
    ]
  }
}
