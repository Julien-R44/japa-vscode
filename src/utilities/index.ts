import { TextDecoder } from 'util'
import { basename, dirname } from 'path'
import { window, workspace } from 'vscode'
import pkgUp from 'pkg-up'
import type { Uri } from 'vscode'

const decoder = new TextDecoder()

export async function getFileContent(uri: Uri) {
  const rawContent = await workspace.fs.readFile(uri)
  return decoder.decode(rawContent)
}

/**
 * Open and highlight the snapshot value in the snapshot file
 * for a given test
 */
export async function openSnapshotFile(options: {
  testPath: string
  testName?: string
  snapshotIndex?: number
}) {
  const testFileName = basename(options.testPath)
  const testDirname = dirname(options.testPath)
  const snapshotFileName = `${testFileName}.cjs`
  const snapshotLocation = `${testDirname}/__snapshots__/${snapshotFileName}`

  const textDocument = await workspace.openTextDocument(snapshotLocation)
  const snapshotIndex = options.snapshotIndex
  const snapshotName = options.testName

  const regexp = `exports\\[\`.+${snapshotName} ${snapshotIndex || 1}\`\\]`

  const snapshotRegex = new RegExp(regexp)
  const snapshotMatch = snapshotRegex.exec(textDocument.getText())

  if (!snapshotMatch) {
    return
  }

  const line = textDocument.positionAt(snapshotMatch.index)
  const snapshotLine = textDocument.lineAt(line.line)

  await window.showTextDocument(textDocument, { selection: snapshotLine.range })

  window.showTextDocument(textDocument)
}

/**
 * Returns the nearest directory containing a package.json file
 */
export function getNearestDirContainingPkgJson(options: { cwd: string }) {
  const nearestPkgJsonDir = pkgUp.sync({ cwd: options.cwd })
  if (!nearestPkgJsonDir) {
    return
  }

  return dirname(nearestPkgJsonDir)
}
