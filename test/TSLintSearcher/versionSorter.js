const expect = require("chai").expect;
const TSLintSearcher = require("../../dist/TSLintSearcher").TSLintSearcher;

exports.runTests = () => {
    it("sorts a single lesser and a single greater number", () => {
        // Arrange
        const versions = [[1], [2]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2], [1]]);
    });

    it("sorts a single greater and a single lesser number", () => {
        // Arrange
        const versions = [[2], [1]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2], [1]]);
    });

    it("sorts two lesser and two greater numbers", () => {
        // Arrange
        const versions = [[1, 0], [2, 0]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2, 0], [1, 0]]);
    });

    it("sorts two greater and two lesser numbers", () => {
        // Arrange
        const versions = [[2, 0], [1, 0]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2, 0], [1, 0]]);
    });

    it("sorts versions of length two within the same major version", () => {
        // Arrange
        const versions = [[2, 0], [2, 2], [2, 1]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2, 2], [2, 1], [2, 0]]);
    });

    it("sorts versions of length three within the same major version", () => {
        // Arrange
        const versions = [[2, 1, 0], [2, 0, 2], [2, 1, 1]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2, 1, 1], [2, 1, 0], [2, 0, 2]]);
    });

    it("sorts versions of various length within the same major version", () => {
        // Arrange
        const versions = [[2, 1, 0], [2, 0], [2]];

        // Act
        versions.sort(TSLintSearcher.versionSorter);

        // Assert
        expect(versions).to.be.deep.equal([[2, 1, 0], [2, 0], [2]]);
    });
};