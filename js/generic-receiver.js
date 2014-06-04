(function(root) {
    root.GenericReceiver = function() {
        this._castMessageBuses = {};
        this._listeners = {
            'senderconnected': [],
            'senderdisconnected': [],
            'message': []
        };
        this.init();
    }

    root.GenericReceiver.prototype = {
        init: function init() {
            cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

            this._castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

            this._castReceiverManager.onSenderConnected = function() {
                this._connectedSenders += 1;
                this._execEventListeners('senderconnected', this._connectedSenders);
                return this._connectedSenders;
            }.bind(this);

            this._castReceiverManager.onSenderDisconnected = function() {
                connectedSenders -= 1;
                this._execEventListeners('senderdisconnected', this._connectedSenders);
                return connectedSenders;
            }.bind(this);
        },

        start: function start() {
            this._castReceiverManager.start();
        },

        addMessageProtocol: function setMessageProtocol(protocol, type) {
            if(type === undefined ) {
                type = cast.receiver.CastMessageBus.MessageType.JSON;
            }
            this._castMessageBuses[protocol] = this._castReceiverManager.getCastMessageBus('urn:x-cast:' + protocol, type);
            this._castMessageBuses[protocol].onMessage = function(message) {
                this._execEventListeners('message', message, protocol);
            }.bind(this);
        },

        _execEventListeners: function execEventListeners(eventName) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._listeners[eventName].forEach(
                function(callback) {
                    callback.apply(callback, args);
                }.bind(this)
            );
        },

        addEventListener: function addEventListener(eventName, callback) {
            this._listeners[eventName].push(callback);
        },

        removeEventListener: function removeEventListener(eventName, callback) {
            this._listeners[eventName] = this._listeners[eventName].filter(function(currentCallback) {
                return currentCallback !== callback;
            });
        }
    };
})(this);
