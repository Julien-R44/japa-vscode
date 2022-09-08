import {
  RelativePattern,
  tests,
  Uri,
  workspace,
  TestController as VSTestController,
  TestItem,
} from 'vscode'
import { TestsExtractor } from '../tests_extractor'
import { TestNode } from '../tests_extractor/nodes/test_node'
import { getFileContent } from '../utilities'

export class TestController {
  public controller: VSTestController
  private extractor: TestsExtractor

  /**
   * In this function, we'll get the file TestItem if we've already found it,
   * otherwise we'll create it with `canResolveChildren = true` to indicate it
   * can be passed to the `controller.resolveHandler` to gets its children.
   */
  private getOrCreateFile(uri: Uri) {
    const existing = this.controller.items.get(uri.toString())
    if (existing) {
      return existing
    }

    const file = this.controller.createTestItem(uri.toString(), uri.path.split('/').pop()!, uri)
    file.canResolveChildren = true
    return file
  }

  /**
   * Executed when the extension is activated.
   * Will discover all test files in the workspace and add them to the test explorer.
   * Tests and groups will not be discovered at this time
   */
  private async discoverAllFilesInWorkspace() {
    if (!workspace.workspaceFolders) {
      return []
    }

    const promises = workspace.workspaceFolders.map(async (workspaceFolder) => {
      const pattern = new RelativePattern(workspaceFolder, '**/*.{spec,test}.{ts,js}')
      const watcher = workspace.createFileSystemWatcher(pattern)

      watcher.onDidCreate((uri) => this.getOrCreateFile(uri))
      watcher.onDidChange((uri) => this.parseTestsInFileContents(this.getOrCreateFile(uri)))
      watcher.onDidDelete((uri) => this.controller.items.delete(uri.toString()))

      const files = await workspace.findFiles(pattern, '**/{node_modules,dist,build,out}/**')
      for (const file of files) {
        this.controller.items.add(this.getOrCreateFile(file))
      }

      return watcher
    })

    return Promise.all(promises)
  }

  /**
   * Convert a list of TestNodes ( TestsExtractor ) to TestItems ( VSCode )
   */
  private createTestItemsFromNodes(nodes: TestNode[], parent: TestItem) {
    for (const node of nodes) {
      const uri = parent.uri!.with({ fragment: node.location.start.line.toString() })
      const item = this.controller.createTestItem(node.title, node.title, uri)
      parent.children.add(item)
    }
  }

  /**
   * Given a file, parse its contents to find the tests/groups and add them
   * to the test explorer
   */
  private async parseTestsInFileContents(file: TestItem, contents?: string) {
    contents = contents || (await getFileContent(file.uri!))

    const { tests, groups } = this.extractor.extract(contents)

    this.createTestItemsFromNodes(tests, file)

    for (const group of groups) {
      const uri = file.uri!.with({ fragment: group.location.start.line.toString() })
      const item = this.controller.createTestItem(group.title, group.title, uri)
      this.createTestItemsFromNodes(group.tests, item)
      file.children.add(item)
    }
  }

  constructor() {
    this.extractor = new TestsExtractor()
    this.controller = tests.createTestController('japa-tests', 'Japa Tests')

    ExtConfig.onDidChange(() => this.discoverAllFilesInWorkspace.bind(this))

    this.controller.resolveHandler = async (test) => {
      if (!test) {
        await this.discoverAllFilesInWorkspace()
        return
      }

      await this.parseTestsInFileContents(test)
    }
  }
}
