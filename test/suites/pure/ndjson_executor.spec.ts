/* eslint-disable sonarjs/no-duplicate-string */

import { join } from 'path'
import { test } from '@japa/runner'
import dedent from 'dedent'
import { NdJsonExecutor } from '../../../src/tests_runner/ndjson_runner'

test.group('Ndjson Executor', (group) => {
  group.tap((test) => test.timeout(3000).skip(!!process.env.CI))

  test('Basic', async ({ assert, fs }) => {
    assert.plan(6)

    await fs.create(
      'maths.spec.js',
      dedent/* js */ `
      import { test } from '@japa/runner'

      test.group('Maths - basic', () => {
        test('add two numbers', ({ assert }) => assert.equal(1 + 1, 2))
        test('subtract two numbers', async ({ assert }) => assert.equal(1 - 1, 0))
        test('multiply two numbers', ({ assert }) => assert.equal(1 * 1, 1))
      })`
    )

    const ndJsonExecutor = new NdJsonExecutor({
      cwd: join(__dirname, '../../fixtures'),
      files: ['maths.spec.js'],
    })
      .onTestEnd(() => assert.isTrue(true))
      .onTestSuccess(() => assert.isTrue(true))

    await ndJsonExecutor.run()
  })

  test('process todos and skips', async ({ assert, fs }) => {
    assert.plan(2)

    await fs.create(
      'maths.spec.js',
      dedent/* js */ `
      import { test } from '@japa/runner'

      test.group('Maths - basic', () => {
        test('add two numbers', ({ assert }) => assert.equal(1 + 1, 2))
        test('subtract two numbers', async ({ assert }) => assert.equal(1 - 1, 0))
        test('multiply two numbers', ({ assert }) => assert.equal(1 * 1, 1))
      })`
    )

    await fs.create(
      'maths.spec.js',
      dedent/* js */ `
        import { test } from '@japa/runner'

        test('todo')
        test('skip', () => {}).skip(true)
      `
    )

    const ndJsonExecutor = new NdJsonExecutor({
      cwd: join(__dirname, '../../fixtures'),
      files: ['maths.spec.js'],
    })
      .onTestSkip((test) => {
        assert.equal(test.title.original, 'skip')
      })
      .onTestTodo((test) => {
        assert.equal(test.title.original, 'todo')
      })

    await ndJsonExecutor.run()
  })

  test('Parse assertions errors', async ({ assert, fs }) => {
    let errors = 0

    await fs.create(
      'maths.spec.js',
      dedent/* js */ `
      import { test } from '@japa/runner'

      test.group('Maths - basic', () => {
        test('add two numbers', ({ assert }) => assert.equal(1 + 1, 4))
        test('subtract two numbers', async ({ assert }) => assert.equal(1 - 1, 4))
        test('multiply two numbers', ({ assert }) => assert.equal(1 * 1, 1))
      })`
    )

    const ndJsonExecutor = new NdJsonExecutor({
      cwd: join(__dirname, '../../fixtures'),
      groups: ['Maths - basic'],
      files: ['maths.spec.js'],
    }).onTestFailure((test) => {
      errors++

      const title = test.title.original
      assert.isTrue(title === 'add two numbers' || title === 'subtract two numbers')

      if (!test.mainError.isAssertionError) {
        assert.fail('Expected assertion error')
        return
      }

      if (title === 'add two numbers') {
        assert.deepEqual(test.mainError.actual, '2')
        assert.deepEqual(test.mainError.expected, '4')
        assert.deepEqual(test.mainError.message, 'expected 2 to equal 4')
        assert.include(test.mainError.frame!.fileName, 'fixtures/tests/maths.spec.js')
        assert.deepEqual(test.mainError.frame!.lineNumber, 4)
      }

      if (title === 'subtract two numbers') {
        assert.deepEqual(test.mainError.actual, '0')
        assert.deepEqual(test.mainError.expected, '4')
        test.mainError.message.includes('expected 0 to equal 4')
        assert.include(test.mainError.frame!.fileName, 'fixtures/tests/maths.spec.js')
        assert.deepEqual(test.mainError.frame!.lineNumber, 5)
      }
    })

    await ndJsonExecutor.run()

    assert.equal(errors, 2)
  })

  test('Parse generic errors', async ({ assert, fs }) => {
    await fs.create(
      'maths.spec.js',
      dedent/* js */ `
      import { test } from '@japa/runner'

      test('add two numbers', ({ assert }) => {
        const f = null
        f.toString()
      })`
    )

    const ndJsonExecutor = new NdJsonExecutor({
      cwd: join(__dirname, '../../fixtures'),
      files: ['maths.spec.js'],
    }).onTestFailure((test) => {
      assert.equal(test.title.original, 'add two numbers')
      assert.equal(test.mainError.message, "Cannot read properties of null (reading 'toString')")
      assert.include(test.mainError.frame!.fileName, 'fixtures/tests/maths.spec.js')
      assert.deepEqual(test.mainError.frame!.lineNumber, 5)
    })

    await ndJsonExecutor.run()
  })

  test('Throw if ndjson reporter is not activated', async ({ assert, fs }) => {
    await fs.create(
      'config.js',
      dedent/* js */ `
        import { configure, processCLIArgs, run } from '@japa/runner'
        import { assert } from '@japa/assert'
        import { spec, dot, ndjson } from '@japa/runner/reporters'

        processCLIArgs(process.argv.splice(2))
        configure({
          files: ['tests/**/*.spec.js'],
          plugins: [assert()],
          reporters: {
            activated: ['spec'],
            list: [spec()]
          }
        })

        run()
      `
    )

    const ndJsonExecutor = new NdJsonExecutor({
      cwd: join(__dirname, '../../fixtures'),
      script: 'test-fs',
    })

    await assert.rejects(
      async () => ndJsonExecutor.run(),
      /Make sure to register the ndjson reporter in your Japa config file/
    )
  })
})
