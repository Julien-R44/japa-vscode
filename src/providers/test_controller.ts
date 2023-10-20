import {
  Location,
  Position,
  Range,
  RelativePattern,
  TestMessage,
  TestRunProfileKind,
  tests,
  workspace,
} from 'vscode'
import { AstExtractor } from '../ast_extractor'
import { getFileContent } from '../utilities'
import ExtConfig from '../utilities/ext_config.js'
import { NdJsonExecutor } from '../tests_runner/ndjson_runner'
import { iterableToArray } from '../utilities/pure'
import { Notifier } from '../notifier'
import type {
  CategorizedTestBags,
  Frame,
  NdJsonRunnerOption as NdJsonRunnerOptions,
  TestBag,
  TestData,
  TestEndEvent,
  TestFailureEvent,
} from '../types'
import type {
  CancellationToken,
  TestItem,
  TestRun,
  TestRunRequest,
  Uri,
  TestController as VSTestController,
} from 'vscode'
import type { TestNode } from '../ast_extractor/nodes/test_node'

export class TestController {
  public controller: VSTestController
  #extractor: AstExtractor
  #testData = new WeakMap<TestItem, TestData>()

  constructor() {
    this.#extractor = new AstExtractor()
    this.controller = tests.createTestController('japa-tests', 'Japa Tests')

    ExtConfig.onDidChange(() => this.discoverAllFilesInWorkspace.bind(this))

    this.controller.resolveHandler = async (test) => {
      if (!test) {
        await this.discoverAllFilesInWorkspace()
        return
      }

      await this.parseTestsInFileContents(test)
    }

    const runProfile = this.controller.createRunProfile(
      'Run',
      TestRunProfileKind.Run,
      async (request, token) => this.#runHandler(request, token, false)
    )

    runProfile.supportsContinuousRun = false
    runProfile.isDefault = true
  }

  /**
   * Given a list of test items to run, this function will split them
   * by type (file, group, test).
   */
  #splitItemsByType(request: TestRunRequest): CategorizedTestBags {
    const selectedTests: TestItem[] = []

    if (request.include) {
      request.include.forEach((test) => selectedTests.push(test))
    } else {
      this.controller.items.forEach((test) => selectedTests.push(test))
    }

    const testData = selectedTests.map((test) => ({
      testData: this.#testData.get(test)!,
      testItem: test,
    }))

    return {
      fileTestBags: testData.filter(({ testData }) => testData!.type === 'file'),
      groupTestBags: testData.filter(({ testData }) => testData!.type === 'group'),
      testTestBags: testData.filter(({ testData }) => testData!.type === 'test'),
    }
  }

  /**
   * To avoid running the same test multiple times, we need to purge :
   * - groups bags that are children of file bags
   * - test bags that are children of file bags
   * - test bags that are children of group bags
   */
  #purgeTestItemsDuplicates({ fileTestBags, groupTestBags, testTestBags }: CategorizedTestBags) {
    const purgeDuplicates = (parentBags: TestBag[], childBags: TestBag[]) => {
      return childBags.filter((childBag) => {
        return !parentBags.some((parentBag) => childBag.testItem?.parent === parentBag.testItem)
      })
    }

    groupTestBags = purgeDuplicates(fileTestBags, groupTestBags)
    testTestBags = purgeDuplicates(fileTestBags, testTestBags)
    testTestBags = purgeDuplicates(groupTestBags, testTestBags)

    return { fileTestBags, groupTestBags, testTestBags }
  }

  /**
   * Extract all test items from file bags
   */
  #extractTestItemsFromFileBags(fileBags: TestBag[]) {
    return fileBags
      .map(({ testItem }) => {
        return iterableToArray(testItem.children)
          .map(([, item]) => iterableToArray(item.children).map(([, item]) => item))
          .flat()
      })
      .flat()
  }

  /**
   * Extract all test items from group bags
   */
  #extractTestItemsFromGroupBags(groupBags: TestBag[]) {
    return groupBags
      .map(({ testItem }) => iterableToArray(testItem.children).map(([, item]) => item))
      .flat()
  }

  /**
   * Create a queue of categorized test items to run separately
   */
  #createQueue(request: TestRunRequest) {
    const newBags = this.#purgeTestItemsDuplicates(this.#splitItemsByType(request))

    const fileTestsItems = this.#extractTestItemsFromFileBags(newBags.fileTestBags)
    const groupTestsItems = this.#extractTestItemsFromGroupBags(newBags.groupTestBags)
    const testTestsItems = newBags.testTestBags.map(({ testItem }) => testItem)

    return [
      { type: 'file' as const, bags: newBags.fileTestBags, tests: fileTestsItems },
      { type: 'group' as const, bags: newBags.groupTestBags, tests: groupTestsItems },
      { type: 'test' as const, bags: newBags.testTestBags, tests: testTestsItems },
    ].filter(({ bags }) => bags.length > 0)
  }

  /**
   * Convert a frame to a vscode range
   */
  #frameToRange(frame: Frame): Range {
    return new Range(
      new Position((frame.lineNumber ?? 0) - 1, 0),
      new Position(frame.lineNumber ?? 0, 0)
    )
  }

  /**
   * Given a TestEndEvent, returns the associated Vscode TestItem
   */
  #matchTestItemFromTestEvent(tests: TestItem[], testEndEvent: TestEndEvent) {
    return tests.find((testItem) => testItem.id === testEndEvent.title.original)!
  }

  /**
   * When a test fails. Mark it as failed and also
   * create a diff view if the error is an assertion error
   */
  #onTestFailure(tests: TestItem[], run: TestRun, testEndEvent: TestFailureEvent) {
    const test = this.#matchTestItemFromTestEvent(tests, testEndEvent)
    const error = testEndEvent.mainError
    const testMessage = new TestMessage(error.message)

    if (error.isAssertionError) {
      testMessage.actualOutput = error.actual
      testMessage.expectedOutput = error.expected
    }

    const range = error.frame ? this.#frameToRange(error.frame) : test.range
    testMessage.location = new Location(test!.uri!, range!)

    run.failed(test, testMessage, testEndEvent.duration)
  }

  /**
   * When a test is skipped or todo. Just mark it as skipped
   */
  #onTestSkipped(tests: TestItem[], run: TestRun, testEndEvent: TestEndEvent) {
    const linkedTest = tests.find((testItem) => testItem.id === testEndEvent.title.original)!
    run.skipped(linkedTest)
  }

  /**
   * When a test passes. Mark it as passed
   */
  #onTestPassed(tests: TestItem[], run: TestRun, testEndEvent: TestEndEvent) {
    const linkedTest = tests.find((testItem) => testItem.id === testEndEvent.title.original)!
    run.passed(linkedTest, testEndEvent.duration)
  }

  async #runHandler(request: TestRunRequest, token: CancellationToken, shouldDebug: boolean) {
    const run = this.controller.createTestRun(request)
    const queue = this.#createQueue(request)

    /**
     * Process each queue item
     */
    for (const { bags, tests, type } of queue) {
      const workspaceFolder = workspace.getWorkspaceFolder(bags[0]!.testItem.uri!)!

      const options: NdJsonRunnerOptions = {
        cwd: workspaceFolder.uri.fsPath,
        script: ExtConfig.tests.npmScript,
        debug: shouldDebug,
        files: bags.map(({ testItem }) => workspace.asRelativePath(testItem.uri!)),
      }

      if (type === 'group') {
        options.groups = bags.map(({ testItem }) => testItem.id)
      } else if (type === 'test') {
        const testData = bags.map(({ testData }) => testData)
        const testNames = testData.map((testData) => testData!.testName).filter(Boolean) as string[]

        options.tests = testNames
        options.groups = bags.map(
          ({ testItem }) => this.#testData.get(testItem.parent!)!.groupName!
        )
      }

      for (const testItem of tests) run.started(testItem)

      const ndJsonExecutor = new NdJsonExecutor(options)
      token.onCancellationRequested(() => ndJsonExecutor.kill())

      ndJsonExecutor
        .onTestFailure((test) => this.#onTestFailure(tests, run, test))
        .onTestSkip((test) => this.#onTestSkipped(tests, run, test))
        .onTestTodo((test) => this.#onTestSkipped(tests, run, test))
        .onTestSuccess((test) => this.#onTestPassed(tests, run, test))
        .onNewLine((line) => run.appendOutput(`${line}\r\n`))

      try {
        await ndJsonExecutor.run()
      } catch (error: any) {
        if (!('message' in error)) {
          throw error
        }

        Notifier.showError(`Could not run tests :\n${error.message}`)
        run.end()
        return
      }
    }

    run.end()
  }

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
    file.range = new Range(new Position(0, 0), new Position(0, 0))
    this.#testData.set(file, { type: 'file' })
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
      watcher.onDidChange((uri) => {
        const fileItem = this.getOrCreateFile(uri)
        this.parseTestsInFileContents(fileItem)
        this.controller.items.add(fileItem)
      })
      watcher.onDidDelete((uri) => this.controller.items.delete(uri.toString()))

      const files = await workspace.findFiles(pattern, '**/{node_modules,dist,build,out}/**')
      for (const file of files) {
        const fileItem = this.getOrCreateFile(file)
        this.parseTestsInFileContents(fileItem)
        this.controller.items.add(fileItem)
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
      const item = this.controller.createTestItem(node.title, node.title, parent.uri)

      item.range = new Range(
        new Position(node.location.start.line - 1, node.location.start.column),
        new Position(node.location.end.line - 1, node.location.end.column)
      )

      parent.children.add(item)
      this.#testData.set(item, {
        type: 'test',
        testName: node.title,
        location: node.location,
        filePath: parent.uri!.fsPath,
      })
    }
  }

  /**
   * Given a file, parse its contents to find the tests/groups and add them
   * to the test explorer
   */
  private async parseTestsInFileContents(file: TestItem, contents?: string) {
    contents = contents || (await getFileContent(file.uri!))

    const { tests, groups } = this.#extractor.extract(contents)

    this.createTestItemsFromNodes(tests, file)

    for (const group of groups) {
      const item = this.controller.createTestItem(group.title, group.title, file.uri)

      item.range = new Range(
        new Position(group.location.start.line - 1, group.location.start.column),
        new Position(group.location.end.line - 1, group.location.end.column)
      )

      this.#testData.set(item, { type: 'group', groupName: group.title })

      this.createTestItemsFromNodes(group.tests, item)
      file.children.add(item)
    }
  }
}
