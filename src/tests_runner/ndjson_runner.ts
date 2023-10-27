/* eslint-disable sonarjs/no-duplicate-string */

import execa from 'execa'
import Emittery from 'emittery'
import ErrorStackParser from 'error-stack-parser'

import { unique } from '../utilities/pure'
import { E_NDJSON_NOT_ACTIVATED } from '../errors'
import type { NdJsonRunnerOption, TestEndEvent, TestFailureEvent, TestSuccessEvent } from '../types'

export class NdJsonExecutor {
  #options: NdJsonRunnerOption
  #japaProcess?: execa.ExecaChildProcess
  emitter = new Emittery()

  constructor(options: NdJsonRunnerOption) {
    this.#options = { cwd: process.cwd(), script: 'test', ...options }
  }

  /**
   * Register a callback to be called when a test ends
   */
  onTestEnd(cb: (test: TestEndEvent) => any) {
    this.emitter.on('test:end', cb)
    return this
  }

  /**
   * Register a callback to be called when a test ends successfully
   */
  onTestSuccess(cb: (test: TestSuccessEvent) => any) {
    this.emitter.on('test:success', cb)
    return this
  }

  /**
   * Register a callback to be called when a test fails
   */
  onTestFailure(cb: (test: TestFailureEvent) => any) {
    this.emitter.on('test:failure', cb)
    return this
  }

  /**
   * When a test is marked as todo
   */
  onTestTodo(cb: (test: TestEndEvent) => any) {
    this.emitter.on('test:todo', cb)
    return this
  }

  /**
   * When a test is skipped
   */
  onTestSkip(cb: (test: TestEndEvent) => any) {
    this.emitter.on('test:skip', cb)
    return this
  }

  /**
   * Register a callback to be called when a new line is received
   */
  onNewLine(cb: (line: string) => any) {
    this.emitter.on('new:line', cb)
    return this
  }

  /**
   * Register a callback to be called when a new line that is
   * not emitted by Japa itself is received
   */
  onNewUserLine(cb: (line: string) => any) {
    this.emitter.on('new:line:user', cb)
    return this
  }

  /**
   * Register a callback to be called when the test run ends
   */
  onEnd(cb: () => any) {
    this.emitter.on('run:end', cb)
    return this
  }

  /**
   * Parse the error stack and return the first app frame
   */
  async #parseErrorStack(rawError: any) {
    if (!rawError.stack) {
      return
    }

    const error = new Error(rawError.message)
    error.stack = rawError.stack

    const frames = ErrorStackParser.parse(error)
    return frames.find((frame) => {
      const isNodeModule = frame.fileName?.includes('node_modules/')
      const isNodeInternals = frame.isNative || frame.isEval || frame.fileName?.startsWith('node:')

      return !isNodeModule && !isNodeInternals
    })
  }

  /**
   * Is the given error an assertion error?
   */
  #isAssertionError(error: any) {
    return error?.actual !== undefined && error?.expected !== undefined
  }

  /**
   * Prepare the assertion error to be displayed in the UI
   */
  #parseAssertionError(error: any) {
    const stringifyError = (error: any) =>
      typeof error === 'string' ? error : JSON.stringify(error, null, 2)

    const actual = stringifyError(error.actual)
    const expected = stringifyError(error.expected)

    return { actual, expected, message: error.message }
  }

  /**
   * Process a single line of the ndjson output
   */
  async #processLine(line: string) {
    this.emitter.emit('new:line', line)

    const isJson = line.startsWith('{')
    if (!isJson) {
      return this.emitter.emit('new:line:user', line)
    }

    const parsedLine = JSON.parse(line)

    /**
     * If the line has aggregates, it means that the test run has ended
     */
    const isEnd = !!parsedLine.aggregates
    if (isEnd) {
      this.emitter.emit('run:end')
      return
    }

    const isSuiteStart = parsedLine.event === 'suite:start'
    const isSuiteEnd = parsedLine.event === 'suite:end'
    const isGroupStart = parsedLine.event === 'group:start'
    const isTestEnd = parsedLine.event === 'test:end'
    const isTodo = parsedLine.isTodo
    const hasError = parsedLine.errors?.length > 0
    const isSkipped = parsedLine.isSkipped

    if (!isSuiteStart && !isSuiteEnd && !isGroupStart && !isTestEnd) {
      this.emitter.emit('new:line:user', line)
      return
    }

    if (!isTestEnd) {
      return
    }

    this.emitter.emit('test:end', parsedLine)

    if (isTodo) {
      this.emitter.emit('test:todo', parsedLine)
      return
    }

    if (isSkipped) {
      this.emitter.emit('test:skip', parsedLine)
      return
    }

    if (!hasError) {
      this.emitter.emit('test:success', parsedLine)
    }

    /**
     * If the test has errors, we need to parse the error stack and
     * emit the "test:failure" event
     */
    if (isTestEnd && hasError) {
      const error = parsedLine.errors[0].error
      const isAssertionError = this.#isAssertionError(error)

      const mainError = {
        isAssertionError,
        frame: await this.#parseErrorStack(error),
        ...(isAssertionError ? this.#parseAssertionError(error) : { message: error.message }),
      }

      this.emitter.emit('test:failure', { ...parsedLine, mainError })
    }
  }

  /**
   * Prepare the command arguments to be passed to Japa
   */
  #prepareCommandArgs() {
    const args = ['run', this.#options.script!, '--', '--reporters', 'ndjson']

    if (this.#options.files) {
      args.push('--files', unique(this.#options.files).join(','))
    }

    if (this.#options.groups) {
      args.push('--groups', unique(this.#options.groups).join(','))
    }

    if (this.#options.tests) {
      args.push('--tests', unique(this.#options.tests).join(','))
    }

    return args
  }

  /**
   * Kill the japa process
   */
  kill() {
    this.#japaProcess?.kill()
  }

  /**
   * Run the tests with japa and ndjson reporter
   */
  async run() {
    const args = this.#prepareCommandArgs()
    this.#japaProcess = execa('npm', args, { cwd: this.#options.cwd })
    let error: Error | null = null

    this.#japaProcess.stdout?.on('data', async (data) => {
      const content = data.toString()

      /**
       * Not sure why but words in the output are getting split into multiple lines ?
       * Tried to disable colors, but that didn't help. So for now just compare
       * like this
       */
      if (content.includes('Error:\nInvalid\nreporter\n"ndjson"')) {
        error = new E_NDJSON_NOT_ACTIVATED()
      }

      const lines = content.split('\n').filter(Boolean)

      for (const line of lines) {
        await this.#processLine(line)
      }
    })

    try {
      await this.#japaProcess
    } catch (error) {
      console.error('[NdJsonExecutor]', error)
    }

    if (error) throw error
  }
}
