var index = require( "../index" ),
    should = require( "should" );

describe( "Given the cosy Library", function( ) {
    it( "should be defined", function( ) {
        index.should.exists;
    } );
    it( "should have a component method", function( ) {
        index.cosy.should.exists;
    } );
    it( "should have an expose method", function( ) {
        index.file.should.exists;
    } );
    it( "should have an expose method", function( done ) {
        index.file( function( err, res ) {
            res.should.exists;
            done( );
        } );
    } );
} );