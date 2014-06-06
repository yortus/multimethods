module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            main: {
                src: [
                    'src/**/*.js', 'src/**/*.js.map',
                    'tests/**/*.js', 'tests/**/*.js.map'
                ]
            }
        },

        typescript: {
            main: {
                src: ['src/**/*.ts'],
                dest: '.',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true,
                    declaration: false,
                    removeComments: false
                }
            }
        },

        copy: {
            main: {
                expand: true,
                src: ['src/**/*.js', 'index.js'],
                dest: 'node_modules/multimethods'
            }
        },

        mochaTest: {
            main: {
                options: { reporter: 'list' },
                src: ['tests/**/*.js']
            }
        }

    });


    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Register task aliases and the default task
    grunt.registerTask('build', ['typescript:main', 'copy:main']);
    grunt.registerTask('test', ['mochaTest:main']);
    grunt.registerTask('default', ['build']);
};
