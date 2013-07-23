module.exports = function( grunt ) {

  grunt.initConfig( {
    shell: {
      test: {
        command: "npm test",
        options: {
          async: false
        }
      }
    },
    uglify: {
      cosy: {
        files: {
          "cosy.min.js": [ "cosy.js" ]
        }
      }
    },
    jshint: {
      all: [ "Gruntfile.js", "cosy.js", "test/**/*.js" ],
      options: {
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        quotmark: "double",
        noarg: true,
        forin: true,
        newcap: true,
        sub: true,
        undef: false,
        boss: true,
        strict: false,
        unused: false,
        eqnull: true,
        node: true,
        browser: true,
        expr: "warn"
      }
    }
  } );

  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.loadNpmTasks( "grunt-contrib-watch" );
  grunt.loadNpmTasks( "grunt-shell-spawn" );
  grunt.loadNpmTasks( "grunt-contrib-uglify" );

  grunt.registerTask( "default", [ "jshint", "shell", "uglify:cosy" ] );
};