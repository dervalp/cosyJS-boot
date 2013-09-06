var handlebars = require( "handlebars" );

! function( r ) {
    "use strict";

    var _c,
        apps = [ ],
        isBrowser = typeof window !== "undefined",
        root = isBrowser ? window : r,
        t = {},
        adapters = {},
        plugins = {},
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
        nativeSlice = arrayProto.slice,
        nativeForEach = arrayProto.forEach,
        functionType = "[object Function]",
        bootstrapValues = ( isBrowser && config.conf ) ? config.conf : [],
        ctrls = config.controllers ? config.controllers : [ ],
        idCounter = 0,
        uniqueId = function( prefix ) {
            var id = ++idCounter + "";
            return prefix ? prefix + id : id;
        },
        extend = function( obj ) {
            nativeForEach.call( nativeSlice.call( arguments, 1 ), function( source ) {
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
                var args = nativeSlice.call( arguments );
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
            //!!! Verify - wierd !!!
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
                    depth: getDepth( el ),
                    components: []
                } );
            } );

            callback( els );
        },
        getInitialValue = function( comp ) {

            var init = bootstrapValues.filter(function(cmp) {
                return cmp.id === comp.id;
            });

            if ( init.length === 0 ) {
                return comp;
            } else {
                init = init[0];

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
            var request = "/cosy/load/",
                start = "=[",
                end = "]",
                mod = type ? type : "comp";

            return request + mod + ".js?mod" + start + types.join( "," ) + end;
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
        inherits = function(base, init, proto ) {
            var child = function( ) {
                return base.apply( this, arguments );
            };
            extend( child, base );

            var Surrogate = function( ) {
                this.constructor = child;
            };

            Surrogate.prototype = base.prototype;
            child.prototype = new Surrogate( );

            child.prototype.initialize = init || function( ) { };
            if ( proto ) {
                for ( var i in proto ) {
                    if ( proto.hasOwnProperty( i ) ) {
                        child.prototype[ i ] = proto[ i ];
                    }
                }
            }

            child.__super__ = base.prototype;

            return child;

        },
        initializeProperties = function(obj, properties) {
            for ( var i in properties ) {
                if ( properties.hasOwnProperty( i ) ) {
                    obj[ i ] = properties[ i ];
                }
            }
        },
        initializePlugins = function(initial, app, el) {
            if(this.plugins) {
                var plugin = plugins[this.plugins];

                if(plugin && plugin.initialize) {
                    plugin.initialize.apply(this, arguments);
                }
            }
        },
        exposePlugins = function( comp ) {
            if(comp && comp.plugins) {
                var plugin = plugins[comp.plugins];

                if(plugin && plugin.expose) {
                    plugin.expose.apply(this, arguments);
                }
            }
        },
        Component = function( initial, app, el ) {

            initializeProperties(this, initial);

            if ( isBrowser ) {
                this.el = el;
            }

            this.app = app;

            initializePlugins.apply( this, arguments);

            this.initialize.apply( this, arguments );
        },
        extractProto = function( def ) {
            var protoprops = {};
            for ( var i in def ) {
                if ( def.hasOwnProperty( i ) ) {
                    var proto = def[ i ];
                    if ( typeof proto === "function" && i !== "initialize" && i !== "constructor" ) {
                        protoprops[ i ] = proto;
                    }
                }
            }
            return protoprops;
        },
        makeComponent = function(adapt, init, proto) {
            var baseComp = Component;

            if( adapt ) {
                var adapter = adapters[ adapt ];

                if(adapter.constructor !== {}.constructor) {
                    baseComp = adapter.constructor;
                }

                baseComp.prototype.initialize = (adapter.initialize) ? adapter.initialize : function() {};
                baseComp.prototype.render = ( adapter.render ) ? adapter.render : defaultRender;
                baseComp.prototype.serialize = ( adapter.serialize ) ? adapter.serialize : defaultSerialize;

            }
            return inherits(baseComp, init, proto);
        },
        exposeComp = function( comp, app ) {
            //if already registered
            if ( isBrowser && comp.el.__cosy ) {
                return;
            }

            var def = components[ comp.type ] || {},
                initial = getInitialValue( comp ),
                init = def.initialize,
                proto = extractProto( def ),
                result,
                Component,
                render = defaultRender;

            Component = makeComponent(initial.adapter, init, proto);

            result = new Component(initial, app, comp.el, _c);

            if ( isBrowser ) {
                app[ comp.id ] = result;
                app.components.push(result);
                comp.el.__cosy = true;
            }

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

            comps.sort( byDepth ).reverse( ).forEach( function(c) { exposeComp( c, app ); } );
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

            if ( content.toSring() === functionType) {
                return content.call( module );
            }
        },
        init = function( cb ) {
            fetchComps( function( ) {
                parseApps( function( ) {

                    apps.sort( byDepth ).reverse( ).forEach( exposeApp );
                    apps.forEach( function(app) {
                        app.components.forEach(exposePlugins);
                    });
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

                    if ( extendObj ) {
                        data.disabledBinding = true;
                    }

                    toClient.push( data );
                }

                var compiled = _c.tmpl.compile( tmplContent );

                extendObj = extendObj || {};

                if ( self.hasPlaceholder ) {
                    return callback( compiled, toClient );
                }

                if ( isBrowser ) {
                    html = compiled( self.model.toJSON( ) );
                    self.el.innerHTML = html;
                    for ( var ex in extendObj ) {
                        if(extendObj.hasOwnProperty(ex)) {
                            self.el.querySelectorAll( "#" + ex ).innerHTML = extendObj[ ex ];
                        }
                    }
                //if (self.model.attributes) {
                //    if ( !data.disabledBinding && !self.model.get( "disabledBinding" ) ) {
                //        self.bindings.build( );
                //        self.bindings.bind( );
                //        self.bindings.sync( );
                //    }
                //}
                    if ( callback ) {
                        callback( self.$el.html( ), toClient );
                    }
                } else {

                    html = compiled( extend( data, extendObj ) );

                    return callback( html, toClient );
                }
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

                            if ( isBrowser ) {
                                tmplString = tmplString.replace( regex, "<span id='" + id + "'></span>" );
                            } else {
                                tmplString = tmplString.replace( regex, "{{{" + id + "}}}" );
                            }

                            var el = inst.el;

                            inst.render( function( partialml, clientSide ) {

                                toClient = toClient.concat( clientSide );

                                if ( isBrowser ) {
                                    result[ id ] = el;
                                    cb( null, el );
                                } else {

                                    result[ id ] = partialml;
                                    cb( null, partialml );
                                }
                            } );
                        },
                        function( err, final ) {
                            render( tmplString, result );
                        } );
                }
            } );
            return self;
        },
        defaultSerialize = function( ) {
            var result = {};
            for ( var i in this ) {
                if ( i !== "template" && i !== "render" && i !== "serialize" && i !== "placeholder" && i !== "app" ) {
                    var a = this[ i ];
                    if ( typeof a !== "function" ) {
                        result[ i ] = a;
                    }
                }
            }
            return result;
        };

    if ( module.exports ) {
        _c = module.exports;
    }

    //public API
    Component.prototype.initialize = function( ) {};
    Component.prototype.render = defaultRender;
    Component.prototype.serialize = defaultSerialize;

    _c.components = components;
    _c.adapters = adapters;
    _c.plugins = plugins;
    _c.component = component;

    _c.Component = Component;

    _c.initializeProperties = initializeProperties;
    _c.initializePlugins = initializePlugins;
    _c.isBrowser = isBrowser;
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
    _c.plugin = function( name, obj ) {
        plugins[ name ] = obj;
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