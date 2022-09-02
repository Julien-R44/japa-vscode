import { platform } from 'process'
import ExtConfig from '../utilities/ext_config'
import { window } from 'vscode'
import { CmdInvokerExecOptions, CmdInvokerExecTestsOptions } from '../contracts'

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

  public static async execTests(options: CmdInvokerExecTestsOptions) {
    let command = `npm run ${ExtConfig.tests.npmScript} --`

    if (options.watch || ExtConfig.tests.runTestsInWatchMode) {
      command += ' --watch'
    }

    if (options.files) {
      command += ` --files "${options.files.join(',')}"`
    }

    if (options.tests) {
      command += ` --tests "${options.tests.join(',')}"`
    }

    return CmdInvoker.exec({
      cwd: options.cwd,
      command: command,
    })
  }

  /**
   * Execute a command
   */
  public static async exec({ cwd, command }: CmdInvokerExecOptions) {
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
