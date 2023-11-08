exports[`Ast Extractor > basic 1`] = `{
  "groups": [
    GroupNode {
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
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 8,
              "line": 7,
            },
            "start": {
              "column": 6,
              "line": 5,
            },
          },
          "title": "My Test",
        },
      ],
      "title": "My super group",
    },
  ],
  "snapshots": [],
  "tests": [],
}`

exports[`Ast Extractor > cjs-js 1`] = `{
  "groups": [
    GroupNode {
      "location": {
        "end": {
          "column": 6,
          "line": 15,
        },
        "start": {
          "column": 4,
          "line": 10,
        },
      },
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 60,
              "line": 11,
            },
            "start": {
              "column": 6,
              "line": 11,
            },
          },
          "title": "My Test 1",
        },
        TestNode {
          "location": {
            "end": {
              "column": 28,
              "line": 12,
            },
            "start": {
              "column": 6,
              "line": 12,
            },
          },
          "title": "My Test 2",
        },
        TestNode {
          "location": {
            "end": {
              "column": 39,
              "line": 13,
            },
            "start": {
              "column": 6,
              "line": 13,
            },
          },
          "title": "My Test 3",
        },
        TestNode {
          "location": {
            "end": {
              "column": 46,
              "line": 14,
            },
            "start": {
              "column": 6,
              "line": 14,
            },
          },
          "title": "My Test 4",
        },
      ],
      "title": "My super group 1",
    },
    GroupNode {
      "location": {
        "end": {
          "column": 6,
          "line": 25,
        },
        "start": {
          "column": 4,
          "line": 17,
        },
      },
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 57,
              "line": 21,
            },
            "start": {
              "column": 6,
              "line": 21,
            },
          },
          "title": "Test 1",
        },
        TestNode {
          "location": {
            "end": {
              "column": 25,
              "line": 22,
            },
            "start": {
              "column": 6,
              "line": 22,
            },
          },
          "title": "Test 2",
        },
        TestNode {
          "location": {
            "end": {
              "column": 36,
              "line": 23,
            },
            "start": {
              "column": 6,
              "line": 23,
            },
          },
          "title": "Test 3",
        },
        TestNode {
          "location": {
            "end": {
              "column": 43,
              "line": 24,
            },
            "start": {
              "column": 6,
              "line": 24,
            },
          },
          "title": "Test 4",
        },
      ],
      "title": "My super group 2",
    },
  ],
  "snapshots": [],
  "tests": [
    TestNode {
      "location": {
        "end": {
          "column": 62,
          "line": 6,
        },
        "start": {
          "column": 4,
          "line": 6,
        },
      },
      "title": "Root test - 1",
    },
    TestNode {
      "location": {
        "end": {
          "column": 41,
          "line": 7,
        },
        "start": {
          "column": 4,
          "line": 7,
        },
      },
      "title": "Root test - 2",
    },
    TestNode {
      "location": {
        "end": {
          "column": 30,
          "line": 8,
        },
        "start": {
          "column": 4,
          "line": 8,
        },
      },
      "title": "Root test - 3",
    },
  ],
}`

exports[`Ast Extractor > import assertions 1`] = `{
  "groups": [],
  "snapshots": [],
  "tests": [
    TestNode {
      "location": {
        "end": {
          "column": 61,
          "line": 5,
        },
        "start": {
          "column": 3,
          "line": 5,
        },
      },
      "title": "Root test - 1",
    },
  ],
}`

exports[`Ast Extractor > multiple groups and root 1`] = `{
  "groups": [
    GroupNode {
      "location": {
        "end": {
          "column": 6,
          "line": 15,
        },
        "start": {
          "column": 4,
          "line": 10,
        },
      },
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 60,
              "line": 11,
            },
            "start": {
              "column": 6,
              "line": 11,
            },
          },
          "title": "My Test 1",
        },
        TestNode {
          "location": {
            "end": {
              "column": 28,
              "line": 12,
            },
            "start": {
              "column": 6,
              "line": 12,
            },
          },
          "title": "My Test 2",
        },
        TestNode {
          "location": {
            "end": {
              "column": 39,
              "line": 13,
            },
            "start": {
              "column": 6,
              "line": 13,
            },
          },
          "title": "My Test 3",
        },
        TestNode {
          "location": {
            "end": {
              "column": 46,
              "line": 14,
            },
            "start": {
              "column": 6,
              "line": 14,
            },
          },
          "title": "My Test 4",
        },
      ],
      "title": "My super group 1",
    },
    GroupNode {
      "location": {
        "end": {
          "column": 6,
          "line": 25,
        },
        "start": {
          "column": 4,
          "line": 17,
        },
      },
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 57,
              "line": 21,
            },
            "start": {
              "column": 6,
              "line": 21,
            },
          },
          "title": "Test 1",
        },
        TestNode {
          "location": {
            "end": {
              "column": 25,
              "line": 22,
            },
            "start": {
              "column": 6,
              "line": 22,
            },
          },
          "title": "Test 2",
        },
        TestNode {
          "location": {
            "end": {
              "column": 36,
              "line": 23,
            },
            "start": {
              "column": 6,
              "line": 23,
            },
          },
          "title": "Test 3",
        },
        TestNode {
          "location": {
            "end": {
              "column": 43,
              "line": 24,
            },
            "start": {
              "column": 6,
              "line": 24,
            },
          },
          "title": "Test 4",
        },
      ],
      "title": "My super group 2",
    },
  ],
  "snapshots": [],
  "tests": [
    TestNode {
      "location": {
        "end": {
          "column": 62,
          "line": 6,
        },
        "start": {
          "column": 4,
          "line": 6,
        },
      },
      "title": "Root test - 1",
    },
    TestNode {
      "location": {
        "end": {
          "column": 41,
          "line": 7,
        },
        "start": {
          "column": 4,
          "line": 7,
        },
      },
      "title": "Root test - 2",
    },
    TestNode {
      "location": {
        "end": {
          "column": 30,
          "line": 8,
        },
        "start": {
          "column": 4,
          "line": 8,
        },
      },
      "title": "Root test - 3",
    },
  ],
}`

exports[`Ast Extractor > root tests 1`] = `{
  "groups": [],
  "snapshots": [],
  "tests": [
    TestNode {
      "location": {
        "end": {
          "column": 62,
          "line": 6,
        },
        "start": {
          "column": 4,
          "line": 6,
        },
      },
      "title": "Root test - 1",
    },
    TestNode {
      "location": {
        "end": {
          "column": 41,
          "line": 7,
        },
        "start": {
          "column": 4,
          "line": 7,
        },
      },
      "title": "Root test - 2",
    },
    TestNode {
      "location": {
        "end": {
          "column": 29,
          "line": 8,
        },
        "start": {
          "column": 4,
          "line": 8,
        },
      },
      "title": "Root test - ",
    },
    TestNode {
      "location": {
        "end": {
          "column": 38,
          "line": 9,
        },
        "start": {
          "column": 4,
          "line": 9,
        },
      },
      "title": "Root test - xx",
    },
  ],
}`

exports[`Ast Extractor > jsx file 1`] = `{
  "groups": [
    GroupNode {
      "location": {
        "end": {
          "column": 6,
          "line": 12,
        },
        "start": {
          "column": 4,
          "line": 4,
        },
      },
      "tests": [
        TestNode {
          "location": {
            "end": {
              "column": 9,
              "line": 7,
            },
            "start": {
              "column": 6,
              "line": 5,
            },
          },
          "title": "foo",
        },
        TestNode {
          "location": {
            "end": {
              "column": 9,
              "line": 11,
            },
            "start": {
              "column": 6,
              "line": 9,
            },
          },
          "title": "foo2",
        },
      ],
      "title": "group",
    },
  ],
  "snapshots": [],
  "tests": [],
}`

