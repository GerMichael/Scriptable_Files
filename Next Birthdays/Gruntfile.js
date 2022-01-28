module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: [`dist/`],

        concat: {
            core: {
                src: ["src/core/NextBirthdays_Header.js", "src/core/modules/PersistenceService.js", "src/core/modules/Initializer.js", 
                "src/core/modules/PropertyHandler.js", "src/core/modules/Update.js", "src/core/NextBirthdays.js"],
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