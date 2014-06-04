(function(root) {
    root.GenericSender = function(applicationId) {
        if(applicationId !== undefined) {
            this.setApplicationId(applicationId);
        }
        this._castMessageBuses = {};
        this._session = null;
        this._listeners = {
            'receiveravailable': [],
            'receiverunavailable': [],
            'message': [],
            'sessiondiscovered': [],
            'error': []
        };
        this._protocols = {};
    }

    root.GenericSender.prototype = {
        _listenToChromecast: function _listenToChromecast() {
            if (!chrome.cast || !chrome.cast.isAvailable) {
              setTimeout(this._initializeCastApi.bind(this), 1000);
            }
        },

        addEventListener: function addEventListener(eventName, callback) {
            this._listeners[eventName].push(callback);
        },

        setApplicationId: function setApplicationId(applicationId) {
            this._applicationID = applicationId;
        },

        start: function start() {
            this._listenToChromecast();
        },

        addMessageProtocol: function addMessageProtocol(protocol) {
            if(this._session) {
                this._listenForProtocol(protocol);
            }
        },
 
        setSession: function setSession(session) {
            if(this._session) {
                this._removeCurrentSession();
            }
            this._session = session;
            this._session.addUpdateListener(function(isAlive) {
                if(!isAlive) {
                    this._removeCurrentSession();
                }
            }.bind(this));
            Object.keys(this._protocols).forEach(this._listenForProtocol.bind(this));
        },

        _execEventListeners: function _execEventListeners(eventName) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._listeners[eventName].forEach(function(callback) { 
                callback.apply(callback, args);
            });
        },

        sendMessage: function sendMessage(protocol, message, whenSent) {
            if(this._session) {
                this._session.sendMessage(
                    'urn:x-cast:' + protocol,
                    message,
                    whenSent,
                    this._execEventListeners.bind(this, 'error')
                );
            }
            else {
                throw(new Error('cannot send a message without a session'));
            }
        },

        requestSession: function requestSession() {
            chrome.cast.requestSession(
                this._sessionDiscovered.bind(this),
                function(error) {
                    this._execEventListeners('error', error.code);
                }.bind(this)
            );
        },

        getSession: function getSession() {
            return this._session;
        },

        _removeCurrentSession: function _removeCurrentSession() {
            // TODO: here unlisten to protocols and close session
        },

        _listenForProtocol: function _listenForProtocol(protocol) {
            if(this._session) {
                this._protocols[protocol] = function(protocol, message) {
                    this._execEventListeners('message', message, protocol);
                }.bind(this);
                this._session.addMessageListener('urn:x-cast:' + protocol, this._protocols[protocol]);
            }
        },

        _sessionDiscovered: function _sessionDiscovered(session) {
            this._execEventListeners('sessiondiscovered', session);
        },

        _initializeCastApi: function _initializeCastApi() {
            var sessionRequest = new chrome.cast.SessionRequest(this._applicationID);

            var apiConfig = new chrome.cast.ApiConfig(
                sessionRequest,
                this._sessionDiscovered.bind(this),
                function(event) {
                    if(event === chrome.cast.ReceiverAvailability.AVAILABLE) {
                        this._execEventListeners('receiveravailable');
                    }
                    else {
                        this._execEventListeners('receiverunavailable');
                    }
                }.bind(this) 
            );
            chrome.cast.initialize(
                apiConfig,
                function() {
                    console.log('initialized');
                },
                function(error) {
                    console.log('error while initializing chromecast : ', error);
                }
            );
        }
    };
})(this);
