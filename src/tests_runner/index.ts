import { window, workspace } from 'vscode'
import { CmdInvoker } from '../cmd_invoker'
import { AstExtractor } from '../ast_extractor'
import type { CmdInvokerExecOptions, CmdInvokerExecTestsOptions } from '../contracts'
import type { Position, TextDocument } from 'vscode'

export class TestsRunner {
  private static latestInvokedTest: CmdInvokerExecTestsOptions | undefined

  /**
   * Return the active text editor with additional data
   */
  private static getActiveEditor() {
    const activeEditor = window.activeTextEditor

    if (!activeEditor) {
      throw new Error('No active editor found !')
    }

    const workspaceFolder = workspace.getWorkspaceFolder(activeEditor.document.uri)
    const filename = workspace.asRelativePath(activeEditor.document.fileName)

    return {
      filename,
      workspaceFolder: workspaceFolder!.uri.path,
      document: activeEditor.document,
      cursorPosition: activeEditor.selection.active,
    }
  }

  private static getTestAtCursorPosition(document: TextDocument, cursorPosition: Position) {
    const { tests, groups } = new AstExtractor().extract(document.getText())
    const flattenedTests = tests.concat(groups.flatMap((group) => group.tests))

    const selectedTest = flattenedTests.find((test) => {
      return (
        test.location.start.line <= cursorPosition.line + 1 &&
        test.location.end.line >= cursorPosition.line + 1
      )
    })

    if (!selectedTest) {
      throw new Error('No test found at the cursor position !')
    }

    return selectedTest
  }

  public static runLatestTest() {
    if (!this.latestInvokedTest) {
      throw new Error('No test has been invoked yet !')
    }

    return CmdInvoker.execTests(this.latestInvokedTest)
  }

  /**
   * Run the given test file. If no test file is given, run the test file of the active editor
   */
  public static runTestFile(options?: CmdInvokerExecOptions) {
    const { filename, workspaceFolder } = this.getActiveEditor()

    const execTestParams = {
      files: [filename],
      cwd: options?.cwd || workspaceFolder,
    }

    this.latestInvokedTest = execTestParams

    return CmdInvoker.execTests(execTestParams)
  }

  /**
   * Run the given test. If no test is given, run the test at the cursor position
   */
  public static runTest(options?: CmdInvokerExecTestsOptions) {
    const { filename, workspaceFolder, cursorPosition, document } = this.getActiveEditor()

    const execTestParams = {
      files: options?.files || [filename],
      tests: options?.tests || [this.getTestAtCursorPosition(document, cursorPosition).title],
      cwd: options?.cwd || workspaceFolder,
    }

    this.latestInvokedTest = execTestParams

    return CmdInvoker.execTests(execTestParams)
  }
}
