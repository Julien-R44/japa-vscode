import { platform } from 'process'
import { commands, window } from 'vscode'
import ExtConfig from '../utilities/ext_config'
import type { CmdInvokerExecOptions, CmdInvokerExecTestsOptions } from '../contracts'

export class CmdInvoker {
  /**
   * Execute a command in the foreground, in the VSCode integrated terminal
   */
  private static sendTextToJapaTerminal(command: string) {
    let terminal = window.terminals.find((openedTerminal) => openedTerminal.name === 'Japa')

    if (!terminal) {
      terminal = window.createTerminal({
        name: 'Japa',
        env: { NODE_NO_WARNINGS: ExtConfig.misc.disableNodeWarnings ? '1' : '0' },
      })
    }

    commands.executeCommand('workbench.action.terminal.clear')
    terminal.show(true)
    terminal.sendText(command)
  }

  private static escapeTestTitle(title: string) {
    return title.replaceAll('"', '\\"').replaceAll('$', '\\$')
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
      const escapedTestsTitles = options.tests.map(this.escapeTestTitle)
      command += ` --tests "${escapedTestsTitles.join(',')}"`
    }

    return CmdInvoker.exec({
      cwd: options.cwd,
      command,
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
        ? `cd "${cwd}"; ${command}`
        : `cd "${cwd}" && ${command}`

    this.sendTextToJapaTerminal(cmdWithCd)
  }
}
