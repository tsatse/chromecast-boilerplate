var applicationID = '5B9CAA18';
var protocol = 'urn:x-cast:fr.francetv.player.dojo-controller';
var currentSession;
var rotateFeedbackElement;


function sessionDiscovered(session) {
    currentSession = session;
    currentSession.addUpdateListener(function(isAlive) {
        if(!isAlive) {
            currentSession = null;
        }
    });

    currentSession.addMessageListener(protocol, function(protocol, message) {
        message = JSON.parse(message);
        if(message.type === 'setAngle') {
            updateFromAngle(message.x, message.y);
        }
    });
    currentSession.sendMessage(protocol, {type: 'getAngle'});
}

function updateFromAngle(x, y) {
    rotateFeedbackElement.style.WebkitTransform = 'rotateX(' + x + 'rad) ' + 'rotateY(' + y + 'rad)';
}
