import { platform } from 'process'
import ExtConfig from '../utilities/ext_config'
import { window } from 'vscode'

export class CmdInvoker {
  /**
   * Execute a command in the foreground, in the VSCode integrated terminal
   */
  private static sendTextToJapaTerminal(command: string) {
    let terminal = window.terminals.find((openedTerminal) => openedTerminal.name === 'Japa')

    if (!terminal) {
      terminal = window.createTerminal(`Japa`)
    }

    terminal.show()
    terminal.sendText(command)
  }

  /**
   * Execute a command
   */
  public static async exec({ cwd, command }: { cwd: string; command: string }) {
    const isWindows = platform === 'win32'
    if (isWindows && cwd.startsWith('/')) {
      cwd = cwd.substring(1)
    }

    /**
     * Since we are in the integrated terminal, we need to
     * manually cd in the cwd
     */
    const cmdWithCd =
      platform === 'win32' && !ExtConfig.misc.useUnixCd
        ? `cd /d "${cwd}" && ${command}`
        : `cd "${cwd}" && ${command}`

    this.sendTextToJapaTerminal(cmdWithCd)
  }
}
