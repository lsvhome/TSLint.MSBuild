const tests = {
    TSLintSearcher: [
        "folderIsTSLint",
        "versionSorter"
    ]
};

for (const className in tests) {
    describe(className, () => {
        tests[className].forEach(functionName => {
            describe(functionName, require(`./${className}/${functionName}`).runTests);
        });
    });
};
