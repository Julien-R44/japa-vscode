import { TestsCodeLensProvider } from './providers/code_lens_provider'
import { commands, languages } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { CmdInvoker } from './cmd_invoker'
import ExtConfig from './utilities/ext_config'
import { TestsRunner } from './tests_runner'

export function activate(context: ExtensionContext) {
  console.info('Activating Japa extension...')

  languages.registerCodeLensProvider(
    [
      { language: 'typescript', scheme: 'file', pattern: '**/*.{spec,test}.ts' },
      { language: 'javascript', scheme: 'file', pattern: '**/*.{spec,test}.js' },
    ],
    new TestsCodeLensProvider()
  )

  const commandsDisposables = [
    commands.registerCommand(
      ExtConfig.buildCommandId('invokeCmd'),
      CmdInvoker.exec.bind(CmdInvoker)
    ),

    commands.registerCommand(
      ExtConfig.buildCommandId('runTestFile'),
      TestsRunner.runTestFile.bind(TestsRunner)
    ),

    commands.registerCommand(
      ExtConfig.buildCommandId('runTest'),
      TestsRunner.runTest.bind(TestsRunner)
    ),
  ]

  context.subscriptions.push(...commandsDisposables)
}
