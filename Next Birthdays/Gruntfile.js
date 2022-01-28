module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            nb_dist: [`dist/`]
        },

        concat: {
            nb_core: {
                src: [
                    "src/core/NextBirthdays_Header.js", 
                    "src/core/modules/Constants.js", 
                    "src/core/modules/ArgumentsHandler.js", 
                    "src/core/modules/PersistenceService.js", 
                    "src/core/modules/Update.js", 
                    "src/core/modules/Initializer.js", 
                    "src/core/NextBirthdays.js"
                ],
                dest: "dist/NextBirthdays.assembly.js"
            },
            nb_plugin: {

            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Next Birthdays
    grunt.registerTask('default', 'Build Next Birthdays', ['clean:nb_dist', 'concat:nb_core', 'concat:nb_plugin']);
  
  };