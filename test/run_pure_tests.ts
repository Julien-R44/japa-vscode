import { join } from 'path'
import { assert } from '@japa/assert'
import { snapshot } from '@japa/snapshot'
import { specReporter } from '@japa/spec-reporter'
import { configure, processCliArgs, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['./test/suites/pure/**/*.spec.ts'],
    plugins: [
      assert(),
      snapshot(),
      fileSystem({
        basePath: join(__dirname, 'fixtures/tests'),
        autoClean: true,
      }),
    ],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
  },
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
