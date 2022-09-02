import { basename } from 'path'
import { window, workspace } from 'vscode'
import { CmdInvoker } from '../cmd_invoker'
import { TestsExtractor } from '../tests_extractor'

export class TestsRunner {
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

  /**
   * Run the active test file.
   */
  public static runTestFile() {
    const { filename, workspaceFolder } = this.getActiveEditor()

    return CmdInvoker.exec({
      command: `npm run test -- --files "${filename}"`,
      cwd: workspaceFolder,
    })
  }

  /**
   * Run the test at the cursor position.
   */
  public static runTest() {
    const { filename, workspaceFolder, cursorPosition, document } = this.getActiveEditor()

    const { tests, groups } = new TestsExtractor().extract(document.getText())
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

    return CmdInvoker.exec({
      command: `npm run test -- --files "${filename}" --tests "${selectedTest.title}"`,
      cwd: workspaceFolder,
    })
  }
}
