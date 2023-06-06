import { parse } from '@babel/parser'
import {
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionExpression,
  isIdentifier,
  isImportDeclaration,
  isMemberExpression,
  isStatement,
  isStringLiteral,
  isVariableDeclaration,
  isVariableDeclarator,
} from '@babel/types'
import traverse from '@babel/traverse'
import { GroupNode } from './nodes/group_node'
import { TestNode } from './nodes/test_node'
import { SnapshotMatchNode } from './nodes/snapshot_match_node'
import type { Ast, BabelTestGroupNode } from './contracts'
import type { Statement } from '@babel/types'

export class AstExtractor {
  /**
   * Generate an AST from the given source
   */
  private generateAst(source: string) {
    return parse(source, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'decoratorAutoAccessors',
        'importAssertions',
        ['decorators', { decoratorsBeforeExport: true }],
      ],
    })
  }

  /**
   * Is the file importing `test` from `@japa/runner`
   */
  private doesImportJapaRunner(ast: Ast) {
    return ast.program.body.some((node) => {
      const japaImportedViaEsm = isImportDeclaration(node) && node.source.value === '@japa/runner'

      const japaImportedViaCjs =
        isVariableDeclaration(node) &&
        isVariableDeclarator(node.declarations[0]) &&
        isCallExpression(node.declarations[0].init) &&
        isIdentifier(node.declarations[0].init.callee) &&
        node.declarations[0].init.callee.name === 'require' &&
        isStringLiteral(node.declarations[0].init.arguments[0]) &&
        node.declarations[0].init.arguments[0].value === '@japa/runner'

      return japaImportedViaEsm || japaImportedViaCjs
    })
  }

  /**
   * Returns a boolean telling if the test.group has a callback defined
   *
   * `test.group('Group')` => false
   * `test.group('Group', () => {})` => true
   */
  private doesTestGroupHasCallbackDefined(node: BabelTestGroupNode): node is BabelTestGroupNode & {
    expression: { arguments: [any, { body: Statement & { body: Statement[] } }] }
  } {
    const secondArgumentOfCallExpression = node.expression.arguments[1]

    const isSecondArgumentIsFunction =
      isArrowFunctionExpression(secondArgumentOfCallExpression) ||
      isFunctionExpression(secondArgumentOfCallExpression)

    return isSecondArgumentIsFunction && isStatement(secondArgumentOfCallExpression.body)
  }

  /**
   * Create a GroupNode instance, and extract tests inside it.
   */
  private createGroupNode(node: BabelTestGroupNode) {
    const group = new GroupNode(node)

    if (!this.doesTestGroupHasCallbackDefined(node)) {
      return group
    }

    const callbackBody = node.expression.arguments[1].body.body
    const { tests } = this.searchTestsAndGroups(callbackBody, { ignoreGroups: true })
    group.addTests(tests)

    return group
  }

  /**
   * Walk over the AST and search for tests and groups. Recursive method.
   */
  private searchTestsAndGroups(nodes: Statement[], options: { ignoreGroups?: boolean } = {}) {
    const tests: TestNode[] = []
    const groups: GroupNode[] = []

    for (const node of nodes) {
      if (GroupNode.isTestGroupNode(node) && !options.ignoreGroups) {
        groups.push(this.createGroupNode(node))
      } else if (TestNode.isTestNode(node)) {
        tests.push(new TestNode(node))
      }
    }

    return { tests, groups }
  }

  /**
   * Walk over the AST and search for snapshot match calls expressions
   */
  private searchSnapshotCalls(ast: Ast, tests: TestNode[]) {
    const snapshotCalls: SnapshotMatchNode[] = []

    traverse(ast, {
      CallExpression(path) {
        const node = path.node
        if (
          SnapshotMatchNode.isAssertMatchSnapshot(node) ||
          SnapshotMatchNode.isExpectMatchSnapshot(node)
        ) {
          snapshotCalls.push(new SnapshotMatchNode(node, tests))
        }
      },
    })

    return snapshotCalls
  }

  /**
   * Extract tests and groups from the given source
   */
  public extract(source: string) {
    const ast = this.generateAst(source)

    if (!this.doesImportJapaRunner(ast)) {
      throw new Error('`test` from @japa/runner is not imported')
    }

    const testAndGroups = this.searchTestsAndGroups(ast.program.body)

    const allTests = [
      ...testAndGroups.tests,
      ...testAndGroups.groups.flatMap((group) => group.tests),
    ]

    const snapshotCalls = this.searchSnapshotCalls(ast, allTests)

    return { ...testAndGroups, snapshots: snapshotCalls }
  }
}
