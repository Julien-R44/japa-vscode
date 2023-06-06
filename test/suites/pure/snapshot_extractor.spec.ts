import { test } from '@japa/runner'
import { AstExtractor } from '../../../src/ast_extractor'

test.group('Snapshot extractor', () => {
  test('basic', ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    test('foo', ({ assert }) => {
      assert.snapshot('foo').match()
    })
    `

    const extractor = new AstExtractor()
    const result = extractor.extract(code)

    assert.snapshot(result.snapshots).matchInline(`
      [
        SnapshotMatchNode {
          "index": 1,
          "location": {
            "end": {
              "column": 34,
              "line": 5,
            },
            "start": {
              "column": 29,
              "line": 5,
            },
          },
          "test": TestNode {
            "location": {
              "end": {
                "column": 6,
                "line": 6,
              },
              "start": {
                "column": 4,
                "line": 4,
              },
            },
            "title": "foo",
          },
        },
      ]
    `)
  })

  test('multiple', ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    test('foo', ({ assert }) => {
      assert.snapshot('foo').match()
      assert.snapshot('foo').match()
      assert.snapshot('foo').match()
    })
    `

    const extractor = new AstExtractor()
    const result = extractor.extract(code)

    assert.snapshot(result.snapshots).matchInline(`
      [
        SnapshotMatchNode {
          "index": 1,
          "location": {
            "end": {
              "column": 34,
              "line": 5,
            },
            "start": {
              "column": 29,
              "line": 5,
            },
          },
          "test": TestNode {
            "location": {
              "end": {
                "column": 6,
                "line": 8,
              },
              "start": {
                "column": 4,
                "line": 4,
              },
            },
            "title": "foo",
          },
        },
        SnapshotMatchNode {
          "index": 2,
          "location": {
            "end": {
              "column": 34,
              "line": 6,
            },
            "start": {
              "column": 29,
              "line": 6,
            },
          },
          "test": TestNode {
            "location": {
              "end": {
                "column": 6,
                "line": 8,
              },
              "start": {
                "column": 4,
                "line": 4,
              },
            },
            "title": "foo",
          },
        },
        SnapshotMatchNode {
          "index": 3,
          "location": {
            "end": {
              "column": 34,
              "line": 7,
            },
            "start": {
              "column": 29,
              "line": 7,
            },
          },
          "test": TestNode {
            "location": {
              "end": {
                "column": 6,
                "line": 8,
              },
              "start": {
                "column": 4,
                "line": 4,
              },
            },
            "title": "foo",
          },
        },
      ]
    `)
  })

  test('with expect', ({ assert }) => {
    const code = `
    import { test } from '@japa/runner'

    test('foo', ({ expect }) => {
      expect('foo').toMatchSnapshot()
    })`

    const extractor = new AstExtractor()
    const result = extractor.extract(code)

    assert.snapshot(result.snapshots).matchInline(`
      [
        SnapshotMatchNode {
          "index": 1,
          "location": {
            "end": {
              "column": 35,
              "line": 5,
            },
            "start": {
              "column": 20,
              "line": 5,
            },
          },
          "test": TestNode {
            "location": {
              "end": {
                "column": 6,
                "line": 6,
              },
              "start": {
                "column": 4,
                "line": 4,
              },
            },
            "title": "foo",
          },
        },
      ]
    `)
  })
})
