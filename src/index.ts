import { TestsCodeLensProvider } from './providers/code_lens_provider'
import { commands, Disposable, languages } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { CmdInvoker } from './cmd_invoker'
import ExtConfig from './utilities/ext_config'
import { TestsRunner } from './tests_runner'
import { TestController } from './providers/test_controller'
import { Notifier } from './notifier'

/**
 * Create the TestCodeLensProvider. Dispose the old one if it exists.
 */
let testCodeLensProviderDisposable: Disposable | null = null
async function createTestsCodeLensProvider() {
  if (testCodeLensProviderDisposable) {
    testCodeLensProviderDisposable.dispose()
  }

  testCodeLensProviderDisposable = languages.registerCodeLensProvider(
    [
      { language: 'typescript', scheme: 'file', pattern: ExtConfig.tests.filePattern },
      { language: 'javascript', scheme: 'file', pattern: ExtConfig.tests.filePattern },
    ],
    new TestsCodeLensProvider()
  )
}

/**
 * Entry point of the extension
 */
export function activate(context: ExtensionContext) {
  console.info('Activating Japa extension...')

  if (!ExtConfig.tests.filePattern) {
    Notifier.showError('Please provide a valid file pattern in the extension settings')
  }

  ExtConfig.onDidChange(createTestsCodeLensProvider, { immediate: true })

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

    commands.registerCommand(
      ExtConfig.buildCommandId('runLatestTest'),
      TestsRunner.runLatestTest.bind(TestsRunner)
    ),
  ]

  const controller = new TestController()
  context.subscriptions.push(...commandsDisposables, controller.controller)
}
