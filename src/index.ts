/// <reference path="../typings/main/ambient/node/index.d.ts" />
/// <reference path="ArgumentsCollection.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />
/// <reference path="LintRunner.ts" />

console.log("Starting TSLint runner.");

namespace TSLint.MSBuild {
    "use strict";

    let fs = require("fs"),
        path = require("path");

    /**
     * Retrieves the list of input .ts files from a text file. 
     * 
     * @param filePath   A file path to a text file.
     * @returns A list of input .ts files.
     */
    function getInputFilesList(filePath): string[] {
        return fs.readFileSync(filePath)
            .toString()
            .replace(/\r/g, "")
            .split("\n")
            .filter(file => file);
    }

    /**
     * Formats a TSLint error for display in Visual Studio.
     * 
     * @param lintError   Either a TSLint violation POJO or an error String.
     * @todo Use tslint.d.ts for a type definition.
     */
    function formatOutput(lintError: string | any): string {
        if (typeof lintError === "string") {
            return lintError;
        }

        return lintError.name.replace("/", "\\")
            + `(${(lintError.startPosition.line + 1)},${(lintError.startPosition.character + 1)})`
            + `: error tslint-${lintError.ruleName}`
            + `: TSLint failure: ${lintError.failure}.`;
    }

    (() => {
        let argumentsCollection: ArgumentsCollection = new ArgumentsCollection(process.argv.slice(2)),
            rootDirectory: string = argumentsCollection.getFilesRootDir(),
            summaryFilePath: string = argumentsCollection.getFileListFile(),
            filePaths: string[] = getInputFilesList(summaryFilePath),
            filePathsIncluded: string[] = filePaths.filter(
                filePath => !argumentsCollection.getExclude().test(filePath)),
            runner = new LintRunner(argumentsCollection);

        console.log(`Running TSLint on ${filePathsIncluded.length} of ${filePaths.length} file(s) (excluding ${filePaths.length - filePathsIncluded.length}).`);

        runner
            .addFilePaths(filePathsIncluded)
            .then(() => runner.runTSLint())
            .then(lintErrors => {
                if (lintErrors.length === 0) {
                    console.log(`0 errors found in ${filePathsIncluded.length} file(s).`);
                    return;
                }

                let lintErrorsFormatted = lintErrors
                    .map(lintError => formatOutput(lintError))
                    .join("\n");

                console.error(lintErrorsFormatted);
                console.log(`${lintErrors.length} error(s) found in ${filePathsIncluded.length} file(s).`);
            })
            .catch(error => {
                console.error("Error running TSLint!");
                console.error(error.toString());
            });
    })();
}
