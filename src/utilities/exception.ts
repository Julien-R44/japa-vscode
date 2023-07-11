export class Exception extends Error {
  /**
   * Static properties to defined on the exception once
   * and then re-use them
   */
  declare static code?: string
  declare static message?: string

  /**
   * Name of the class that raised the exception.
   */
  override name: string

  /**
   * A machine readable error code. This will allow the error handling logic
   * to narrow down exceptions based upon the error code.
   */
  declare code?: string

  constructor(message?: string, options?: ErrorOptions & { code?: string }) {
    super(message, options)

    const ErrorConstructor = this.constructor as typeof Exception

    this.name = ErrorConstructor.name
    this.message = message || ErrorConstructor.message || ''

    const code = options?.code || ErrorConstructor.code
    if (code !== undefined) {
      this.code = code
    }

    Error.captureStackTrace(this, ErrorConstructor)
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  override toString() {
    if (this.code) {
      return `${this.name} [${this.code}]: ${this.message}`
    }
    return `${this.name}: ${this.message}`
  }
}
