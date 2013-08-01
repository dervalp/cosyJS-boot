describe( "Given 1 Page with 2 Apps which has 2 components", function( ) {
    var callInit = sinon.spy( ),
        fakeAttach = function( url, cb ) {
            _c.component( {
                type: "test",
                initialize: function( init ) {
                    callInit( );
                    return init;
                }
            } );
            cb( );
        };

    before( function( done ) {
        sinon.stub( _c, "attach", fakeAttach );
        _c.init( done );
    } );
    it( "should have 2 apps registered", function( ) {
        _c.modules( ).length.should.equal( 2 );
    } );
    it( "should have one component register", function( ) {
        Object.keys( _c.components ).length.should.equal( 1 );
    } );
    it( "should have one component register", function( ) {
        _c.modules( [ "test" ], [ "test1" ] ).length.should.equal( 2 );
    } );
    it( "should have initialize 4 components", function( ) {
        callInit.callCount.should.be.equal( 4 );
    } );
} )