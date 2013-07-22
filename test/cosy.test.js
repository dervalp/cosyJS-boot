var cosy = require( "../cosy" ),
    should = require( "should" );

describe( "Given cosy boostrap", function( ) {
    it( "should be defined", function( ) {
        cosy.should.exists;
    } );
    it( "should have a component method", function( ) {
        cosy.component.should.exists;
    } );
    it( "should have an expose method", function( ) {
        cosy.expose.should.exists;
    } );
    it( "should have a list of component", function( ) {
        cosy.components.should.exists;
    } );
    it( "should have a list of component", function( ) {
        ( function( ) {
            cosy.component( )
        } ).should.
        throw ( );
    } );
    describe( "and the component method", function( ) {
        cosy.component( {
            type: "test"
        } );

        it( "should have a list of component", function( ) {
            Object.keys( cosy.components ).length.should.equal( 1 );
        } );
    } );
} );