describe( "Given a Page with one App which has 1 component", function( ) {
    var callInit = sinon.spy( ),
        stubCompLoaded,
        ctrlInit = function( url, cb ) {
            callInit( );
            cb( );
        },
        fakeAttach = function( url, cb ) {
            _c.component( {
                type: "test",
                initialize: function( el, init ) {
                    callInit( );
                    return {
                        el: el,
                        init: init
                    };
                }
            } );
            stubCompLoaded.restore( );
            ctrlStub = sinon.stub( _c, "attach", ctrlInit );
            cb( );
        };

    before( function( done ) {
        stubCompLoaded = sinon.stub( _c, "attach", fakeAttach );

        _c.init( done );

    } );
    it( "should have initialize 1 component", function( ) {
        callInit.callCount.should.be.equal( 2 );
    } );
} )