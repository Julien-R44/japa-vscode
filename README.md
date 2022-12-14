<div align="center">
  <img width="650px" src="https://user-images.githubusercontent.com/8337858/187943614-8faa9500-d7e8-463c-b5f7-3ece742827fd.png" />
  <h2>🧪 Japa extension for VSCode</h2>

  <p align="center">
    <a href="https://github.com/Julien-R44/japa-vscode/actions/workflows/test.yml">
      <img src="https://img.shields.io/github/workflow/status/julien-r44/japa-vscode/test?label=%20&logo=github&style=flat-square&logoColor=white&color=5A45FF">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode">
      <img src="https://vsmarketplacebadge.apphb.com/version-short/jripouteau.japa-vscode.svg?label=%20&style=flat-square&color=5A45FF">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode">
      <img src="https://vsmarketplacebadge.apphb.com/installs-short/jripouteau.japa-vscode.svg?label=%20&style=flat-square&color=5A45FF">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode">
      <img src="https://vsmarketplacebadge.apphb.com/rating-short/jripouteau.japa-vscode.svg?label=%20&style=flat-square&color=5A45FF">
    </a>
    <br>
  </p>
</div>

## Features
* Run tests without typing anything. Either with a shortcut, or via Code Lenses
* Support multiple workspaces
* Support Javascript, Typescript, ESM, CJS
* Works with Adonis.js projects using Japa
* Snippets

## Demo
![](https://user-images.githubusercontent.com/8337858/187944316-c1b5f0c4-2ea2-46f1-9437-a7433db8a2eb.gif)

## Configuration
- `tests.npmScript`: The npm script to run when executing tests. Defaults to `test`

  i.e if you set it to `test:unit`, the extension will run `npm run test:unit --flags` when executing tests
- `tests.enableCodeLens`: Show CodeLenses above each test. Defaults to `true`
- `tests.watchMode`: Run tests in watch mode when executed via shortcut/codelens. Defaults to `false`
- `tests.filePattern`: The glob pattern to use when searching for tests. Defaults to `**/*.{test,spec}.{ts,js}`
- `misc.useUnixCd`: Use Unix-style cd for windows terminals ( Useful when using Cygwin or Git Bash )

## Keybindings
- `ctrl+shift+t`: Run the test at the cursor position
- `ctrl+shift+f`: Run the test file in the active editor

These keybindings can be easily changed in your VSCode configuration : 

- F1 -> Preferences: Open Keyboard Shortcuts
- Type `japa-vscode` in the search bar
- Change the `japa-vscode.runTest` or `japa-vscode.runTestFile` keybindings

## Snippets

All snippets are prefixed with `ja:`. Give it a try in your editor to see what's available.

## Contributing
* See [contributing guide](./.github/CONTRIBUTING.md)
* Clone the project and open it in VS Code
* Run `npm install`
* Press `F5` to open a new VSCode window with your extension loaded.
* You can relaunch the extension from the debug toolbar after changing code in `src/index.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.
