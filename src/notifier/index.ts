import { window } from 'vscode'

export class Notifier {
  public static outputChannel = window.createOutputChannel('Japa')

  /**
   * Show a message to the user
   */
  public static async showMessage(message: string) {
    return window.showInformationMessage(message)
  }

  /**
   * Show an error message to the user
   */
  public static async showError(message: string, consoleErr: any = null) {
    if (consoleErr !== null) {
      message += ' (See output console for more details)'
      this.outputChannel.appendLine(consoleErr)
      this.outputChannel.show()
    }
    window.showErrorMessage(message)
    return false
  }

  /**
   * Add error message to the output console
   */
  public static async logError(message: string, consoleErr: any = null) {
    this.outputChannel.appendLine(message)
    if (consoleErr !== null) {
      this.outputChannel.appendLine(consoleErr)
    }
  }
}
