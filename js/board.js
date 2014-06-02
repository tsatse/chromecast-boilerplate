var Board = function(canvasElement) {
    this._canvasElement = null;
    this._ctx = null;
    this._w = window.innerWidth;
    this._h = window.innerHeight;
    this._agents = [];
    this._spriteNumber = 10;
    this._spriteSize = 20;
    this._maxSpeed = 10;
    this._refW = this._w / 2;
    this._refH = this._h / 2;
    this._x;
    this._y;
    this._connectedSenders = 0;

    if(canvasElement) {
        this.setCanvas(canvasElement);
    }
    this._spawnAgents();
}

Board.prototype = {
    setCanvas: function setCanvas(canvasElement) {
        this._canvasElement = canvasElement;
        this._ctx = this._canvasElement.getContext('2d');
        this._canvasElement.style.marginLeft = Math.round(0.5 * (this._w - this._refW)) + 'px';
        this._canvasElement.style.marginTop = Math.round(0.5 * (this._h - this._refH)) + 'px';
        this._canvasElement.width = this._refW;
        this._canvasElement.height = this._refH;
    },

    startRenderLoop: function startRenderLoop() {
        requestAnimationFrame(this._iteration.bind(this));
    },

    setAngle: function setAngle(x, y) {
        this._canvasElement.style.WebkitTransform = 'rotateX(' + x + 'rad) ' + 'rotateY(' + y + 'rad)';
        this._x = x;
        this._y = y;
    },

    getAngle: function getAngle() {
        return {
            x: this._x,
            y: this._y
        };
    },

    _randInt: function _randInt(max) {
        return Math.floor(Math.random() * max);
    },

    _resetAgent: function _resetAgent(agent) {
        agent.x = this._randInt(this._refW);
        agent.y = this._randInt(this._refH);
        agent.dx = (Math.random() * 2 * this._maxSpeed) - this._maxSpeed / 2;
        agent.dy = (Math.random() * 2 * this._maxSpeed) - this._maxSpeed / 2;
    },

    _update: function _update() {
        var agent;

        for(var i = 0 ; i < agents.length ; i++) {
            agent = agents[i];
            agent.x += agent.dx;
            agent.y += agent.dy;
            if(
                agent.x < 0 ||
                agent.x > this._refW ||
                agent.y < 0 ||
                agent.y > this._refH
            ) {
                resetAgent(agent);
            }
        }
    },

    _render: function _render() {
        ctx.clearRect(0, 0, this._refW, this._refH);
        ctx.fillStyle = '#000';
        agents.forEach(function(agent) {
            ctx.fillRect(agent.x, agent.y, this._spriteSize, this._spriteSize);
        });
    },

    _iteration: function _iteration() {
        this._update();
        this._render();
        requestAnimationFrame(this._iteration.bind(this));
    },

    _spawnAgents: function _spawnAgents() {
        var newAgent;

        for(var i = 0 ; i < this._spriteNumber ; i++) {
            newAgent = {};
            this._resetAgent(newAgent);
            this._agents.push(newAgent);
        }
    }
};
