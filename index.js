var path = require( "path" ),
    dir = __dirname,
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
            cosyPath = path.normalize( dir + "/" + "c.min.js" );
        } else {
            cosyPath = path.normalize( dir + "/" + "c.js" );
        }

        fs.readFile( cosyPath, "utf8", cb );
    }
};