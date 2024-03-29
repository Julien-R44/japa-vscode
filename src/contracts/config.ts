/**
 * A configuration value set by a user (default provided by extension).
 * See extension root `package.json` for default values.
 */
export interface Config {
  [key: string]: any
}

export interface ConfigTests extends Config {
  /**
   * Run tests in watch mode when executed via shortcut/codelens
   */
  runTestsInWatchMode: boolean

  /**
   * Show CodeLenses above tests
   */
  enableCodeLens: boolean

  /**
   * The npm script to run tests
   */
  npmScript: string

  /**
   * The pattern used to find test files
   */
  filePattern: string
}

export interface ConfigMisc extends Config {
  /**
   * Use Unix-style cd for windows terminals ( Useful when using Cygwin or Git Bash )
   */
  useUnixCd: boolean

  /**
   * Disable node warnings in the terminal by setting the `NODE_NO_WARNINGS` variable
   */
  disableNodeWarnings: boolean
}
