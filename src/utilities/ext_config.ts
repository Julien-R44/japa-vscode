import { workspace } from 'vscode'
import type { ConfigMisc, ConfigTests } from '../contracts/config'

/**
 * A wrapper around vscode configuration for this extension
 */
class ExtConfig {
  /**
   * Extension name/identifier
   */
  public static readonly EXTENSION_NAME = 'japa-vscode'

  /**
   * Prefix of the extension configuration keys
   */
  public static readonly CONFIG_NAME = 'japa'

  /**
   * Build a command identifier
   */
  public static buildCommandId(command: string) {
    return `${this.EXTENSION_NAME}.${command}`
  }

  /**
   * In-built vscode HTML configuration.
   */
  public static get misc(): ConfigMisc {
    return workspace.getConfiguration(this.CONFIG_NAME).misc
  }

  /**
   * Configuration for the tests
   */
  public static get tests(): ConfigTests {
    return workspace.getConfiguration(this.CONFIG_NAME).tests
  }

  /**
   * Hook to listen for configuration changes
   *
   * If immediate is set to true, the callback will also be called immediately
   */
  public static onDidChange(callback: () => void, options?: { immediate: boolean }) {
    if (options && options.immediate) {
      callback()
    }

    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.CONFIG_NAME)) {
        callback()
      }
    })
  }
}

export default ExtConfig
