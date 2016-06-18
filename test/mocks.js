const TSLintSearcher = require("../dist/TSLintSearcher").TSLintSearcher;

const mocks = {
    /**
     * @returns A new TSLintSearcher.
     */
    mockTSLintSearcher: () => new TSLintSearcher()
};

exports = mocks;