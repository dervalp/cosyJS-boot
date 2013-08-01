var handlebars = require( "handlebars" );

! function( r ) {
    "use strict";

    var _c,
        apps = [ ],
        isBrowser = typeof window !== "undefined",
        root = isBrowser ? window : r,
        t = {},
        adapters = {},
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
        arrayProto = Array.prototype,
        nativeForEach = arrayProto.forEach,
        bootstrapValues = ( isBrowser && config.conf ) ? config.conf : {},
        ctrls = config.controllers ? config.controllers : [ ],
        idCounter = 0,
        uniqueId = function( prefix ) {
            var id = ++idCounter + "";
            return prefix ? prefix + id : id;
        },
        extend = function( obj ) {
            Array.prototype.forEach.call( Array.prototype.slice.call( arguments, 1 ), function( source ) {
                if ( source ) {
                    for ( var prop in source ) {
                        if ( source.hasOwnProperty( prop ) ) {
                            obj[ prop ] = source[ prop ];
                        }
                    }
                }
            } );
            return obj;
        },
        doParallel = function( fn ) {
            return function( ) {
                var args = Array.prototype.slice.call( arguments );
                return fn.apply( null, [ _c.async.each ].concat( args ) );
            };
        },
        only_once = function( fn ) {
            var called = false;
            return function( ) {
                if ( called ) {
                    throw new Error( "Callback was already called." );
                }
                called = true;
                fn.apply( root, arguments );
            };
        },
        _asyncEach = function( arr, iterator, callback ) {
            callback = callback || function( ) {};
            if ( !arr.length ) {
                return callback( );
            }
            var completed = 0;
            arr.forEach( function( x ) {
                iterator( x, only_once( function( err ) {
                    if ( err ) {
                        callback( err );
                        callback = function( ) {};
                    } else {
                        completed += 1;
                        if ( completed >= arr.length ) {
                            callback( null );
                        }
                    }
                } ) );
            } );
        },
        _asyncMap = function( eachfn, arr, iterator, callback ) {
            var results = [ ];
            arr = _.map( arr, function( x, i ) {
                return {
                    index: i,
                    value: x
                };
            } );
            eachfn( arr, function( x, callback ) {
                iterator( x.value, function( err, v ) {
                    results[ x.index ] = v;
                    callback( err );
                } );
            }, function( err ) {
                callback( err, results );
            } );
        },
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

            return request + start + mod + types.join( "," ) + end;
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
        Component = function( initial, app, el ) {
            for ( var i in initial ) {
                if ( initial.hasOwnProperty( i ) ) {
                    this[ i ] = initial[ i ];
                }
            }

            //this.id = initial.id;
            //this.type = initial.type;
            //this.placeholder = initial.placeholder;

            //this.data = initial;
            if ( isBrowser ) {
                this.el = el;
            }

            this.app = app;
        },
        defaultInit = function( initial, app, el ) {
            return new Component( initial, app, el );
        },
        exposeComp = function( comp, app ) {
            //if already registered

            if ( isBrowser && comp.el.__cosy ) {
                return;
            }

            var def = components[ comp.type ],
                initial = getInitialValue( comp ),
                init = def.initialize || defaultInit,
                result,
                serialize,
                model,
                render = defaultRender;

            if ( def.adapter ) {
                var adapt = adapters[ def.adapter ];

                if ( adapt.initialize ) {
                    init = adapt.initialize;
                }
                if ( adapt.render ) {
                    render = render;
                }

                result = init( initial, app, comp.el );
                result.render = ( adapt.render ) ? adapt.render : render;
                result.serialize = ( adapt.serialize ) ? adapt.serialize : undefined;
            } else {
                result = init( initial, app, comp.el );
            }

            if ( isBrowser ) {
                app[ comp.id ] = result;
            }

            if ( isBrowser ) {
                comp.el.__cosy = true;
            }

            //resule alwya need
            result.placeholder = comp.placeholder;
            result.type = comp.type;
            result.name = comp.name;
            result.dynamic = comp.dynamic;
            result.template = comp.template || comp.type;

            return result;
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
        extractComp = function( str ) {
            var componentRegex = new RegExp( /\{\{component(.*?)\}\}/g ),
                matches,
                result = [ ];

            while ( matches = componentRegex.exec( str ) ) {
                result.push( matches[ 1 ].replace( /^\s+|\s+$/g, "" ) );
            }

            return result;
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
        },
        xhr = function( obj ) {
            var type = obj.type,
                url = obj.url,
                data = obj.data,
                cb = obj.cb;

            var xmlHttp = createXMLHttp( );

            xmlHttp.open( type, url, true );
            if ( type.toLowerCase( ) === "post" ) {
                xmlHttp.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
            }

            xmlHttp.send( type === "post" ? JSON.stringify( data ) : null );
            xmlHttp.onreadystatechange = function( ) {
                if ( xmlHttp.readyState === 4 ) {
                    if ( xmlHttp.status === 200 ) {
                        cb( xmlHttp.responseText );
                    } else {
                        console.log( "Error: " + xmlHttp.responseText );
                    }
                }
            };
        },
        template = function( ) {
            var cache = {};

            return {
                get: function( path, isInstance, cb ) {
                    var template = cache[ path ];
                    if ( !template ) {
                        xhr( {
                            type: "GET",
                            url: "/cosy/template/" + path,
                            cb: function( data ) {
                                cache[ path ] = data;
                                return cb( data );
                            }
                        } );
                    } else {
                        return cb( template );
                    }
                }
            };
        },
        defaultRender = function( callback ) {
            var html,
                toClient = [ ],
                self = this;

            var template = this.template || this.type || undefined;


            var data = ( self.serialize ) ? self.serialize( ) : self;

            /*if ( isBrowser && this.bindings ) {
        this.bindings.unbind( );
    }*/
            var render = function( tmplContent, extendObj ) {
                if ( self.dynamic ) {
                    //var data = self.model.toJSON( );


                    /*if ( extend ) {
                data.disabledBinding = true;
            }*/
                    toClient.push( data );
                }

                var compiled = _c.tmpl.compile( tmplContent );

                extendObj = extendObj || {};


                if ( self.hasPlaceholder ) {
                    return callback( compiled, toClient );
                }
                //if ( isBrowser ) {
                //    html = compiled( self.model.toJSON( ) );
                //    self.$el.html( html );
                //    for ( var ex in extend ) {
                //        self.$el.find( "#" + ex ).html( extend[ ex ] );
                //    }
                //if (self.model.attributes) {
                //    if ( !data.disabledBinding && !self.model.get( "disabledBinding" ) ) {
                //        self.bindings.build( );
                //        self.bindings.bind( );
                //        self.bindings.sync( );
                //    }
                //}
                //    if ( callback ) {
                //        callback( self.$el.html( ), toClient );
                //    }
                //} else {

                html = compiled( extend( data, extendObj ) );

                return callback( html, toClient );
                // }
            };

            _c.template.get( template, function( tmplString ) {
                var nestedComp = extractComp( tmplString ),
                    result = {};

                if ( nestedComp.length === 0 ) {
                    render( tmplString );
                } else {
                    _c.async.each( nestedComp, function( subComp, cb ) {
                            var id = uniqueId( "nested_" ),
                                regex = new RegExp( "{{{component " + subComp + "}}}", "g" ),
                                component = {
                                    type: subComp,
                                    isInstance: true,
                                    dynamic: true,
                                    id: id
                                };
                            component.clientSide = isBrowser ? true : false;

                            //var data = ( self.serialize ) ? self.serialize( ) : self;

                            var initialData = extend( data, component );

                            var inst = _c.expose( initialData );

                            /*if ( isBrowser ) {
                    tmplString = tmplString.replace( regex, "<span id='" + id + "'></span>" );
                } else {*/
                            tmplString = tmplString.replace( regex, "{{{" + id + "}}}" );
                            /*}*/

                            //var el = inst.view.$el;

                            inst.render( function( partialml, clientSide ) {

                                toClient = toClient.concat( clientSide );

                                /*if ( isBrowser ) {
                        result[ id ] = el;
                        cb( null, el );
                    } else {*/

                                result[ id ] = partialml;
                                cb( null, partialml );
                                /*}*/
                            } );
                        },
                        function( err, final ) {

                            render( tmplString, result );
                        } );
                }
            } );
            return self;
        };

    if ( module.exports ) {
        _c = module.exports;
    }

    //public API
    Component.prototype.render = defaultRender;
    Component.prototype.serialize = function( ) {
        var result = {};
        for ( var i in this ) {
            if ( i !== "template" && i !== "render" && i !== "serialize" && i !== "placeholder" && i !== "adapter" ) {
                result[ i ] = this[ i ];
            }
        }
        return result;
    };

    _c.components = components;
    _c.component = component;
    _c.expose = exposeComp;
    _c.template = template( );
    _c.tmpl = handlebars;

    _c.setEngine = function( engine ) {
        _c.tmpl = engine;
    };

    _c.setTemplateStorage = function( storage ) {
        _c.template = storage;
    };

    _c.tmpl.registerHelper( "placeholder", function( content ) {
        if ( !content ) {
            return "";
        }
        return new handlebars.SafeString( content );
    } );

    _c.init = init;

    _c.async = {};
    _c.async.each = _asyncEach;
    _c.async.map = doParallel( _asyncMap );
    _c.adapter = function( name, obj ) {
        adapters[ name ] = obj;
    };

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

    if ( isBrowser ) {
        window._c = _c;
    }

    if ( isBrowser && !deferred ) {
        init( );
    }
}( this );