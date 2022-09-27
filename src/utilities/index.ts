import { TextDecoder } from 'util'
import { workspace } from 'vscode'
import type { Uri } from 'vscode'

const decoder = new TextDecoder()

export async function getFileContent(uri: Uri) {
  const rawContent = await workspace.fs.readFile(uri)
  return decoder.decode(rawContent)
}
