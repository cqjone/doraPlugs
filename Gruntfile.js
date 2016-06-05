/**
 * Created by Administrator on 2016/6/5.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        browserify: {
            dist: {
                options: {
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ]
                },
                files: {
                    // if the source file has an extension of es6 then
                    // we change the name of the source file accordingly.
                    // The result file's extension is always .js
                    "./js/index.js": ["./js/dora.js"]
                }
            }
        },
        watch: {
            scripts: {
                files: ["./js/*.js"],
                tasks: ["browserify"]
            }
        },
        uglify: {
            buildb:{//任务二：压缩b.js，输出压缩信息
                options: {
                    report: "min"//输出压缩率，可选的值有 false(不输出信息)，gzip
                },
                files: {
                    './js/dora.min.js': ['./js/index.js']
                }
            }
        }

    });

    grunt.loadNpmTasks("grunt-browserify");
    //grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.registerTask("default", ["watch"]);
    grunt.registerTask("default", ["browserify",'uglify:buildb']);
    //grunt.registerTask('mindora', ['uglify:buildb']);
};