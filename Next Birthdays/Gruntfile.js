module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: [`dist/`],

        concat: {
            core: {
                src: ["src/core/NextBirthdays.js", "src/core/modules/*.js"],
                dest: "dist/NextBirthdays.js"
            },
            plugin: {
                
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Next Birthdays
    grunt.registerTask('default', 'Build Next Birthdays', ['clean', 'concat']);
  
  };