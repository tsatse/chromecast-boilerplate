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

        sendMessage: function sendMessage(protocol, message, whenSent) {
            if(this._session) {
                this._session.sendMessage(
                    protocol,
                    message,
                    whenSent,
                    this._execListeners.bind(this, 'error')
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
                    this._execListeners('error', error);
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
                    this._execListeners('message', message, protocol);
                }.bind(this);
                this._session.addMessageListener('urn:x-cast:' + protocol, this._protocols[protocol]);
            }
        },

        _sessionDiscovered: function _sessionDiscovered(session) {
            this._execListeners('sessiondiscovered')
        },

        _initializeCastApi: function _initializeCastApi() {
            var sessionRequest = new chrome.cast.SessionRequest(this._applicationID);

            var apiConfig = new chrome.cast.ApiConfig(
                sessionRequest,
                this._sessionDiscovered.bind(this),
                function(event) {
                    if(event === chrome.cast.ReceiverAvailability.AVAILABLE) {
                        this._execListeners('receiveravailable');
                    }
                    else {
                        this._execListeners('receiverunavailable');
                    }
                }
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
