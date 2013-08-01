describe( "Given a Page with one App which has 1 component", function( ) {
    var callInit = sinon.spy( ),
        fakeAttach = function( url, cb ) {
            _c.component( {
                type: "test",
                initialize: function( initial, app, el ) {
                    callInit( );
                    return {
                        el: el,
                        init: initial
                    };
                }
            } );
            cb( );
        };

    before( function( done ) {
        sinon.stub( _c, "attach", fakeAttach );
        _c.init( done );
    } );
    it( "cosy should be defined", function( ) {
        _c.should.exist;
    } );
    it( "cosy should have a component method", function( ) {
        _c.component.should.exists;
    } );
    it( "cosy should have an expose method", function( ) {
        _c.expose.should.exists;
    } );
    it( "cosy should have a component List", function( ) {
        _c.components.should.exists;
    } );
    it( "cosy should have a list of component", function( ) {
        ( function( ) {
            _c.component( )
        } ).should.
        throw ( );
    } );
    it( "should have an app registered", function( ) {
        _c.modules( ).length.should.equal( 1 );
    } );
    it( "should have one component register", function( ) {
        Object.keys( _c.components ).length.should.equal( 1 );
    } );
    it( "should have one component register and called test", function( ) {
        _c.modules( )[ 0 ].Test1.should.exists;
    } );
    it( "should find module test", function( ) {
        _c.modules( "test" ).should.exists;
    } );
    it( "should have initialize 1 component", function( ) {
        callInit.callCount.should.be.equal( 1 );
    } );
    it( "should have initialized the component with bootstrap values", function( ) {
        _c.modules( "test" ).Test1.init.toto.should.equal( "toto" );
    } );
} )