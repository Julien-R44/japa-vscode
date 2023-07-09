import execa from 'execa'
import Emittery from 'emittery'
import Youch from 'youch'
import { unique } from '../utilities/pure'
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
   * Register a callback to be called when the test run ends
   */
  onEnd(cb: () => any) {
    this.emitter.on('run:end', cb)
    return this
  }

  /**
   * Parse the error stack and return the first app frame
   */
  async #parseErrorStack(error: Error) {
    if (!error.stack) {
      return
    }

    const error1 = new Error(error.message)
    error1.stack = error.stack

    const youch = new Youch(error1, {})
    const youchErr = await youch.toJSON()

    return youchErr.error.frames.find((frame) => frame.isApp)
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
    if (!isJson) return

    const parsedLine = JSON.parse(line)

    /**
     * If the line has aggregates, it means that the test run has ended
     */
    const isEnd = !!parsedLine.aggregates
    if (isEnd) {
      this.emitter.emit('run:end')
      return
    }

    const isTestEnd = parsedLine.event === 'test:end'
    const hasError = parsedLine.errors?.length > 0
    const isSkipped = parsedLine.isSkipped

    if (!isTestEnd) {
      return
    }

    this.emitter.emit('test:end', parsedLine)

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
    const args = ['run', this.#options.script!, '--', '--reporter', 'ndjson']

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

    this.#japaProcess.stdout?.on('data', async (data) => {
      const lines = data.toString().split('\n').filter(Boolean)

      for (const line of lines) {
        await this.#processLine(line)
      }
    })

    try {
      await this.#japaProcess
    } catch (error) {}
  }
}
