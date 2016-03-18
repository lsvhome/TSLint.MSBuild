# TSLint for MSBuild

An MSBuild wrapper around Palantir's wonderful [tslint](https://github.com/palantir/tslint).

## Usage

Add a link the package's targets file in your project's .csproj file:

```xml
<Import Project="..\packages\TSLint.MSBuild.0.0.5\tools\TSLinter.targets" />
```

*If you're unsure of where to put it, directly above the TypeScript targets import is fine.*

The target name is **`TSLint`**; to always run on builds, add it to the `DefaultTargets` attribute in your .csproj file:

```xml
<Project ToolsVersion="4.0" DefaultTargets="Build;TSLint" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
``` 

### tslint.json

TSLint.MSBuild respects `tslint.json` settings in directories.
Placing a `tslint.json` in a directory will affect that directory's children and all subdirectory children, unless superseded by another `tslint.json`. 


## Development

Run the following commands to initialize your environment:

```cmd
    npm install
    typings install
```

Run `grunt` to build.
