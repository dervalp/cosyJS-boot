! function( root ) {
    "use strict";

    var root = root,
        apps = [ ],
        isBrowser = typeof window !== 'undefined',
        t = {},
        __cosy_defered = root.__cosy_defered,
        TYPE = "cosy-type",
        ID = "cosy-id",
        APP_KEY = "app",
        ATTR_TYPE = "[" + TYPE + "]",
        ATTR_ID = "[" + ID + "]",
        ATTR_APP = "[" + APP_KEY + "]",
        components = {},
        nativeForEach = Array.prototype.forEach,
        toArray = function( obj ) {
            var array = [ ],
                i = obj.length >>> 0; // ensure that length is an Uint32
            // iterate backwards
            while ( i-- ) {
                array[ i ] = obj[ i ];
            }
            return array;
        },
        getDepth = function( child, parent ) {
            var node = child,
                comp = null,
                depth = 0;

            if ( parent ) {
                comp = parent.id;
            }

            while ( node.parentNode !== comp ) {
                node = node.parentNode;
                depth++;
            }
            return depth;
        },
        scriptLoadError = function( ) {
            console.log( arguments );
        },
        attachScript = function( url, cb ) {
            var script = document.createElement( "script" );
            script.src = url;
            script.onload = cb;
            script.onerror = scriptLoadError;
            ( document.head || document.getElementsByTagName( 'head ' )[ 0 ] ).appendChild( script );
        },
        parseApps = function( callback ) {
            var els = toArray( document.querySelectorAll( ATTR_APP ) );

            els.forEach( function( el ) {
                apps.push( {
                    el: el,
                    name: el.getAttribute( APP_KEY ),
                    depth: getDepth( el )
                } );
            } );

            callback( els );
        },
        fetchComps = function( callback ) {
            var keys,
                els = toArray( document.querySelectorAll( ATTR_TYPE ) ),
                comps = els.map( compAttributes );

            comps.forEach( function( c ) {
                if ( !t[ c.type ] ) {
                    t[ c.type ] = void 0;
                }
            } );

            keys = Object.keys( t );

            if ( keys.length > 0 ) {
                _c.attach( buildModRequest( keys ), callback );
            }
        },
        buildModRequest = function( types ) {
            var request = "comp.js?mod=[",
                end = "]",
                mod = types;

            return request + mod.join( "," ) + end;
        },
        compAttributes = function( el ) {
            var id = el.getAttribute( ID ),
                type = el.getAttribute( TYPE );

            return {
                el: el,
                id: id,
                type: type
            }
        },
        byDepth = function compare( a, b ) {
            if ( a.depth < b.depth )
                return -1;
            if ( a.depth > b.depth )
                return 1;
            return 0;
        },
        exposeComp = function( comp, app ) {
            //if already registered
            if ( comp.el.__cosy ) {
                return;
            }

            var def = components[ comp.type ],
                init = def.initialize;

            if ( def.adapter ) {
                init = _c.adapters[ def.adapter ];
            }

            app[ comp.id ] = init( comp.el );
            comp.el.__cosy = true;
        },
        exposeApp = function( app ) {
            console.log( app );
            var components = toArray( app.el.querySelectorAll( ATTR_TYPE ) ),
                comps = components.map( function( el ) {
                    return {
                        el: el,
                        depth: getDepth( el ),
                        type: el.getAttribute( TYPE )
                    }
                } );

            comps.sort( byDepth ).reverse( ).forEach( function( comp ) {
                exposeComp( comp, app );
            } );
        },
        component = function( comp ) {
            if ( !comp || !comp.type ) {
                throw "should have at least a type";
            }

            components[ comp.type ] = comp;
        },
        init = function( cb ) {
            fetchComps( function( ) {
                parseApps( function( ) {

                    apps.sort( byDepth ).reverse( ).forEach( exposeApp );

                    if ( cb ) {
                        cb( );
                    }
                } );
            } );
        };

    //public API
    var _c = root._c = {
        component: component
    };

    if ( typeof exports !== 'undefined' ) {
        _c = exports;
    } else {
        _c = root._c = {};
    }
    //public API
    _c.components = components;
    _c.component = component;
    _c.expose = exposeComp;
    _c.init = init;
    //for testing purpose
    _c.attach = attachScript;

    _c.apps = function( ) {
        return apps.map( function( app ) {
            return app.name;
        } );
    };

    if ( isBrowser && !__cosy_defered ) {
        init( );
    }

}( this );