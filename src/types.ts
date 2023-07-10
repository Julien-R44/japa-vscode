import type { TestItem } from 'vscode'

/**
 * A frame from Youch
 */
export type Frame = StackFrame

/**
 * Options accepted by NdJsonRunner
 */
export interface NdJsonRunnerOption {
  files?: string[]
  groups?: string[]
  tests?: string[]
  cwd?: string
  script?: string
  debug?: boolean
}

/**
 * Type for the 'test:end' event of NdJsonRunner
 */
export interface TestEndEvent {
  event: 'test:end'
  filePath: string
  relativePath: string
  title: { original: string; expanded: string }
  duration: number
  isTodo: boolean
  isPinned: boolean
  retries: number
  errors: any[]
}

/**
 * Type for the 'test:success' of NdJsonRunner
 */
export interface TestSuccessEvent extends TestEndEvent {}

/**
 * Type for the 'test:failure' of NdJsonRunner
 */
export interface TestFailureEvent extends TestEndEvent {
  mainError: { message: string; frame?: Frame } & (
    | { isAssertionError: true; actual: string; expected: string }
    | { isAssertionError: false }
  )
}

/**
 * Data associated with a TestItem
 */
export interface TestData {
  type: 'file' | 'group' | 'test'
  testName?: string
  groupName?: string
  location?: any
  filePath?: string
}

/**
 * Linked TestItem and TestData
 */
export interface TestBag {
  testItem: TestItem
  testData: TestData
}

export interface CategorizedTestBags {
  fileTestBags: TestBag[]
  groupTestBags: TestBag[]
  testTestBags: TestBag[]
}
