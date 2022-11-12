/** eslint-disable */
import { test } from '@japa/runner'
// @ts-ignore
import json from './foo.json' assert { type: 'json' }

test('Root test - 1', ({ assert }) => assert.isTrue(true))
