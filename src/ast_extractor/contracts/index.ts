import type {
  CallExpression,
  ExpressionStatement,
  Identifier,
  MemberExpression,
  SourceLocation,
} from '@babel/types'
import type { parse } from '@babel/parser'

export type BabelTestGroupNode = ExpressionStatement & {
  expression: CallExpression & {
    callee: MemberExpression & {
      property: Identifier
    }
  }
}

export type BabelTestNode = ExpressionStatement & {
  expression: CallExpression
}

export type Ast = ReturnType<typeof parse>

export type Location = Omit<SourceLocation, 'filename' | 'identifierName'>
