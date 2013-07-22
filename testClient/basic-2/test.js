describe( "Given a Page with one App which has 1 component", function( ) {
    var callInit = sinon.spy( ),
        fakeAttach = function( url, cb ) {
            _c.component( {
                type: "test",
                initialize: callInit
            } );
            cb( );
        };

    before( function( done ) {
        sinon.stub( _c, "attach", fakeAttach );
        _c.init( done );
    } );
    it( "should have 2 apps registered", function( ) {
        _c.apps( ).length.should.equal( 2 );
    } );
    it( "should have one component register", function( ) {
        Object.keys( _c.components ).length.should.equal( 1 );
    } );
    it( "should have initialize 4 components", function( ) {
        callInit.callCount.should.be.equal( 4 );
    } );
} )