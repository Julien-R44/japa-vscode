import { TextDecoder } from 'util'
import { Uri, workspace } from 'vscode'

const decoder = new TextDecoder()

export async function getFileContent(uri: Uri) {
  const rawContent = await workspace.fs.readFile(uri)
  return decoder.decode(rawContent)
}
