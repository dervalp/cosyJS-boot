var glob = require( "glob" );

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
          "c.min.js": [ "c.js" ]
        }
      }
    },
    browserify: {
      "c.js": [ "cosy.js" ]
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

  grunt.loadNpmTasks( "grunt-browserify" );
  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.loadNpmTasks( "grunt-contrib-watch" );
  grunt.loadNpmTasks( "grunt-shell-spawn" );
  grunt.loadNpmTasks( "grunt-contrib-uglify" );

  grunt.registerTask( "clientTest", "Running mocha js for all the deps", function( ) {

    var files = glob.sync( "testClient/**/*.html" );

    var count = 0;
    files.forEach( function( file ) {

      var property = "shell.cl" + count + ".command";
      grunt.config( property, "mocha-phantomjs " + file );

      count++;
    } );

    grunt.task.run( "shell" );

  } );

  grunt.registerTask( "default", [ "browserify", "jshint", "clientTest", "uglify:cosy" ] );
};