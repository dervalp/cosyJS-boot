var path = require( "path" ),
    fs = require( "fs" );

module.exports = {
    cosy: require( "./cosy" ),
    file: function( config, cb ) {
        var cosyPath;

        config = config || {}

        if ( arguments.length == 1 ) {
            cb = config;
        }

        if ( config.min ) {
            cosyPath = __dirname + "\\" + "c.min.js";
        } else {
            cosyPath = __dirname + "\\" + "c.js";
        }

        fs.readFile( cosyPath, "utf8", cb );
    }
};