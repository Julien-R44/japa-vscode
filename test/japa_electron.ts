import * as path from 'path'
import { assert } from '@japa/assert'
import { specReporter } from '@japa/spec-reporter'
import { configure, run as runJapa } from '@japa/runner'

export async function run() {
  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((resolve) => {
    configure({
      files: [`**/*/(functional|unit)/**/*.test.js`],
      cwd: testsRoot,
      forceExit: false,
      plugins: [assert()],
      reporters: [specReporter()],
      teardown: [
        (runner) => {
          runner.end()
          resolve(true)
        },
      ],
      importer: (filePath) => import(filePath),
    })

    runJapa()
  })
}
