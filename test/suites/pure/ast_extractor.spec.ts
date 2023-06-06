import { test } from '@japa/runner'
import { AstExtractor } from '../../../src/ast_extractor'

test.group('Ast Extractor', () => {
  test('basic', async ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    test.group('My super group', () => {
      test('My Test', ({ assert }) => {
        assert.isTrue(true)
      })
    })`

    const result = new AstExtractor().extract(code)
    assert.snapshot(result).match()
  })

  test('cjs-js', async ({ assert }) => {
    const code = `
    const { test } = require('@japa/runner')

    const hey = () => {}

    test('Root test - 1', ({ assert }) => assert.isTrue(true))
    test('Root test - 2', function () {})
    test('Root test - 3', hey)

    test.group('My super group 1', () => {
      test('My Test 1', ({ assert }) => assert.isTrue(true))
      test('My Test 2', hey)
      test('My Test 3', function () {})
      test('My Test 4', function () {}).skip()
    })

    test.group('My super group 2', (group) => {
      group.each.setup(() => {})
      group.each.teardown(() => {})

      test('Test 1', ({ assert }) => assert.isTrue(true))
      test('Test 2', hey)
      test('Test 3', function () {})
      test('Test 4', function () {}).skip()
    })
    `

    assert.snapshot(new AstExtractor().extract(code)).match()
  })

  test('import assertions', ({ assert }) => {
    const code = `
   import { test } from '@japa/runner'
   import json from './foo.json' assert { type: 'json' }

   test('Root test - 1', ({ assert }) => assert.isTrue(true))
   `

    assert.snapshot(new AstExtractor().extract(code)).match()
  })

  test('multiple groups and root', async ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    const hey = () => {}

    test('Root test - 1', ({ assert }) => assert.isTrue(true))
    test('Root test - 2', function () {})
    test('Root test - 3', hey)

    test.group('My super group 1', () => {
      test('My Test 1', ({ assert }) => assert.isTrue(true))
      test('My Test 2', hey)
      test('My Test 3', function () {})
      test('My Test 4', function () {}).skip()
    })

    test.group('My super group 2', (group) => {
      group.each.setup(() => {})
      group.each.teardown(() => {})

      test('Test 1', ({ assert }) => assert.isTrue(true))
      test('Test 2', hey)
      test('Test 3', function () {})
      test('Test 4', function () {}).skip()
    })
    `

    assert.snapshot(new AstExtractor().extract(code)).match()
  })

  test('root tests', async ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    const hey = () => {}

    test('Root test - 1', ({ assert }) => assert.isTrue(true))
    test('Root test - 2', function () {})
    test('Root test - ', hey)
    test('Root test - xx', hey).skip()
    `

    assert.snapshot(new AstExtractor().extract(code)).match()
  })
})
