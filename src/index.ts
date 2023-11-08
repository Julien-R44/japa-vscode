import { commands, languages } from 'vscode'
import { TestsCodeLensProvider } from './providers/code_lens_provider'
import { CmdInvoker } from './cmd_invoker'
import ExtConfig from './utilities/ext_config'
import { TestsRunner } from './tests_runner'
import { TestController } from './providers/test_controller'
import { Notifier } from './notifier'
import { openSnapshotFile } from './utilities'
import type { Disposable, ExtensionContext } from 'vscode'

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
      { language: 'typescriptreact', scheme: 'file', pattern: ExtConfig.tests.filePattern },
      { language: 'javascriptreact', scheme: 'file', pattern: ExtConfig.tests.filePattern },
    ],
    new TestsCodeLensProvider()
  )
}

/**
 * Entry point of the extension
 */
export function activate(context: ExtensionContext) {
  Notifier.log('Activating Japa extension...')

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

    commands.registerCommand(ExtConfig.buildCommandId('openSnapshotFile'), openSnapshotFile),
  ]

  const controller = new TestController()
  context.subscriptions.push(...commandsDisposables, controller.controller)

  Notifier.log('Japa extension activated.')
}
