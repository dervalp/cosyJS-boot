! function( root ) {
    "use strict";

    var apps = [ ],
        isBrowser = typeof window !== "undefined",
        t = {},
        adapterCaches,
        config = root.__cosy_config || {},
        deferred = config.deferred,
        TYPE = "cosy-type",
        ID = "cosy-id",
        APP_KEY = "app",
        ATTR_TYPE = "[" + TYPE + "]",
        ATTR_ID = "[" + ID + "]",
        ATTR_APP = "[" + APP_KEY + "]",
        nativeIsArray = Array.isArray,
        components = {},
        nativeForEach = Array.prototype.forEach,
        bootstrapValues = ( isBrowser && config.conf ) ? config.conf : {},
        ctrls = config.controllers ? config.controllers : [ ],
        toArray = function( obj ) {
            var array = [ ],
                i = obj.length >>> 0; // ensure that length is an Uint32
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
            ( document.head || document.getElementsByTagName( "head" )[ 0 ] ).appendChild( script );
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
        getInitialValue = function( comp ) {
            var init = bootstrapValues[ comp.id ];
            if ( !init ) {
                return comp;
            } else {
                for ( var i in comp ) {
                    if ( comp.hasOwnProperty( i ) ) {
                        init[ i ] = comp[ i ];
                    }
                }
                return init;
            }
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
        buildModRequest = function( types, type ) {
            var request = "comp.js?",
                start = "=[",
                end = "]",
                mod = type ? type : "mode";

            return request + mod + types.join( "," ) + end;
        },
        compAttributes = function( el ) {
            return {
                el: el,
                id: el.getAttribute( ID ),
                depth: getDepth( el ),
                type: el.getAttribute( TYPE )
            };
        },
        byDepth = function compare( a, b ) {
            if ( a.depth < b.depth ) {
                return -1;
            }
            if ( a.depth > b.depth ) {
                return 1;
            }
            return 0;
        },
        exposeComp = function( comp, app ) {
            //if already registered
            if ( comp.el.__cosy ) {
                return;
            }

            var def = components[ comp.type ],
                initial = getInitialValue( comp ),
                init = def.initialize;

            if ( def.adapter && !adapterCaches[ def.adapter ] ) {
                init = adapterCaches[ def.adapter ] = _c.adapters[ def.adapter ];
            }

            app[ comp.id ] = init( comp.el, initial, app );
            comp.el.__cosy = true;
        },
        exposeApp = function( app ) {

            var components = toArray( app.el.querySelectorAll( ATTR_TYPE ) ),
                comps = components.map( compAttributes );

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
        loadCtrl = function( cb ) {
            if ( ctrls.length > 0 ) {
                _c.attach( buildModRequest( ctrls, "ctrl" ), cb );
            } else {
                cb( );
            }
        },
        registerCtrl = function( name, content ) {
            var module = _c.modules( name );

            if ( _.isFunction( content ) ) {
                return content.call( module );
            }
        },
        init = function( cb ) {
            fetchComps( function( ) {
                parseApps( function( ) {

                    apps.sort( byDepth ).reverse( ).forEach( exposeApp );
                    loadCtrl( cb );
                } );
            } );
        };

    //public API
    var _c = root._c = {
        component: component
    };

    if ( typeof exports !== "undefined" ) {
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
    _c.controller = registerCtrl;

    _c.modules = function( name ) {
        var result;

        if ( !name ) {
            return apps.map( function( app ) {
                return app;
            } );
        }

        result = apps.map( function( app ) {
            return ( !! ~name.indexOf( app.name ) ) ? app : null;
        } );

        if ( nativeIsArray( name ) ) {
            return result;
        }

        return ( result && result.length === 1 ) ? result[ 0 ] : null;
    };

    if ( isBrowser && !deferred ) {
        init( );
    }

}( this );