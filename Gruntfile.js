module.exports = function (grunt) {
    grunt.initConfig({
        "meta": {
            "configs": {
                "package": grunt.file.readJSON("package.json"),
                "typescript": grunt.file.readJSON("tsconfig.json"),
                "tslint": grunt.file.readJSON("tslint.json")
            },
            "paths": {
                "source": "src",
                "distribution": "dist"
            },
        },
        "clean": ["<%= meta.paths.distribution %>/*.*"],
        "copy": {
            "distribution": {
                "dest": "dist/",
                "expand": true,
                "flatten": true,
                "src": [
                    "src/Install.ps1",
                    "src/node*.exe",
                    "src/*.targets",
                    "package.json",
                    "LICENSE.md",
                    "README.md"
                ]
            }
        },
        "nugetpack": {
            "distribution": {
                "src": "TSLint.MSBuild.nuspec",
                "dest": "<%= meta.paths.distribution %>"
            }
        },
        "tslint": {
            "distribution": {
                "files": {
                    "src": ["<%= meta.paths.source %>/**/*.ts"]
                },
                "options": {
                    "configuration": "<%= meta.configs.tslint %>"
                }
            }
        },
        "ts": {
            "distribution": {
                "tsconfig": true
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-nuget");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    
    grunt.registerTask("quick", [
        "tslint", "clean", "ts", "copy"
    ]);
    
    grunt.registerTask("default", [
        "quick", "nugetpack"
    ]);
};