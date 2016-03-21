/// <reference path="../typings/main/ambient/node/index.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />
/// <reference path="LintRunner.ts" />

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

        return lintError.name
            + `(${(lintError.startPosition.line + 1)},${(lintError.startPosition.character + 1)})`
            + `: error tslint-${lintError.ruleName}`
            + `: TSLint failure: ${lintError.failure}.`;
    }

    (() => {
        let summaryFilePath: string = process.argv[2],
            filePaths: string[] = getInputFilesList(summaryFilePath),
            runner = new LintRunner();

        console.log(`Running TSLint on ${filePaths.length} files...`);
        runner
            .addFilePaths(filePaths)
            .then(() => runner.runTSLint())
            .then(lintErrors => {
                if (lintErrors.length === 0) {
                    console.log("No errors in TSLint!");
                    return;
                }

                let lintErrorsFormatted = lintErrors
                    .map(lintError => formatOutput(lintError))
                    .join("\n");

                console.error(lintErrorsFormatted);
            })
            .then(() => console.log("TSLint completed."))
            .catch(error => {
                console.error("Error running TSLint!");
                console.error(error.toString());
            });
    })();
}
