# FASTBuild Task Provider

## Description

This is the source code for the FASTBuild Task Provider. It auto-detects tasks in directory with `fbuild.bff` using FASTBuild's [`-showtargets`](https://www.fastbuild.org/docs/options.html#showtargets) command line option.

## Table of Contents

- [FASTBuild Task Provider](#task-explorer---view-and-run-tasks-from-visual-studio-code)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Installation](#installation)
  - [Debug](#debug)

## Usage

1. Open `Show all commands` menu, `ctrl` + `shift` + `p` by default.
2. Select `Tasks: Run Build Task`, `ctrl` + `shift` + `b` by default.
3. Type name of the desired configuration

![Demo](https://raw.githubusercontent.com/SherAndrei/fastbuild-task-provider/master/assets/presentation.gif)

Note: test configurations and corresponding test tasks are also supported

## Installation

1. Acquire fasbuild-task-provider.v*.vsix file
	* Download latest [release](https://github.com/SherAndrei/fastbuild-task-provider/releases)
	* Or, build from sources using [`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce)
	```bash
	$ npx @vscode/vsce package
	```
2. Install .vsix file as described [here](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

## Debug

- Open this example in VS Code
- `npm install`
- `npm run compile`
- `F5` to start debugging
