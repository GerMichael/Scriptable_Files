module.exports = function(grunt) {

    const NEXT_BIRTHDAYS_SCRIPT_NAME = "NextBirthdays.assembly.js";
    const NEXT_BIRTHDAYS_DIST_PATH = "dist/next_birthdays";

    const UPDATER_SCRIPT_NAME = "Updater.assembly.js";
    const UPDATER_DIST_PATH = "dist/next_birthdays";

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            nb_dist: [NEXT_BIRTHDAYS_DIST_PATH],
            updater_dist: [UPDATER_DIST_PATH]
        },

        concat: {
            nb_script_assembly: {
                src: [
                    "src/core/NextBirthdays.js"
                ],
                dest: `${NEXT_BIRTHDAYS_DIST_PATH}/` + NEXT_BIRTHDAYS_SCRIPT_NAME
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Next Birthdays
    grunt.registerTask('default', 'Build Next Birthdays', ['birthdays']);
    grunt.registerTask('updater', 'Build Updater', ['clean:updater_dist']);
    grunt.registerTask('birthdays', 'Build Next Birthdays', ['clean:nb_dist', 'concat:nb_script_assembly']);
  
  };