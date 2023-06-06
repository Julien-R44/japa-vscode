import {
  type CallExpression,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
} from '@babel/types'
import { convertLocation } from '../helpers'
import { isWithinLocation } from '../../utilities/pure'
import type { TestNode } from './test_node'
import type { BabelSnapshotMatchNode, Location } from '../contracts'

export class SnapshotMatchNode {
  static #testCounter = new Map<TestNode, number>()

  location: Location
  test: TestNode
  index: number

  /**
   * Check if the following CallExpression is a call to
   * assert.snapshot('foo').match()
   */
  static isAssertMatchSnapshot(node: CallExpression): node is BabelSnapshotMatchNode {
    return (
      isMemberExpression(node.callee) &&
      isCallExpression(node.callee.object) &&
      isMemberExpression(node.callee.object.callee) &&
      isIdentifier(node.callee.object.callee.property) &&
      isIdentifier(node.callee.object.callee.object) &&
      isIdentifier(node.callee.property) &&
      node.callee.property.name === 'match' &&
      node.callee.object.callee.property.name === 'snapshot' &&
      node.callee.object.callee.object.name === 'assert'
    )
  }

  /**
   * Check if the following CallExpression is a call to
   * expect('foo').toMatchSnapshot()
   */
  static isExpectMatchSnapshot(node: CallExpression): node is BabelSnapshotMatchNode {
    return (
      isMemberExpression(node.callee) &&
      isIdentifier(node.callee.property) &&
      node.callee.property.name === 'toMatchSnapshot'
    )
  }

  constructor(node: BabelSnapshotMatchNode, tests: TestNode[]) {
    this.location = convertLocation(node.callee.property.loc!)
    this.test = tests.find((test) => isWithinLocation(this.location, test.location))!

    SnapshotMatchNode.#testCounter.set(
      this.test,
      (SnapshotMatchNode.#testCounter.get(this.test) ?? 0) + 1
    )

    this.index = SnapshotMatchNode.#testCounter.get(this.test)!
  }
}
