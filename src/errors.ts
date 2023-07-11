import { Exception } from './utilities/exception'

export const E_NDJSON_NOT_ACTIVATED = class NdjsonReporterNotActivated extends Exception {
  static override message = 'Make sure to register the ndjson reporter in your Japa config file'
  static override code = 'E_NDJSON_NOT_ACTIVATED'
}
