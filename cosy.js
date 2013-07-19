! function( root ) {
    "use strict";

    var root = root,
        apps = [ ],
        t = {},
        TYPE = "sc-type",
        ID = "sc-id",
        ATTR_TYPE = "[" + TYPE + "]",
        ATTR_ID = "[" + ID + "]",
        ATTR_APP = "[sc-app]",
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

            //var i = Array.prototype.indexOf.call( e.childNodes, someChildEl );
            els.forEach( function( el ) {
                apps.push( {
                    el: el,
                    depth: getDepth( el )
                } );
            } );

            callback( els );
        },
        fetchComps = function( callback ) {
            var els = toArray( document.querySelectorAll( ATTR_TYPE ) ),
                comps = els.map( compAttributes );

            comps.forEach( function( c ) {
                if ( !t[ c.type ] ) {
                    t[ c.type ] = void 0;
                }
            } );

            attachScript( buildModRequest( Object.keys( t ) ), callback );
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
            app[ comp.id ] = components[ comp.type ].initialize( comp.el );
        },
        exposeApp = function( app ) {
            var components = toArray( document.querySelectorAll( ATTR_TYPE ) ),
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
            components[ comp.type ] = comp;
        };

    //public API
    var _c = root._c = {
        component: component
    };

    parseApps( function( ) {
        fetchComps( function( ) {
            apps.sort( byDepth ).reverse( ).forEach( exposeApp );
        } );
    } );

}( this );