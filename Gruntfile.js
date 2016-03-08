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
        "clean": ["<%= meta.paths.distribution %>"],
        "copy": {
            "distribution": {
                "cwd": "src",
                "dest": "dist/",
                "expand": "true",
                "src": [
                    "node*.exe",
                    "*.targets"
                ]
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
    
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ts");
    
    grunt.registerTask("default", [
        "tslint", "clean", "ts", "copy"
    ]);
};