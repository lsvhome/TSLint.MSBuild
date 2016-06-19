for (const method of Object.keys(console)) {
    const oldMethod = console[method].bind(console);
    console[method] = (...args) => oldMethod("Redirected: ", ...args);
}

const MsBuild = require("msbuild");
const builder = new MsBuild(); 

builder.sourcePath = "test/end-to-end/TestSolution/TestProject/TestProject.sln";
builder.overrideParams.push("/clp:ErrorsOnly");
builder.build();
