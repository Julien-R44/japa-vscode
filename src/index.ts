import { TestsCodeLensProvider } from './providers/code_lens_provider'
import { commands, languages } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { CmdInvoker } from './cmd_invoker'
import ExtConfig from './utilities/ext_config'

export function activate(context: ExtensionContext) {
  console.info('Activating Japa extension...')

  languages.registerCodeLensProvider(
    {
      language: 'typescript',
      scheme: 'file',
      pattern: '**/*.{spec,test}.ts',
    },
    new TestsCodeLensProvider()
  )

  context.subscriptions.push(
    commands.registerCommand(
      ExtConfig.buildCommandId('invokeCmd'),
      CmdInvoker.exec.bind(CmdInvoker)
    )
  )
}
