# Math Manipulator

This extension bundles the project `math-manipulator` (https://github.com/jonas-kell/math-manipulator) for use inside Visual Studio Code.
As the project is already 100% browser-compatible (hosted on https://jonas-kell.github.io/math-manipulator/), this only adds read and write functionality for convenient file IO and vscode-theme-styling.

## Features

Contributes the command `math-manipulator.open` that opens a local version of the math manipulator project.

Contributes the command `math-manipulator.new-document` that initializes a new `.mmdata` file.

Provides a custom editor for `.mmdata` files, with permanent storage to the file enabled.

<!--
Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

<!-- ## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Manual installation

### Latest Version

For building the latest version of the extension, run:

```cmd
npm install -g @vscode/vsce      # Unless already installed (requires node & npm)
vsce package
```

Then right-click on `math-manipulator-X.X.X.vsix` and choose `Install Extension VSIX`.

### Specific Version

For building a specific version of the `math-manipulator` main dependency, you need to first check it out in the submodule.

```cmd
vsce package    # make sure everything is at least once run
```

Then remove the part `git submodule update --recursive --init && ` from the `prepare-workspace`command in `package.json` (otherwise the packaging will revert to the latest version before compiling).

```cmd
cd main-project-source/
git checkout VERSIONYOUWANT
cd ..
vsce package
```
