const expect = require("chai").expect;
const TSLintSearcher = require("../../dist/TSLintSearcher").TSLintSearcher;

exports.runTests = () => {
    it("passes a semver folder name", () => {
        // Arrange
        const folderName = "tslint.1.2.3";

        // Act & assert
        expect(TSLintSearcher.prototype.folderIsTSLint(folderName)).to.be.true;
    });

    it("rejects a regular folder name", () => {
        // Arrange
        const folderName = "tslint";

        // Act && assert
        expect(TSLintSearcher.prototype.folderIsTSLint(folderName)).to.be.false;
    });

    it("rejects a folder name with not enough version numbers", () => {
        // Arrange
        const folderName = "tslint.1.2";

        // Act && assert
        expect(TSLintSearcher.prototype.folderIsTSLint(folderName)).to.be.false;
    });

    it("rejects a folder name with improper version numbers", () => {
        // Arrange
        const folderName = "tslint.a.b.c";

        // Act && assert
        expect(TSLintSearcher.prototype.folderIsTSLint(folderName)).to.be.false;
    });
};
