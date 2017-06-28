var SliderXY = function(socket, options) {
    if(!socket) this.socket = { emit : function() { console.log("No Socket") } };
    this.socket = socket;

    if(!options) options = {};
    this.name         = options.name         !== undefined ?
                        options.name         : "";
    this.eventName    = options.eventName    !== undefined ?
                        options.eventName    : "updateXY";
    this.axis         = options.axis         !== undefined ?
                        options.axis         : "both";
    this.minX         = options.minX         !== undefined ?
                        options.minX         : -1;
    this.maxX         = options.maxX         !== undefined ?
                        options.maxX         : +1;
    this.minY         = options.minY         !== undefined ?
                        options.minY         : -1;
    this.maxY         = options.maxY         !== undefined ?
                        options.maxY         : +1;
    this.valueX       = options.startX       !== undefined ?
                        options.startX       : (this.maxX - this.minX) / 2;
    this.valueY       = options.startY       !== undefined ?
                        options.startY       : (this.maxY - this.minY) / 2;
    this.startX       = options.startX       !== undefined ?
                        options.startX       : (this.maxX - this.minX) / 2;
    this.startY       = options.startY       !== undefined ?
                        options.startY       : (this.maxY - this.minY) / 2;
    this.resetOnEvent = options.resetOnEvent !== undefined ?
                        options.resetOnEvent : "";
    this.autoReset    = options.autoReset    !== undefined ?
                        options.autoReset    : false;
    this.size         = options.size         !== undefined ?
                        options.size         : 30;


    this.DOMElement = document.createElement('div');
    this.DOMElement.classList.add('module', 'slider');

    this.handleX = document.createElement('div');
    this.handleX.classList.add('handleX');

    this.handleY = document.createElement('div');
    this.handleY.classList.add('handleY');

    this.handle = document.createElement('div');
    this.handle.classList.add('handle');

    if(this.axis == "both" || this.axis == "x") {
        this.DOMElement.appendChild(this.handleX);
    }
    if(this.axis == "both" || this.axis == "y") {
        this.DOMElement.appendChild(this.handleY);
    }
    this.DOMElement.appendChild(this.handle);

    var name = document.createElement('p');
    name.classList.add('name');
    name.innerHTML = this.name;
    this.DOMElement.appendChild(name);

    modules.appendChild(this.DOMElement);

    if(typeof this.resetOnEvent === "string") {
        if(this.resetOnEvent != "") {
            socket.on(this.resetOnEvent, this.reset.bind(this));
        }
    } else if(this.resetOnEvent instanceof Array) {
        if(this.resetOnEvent.length > 0) {
            for(var i = 0, l = this.resetOnEvent.length; i < l; i++) {
                socket.on(this.resetOnEvent[i], this.reset.bind(this));
            }
        }
    }

    this.init();
}

SliderXY.prototype = {

    init: function() {
        this.movingHandle = false;
        addMultipleEventListener('touchstart mousedown', this.handle, (function(e) {
            this.movingHandle = true;
            this.handle.classList.add('active');
            this.handle.style.top  = 0;
            this.handle.style.left = 0;
            this.handle.style.webkitTransitionDuration = "";
            this.handle.style.transitionDuration = "";
            if(this.axis == "both" || this.axis == "x") {
                this.handleX.style.webkitTransitionDuration = "";
                this.handleX.style.transitionDuration = "";
                this.handleX.style.left = 0;
            }
            if(this.axis == "both" || this.axis == "y") {
                this.handleY.style.webkitTransitionDuration = "";
                this.handleY.style.transitionDuration = "";
                this.handleY.style.top = 0;
            }
            this.moveHandle(e);
        }).bind(this));

        addMultipleEventListener('touchmove mousemove', modules, (function(e) {
            e.preventDefault();
            if(this.movingHandle) {
                this.moveHandle(e);
                this.json = { event : this.eventName };
                if(this.axis == "both" || this.axis == "x") {
                    this.json.valueX = this.valueX;
                }
                if(this.axis == "both" || this.axis == "y") {
                    this.json.valueY = this.valueY;
                }
                this.json = JSON.stringify(this.json);
                this.socket.emit('sendData', this.json);
            }
        }).bind(this));

        addMultipleEventListener('touchend mouseup', modules, (function(e) {
            if(this.movingHandle) {
                this.movingHandle = false;
                this.handle.classList.remove('active');
                var position = getRelativePointerPos(e, this.DOMElement);
                position     = this.limit(position);
                var transformation = "translate(";
                if(this.axis == "x") {
                    transformation += position.x + "px, ";
                    transformation += (this.DOMElement.offsetHeight / 2) + "px) ";
                    transformation += "translate(-50%, -50%)";
                    this.handle.style.webkitTransitionDuration = "0.3s";
                    this.handle.style.transitionDuration = "0.3s";
                    this.handle.style.webkitTransform = transformation;
                    this.handle.style.transform = transformation;
                } else if(this.axis == "y") {
                    transformation += (this.DOMElement.offsetWidth / 2) + "px, ";
                    transformation += position.y + "px) ";
                    transformation += "translate(-50%, -50%)";
                    this.handle.style.webkitTransitionDuration = "0.3s";
                    this.handle.style.transitionDuration = "0.3s";
                    this.handle.style.webkitTransform = transformation;
                    this.handle.style.transform = transformation;
                }
                if(this.autoReset) this.reset();
            }
        }).bind(this));
    },

    moveHandle: function(e) {
        var position = getRelativePointerPos(e, this.DOMElement);
        position     = this.limit(position);
        if(this.axis == "y") position.x = this.DOMElement.offsetWidth / 2;
        if(this.axis == "x") position.y = this.DOMElement.offsetHeight / 2;
        var transformation = "translate(";
        transformation    += position.x + "px, ";
        transformation    += position.y + "px) translate(-50%, -50%)";
        this.handle.style.webkitTransform = transformation;
        this.handle.style.transform = transformation;
        if(this.axis == "both" || this.axis == "x") {
            transformation  = "translateX(";
            transformation += position.x + "px) ";
            transformation += "translateX(-50%)";
            this.handleX.style.webkitTransform = transformation;
            this.handleX.style.transform = transformation;
            this.valueX = map(position.x,
                              this.size / 2,
                              this.DOMElement.offsetWidth - this.size / 2,
                              this.minX,
                              this.maxX);
        }
        if(this.axis == "both" || this.axis == "y") {
            transformation  = "translateY(";
            transformation += position.y + "px) ";
            transformation += "translateY(-50%)";
            this.handleY.style.webkitTransform = transformation;
            this.handleY.style.transform = transformation;
            this.valueY = map(position.y,
                              this.size / 2,
                              this.DOMElement.offsetHeight - this.size / 2,
                              this.minY,
                              this.maxY);
        }
    },

    limit: function(position) {
        position.x = position.x > this.size / 2 ?
                     position.x : this.size / 2;
        position.x = position.x < this.DOMElement.offsetWidth - this.size / 2 ?
                     position.x : this.DOMElement.offsetWidth - this.size / 2;
        position.y = position.y > this.size / 2 ?
                     position.y : this.size / 2;
        position.y = position.y < this.DOMElement.offsetHeight - this.size / 2 ?
                     position.y : this.DOMElement.offsetHeight - this.size / 2;
        return position;
    },

    reset: function() {
        this.valueX  = this.startX;
        this.valueY  = this.startY;
        var position = { x: 0, y: 0 };
        position.x   = (this.valueX - this.minX) / (this.maxX - this.minX);
        position.x  *= this.DOMElement.offsetWidth;
        position.y   = (this.valueY - this.minY) / (this.maxY - this.minY);
        position.y  *= this.DOMElement.offsetHeight;
        position     = this.limit(position);
        if(this.axis == "x") position.y = this.DOMElement.offsetHeight / 2;
        if(this.axis == "y") position.x = this.DOMElement.offsetWidth / 2;
        this.handle.style.top  = 0;
        this.handle.style.left = 0;
        var transformation = "translate(";
        transformation += position.x + "px, ";
        transformation += position.y + "px) ";
        transformation += "translate(-50%, -50%)";
        this.handle.style.webkitTransitionDuration = "0.3s";
        this.handle.style.transitionDuration = "0.3s";
        this.handle.style.webkitTransform = transformation;
        this.handle.style.transform = transformation;
        if(this.axis == "both" || this.axis == "x") {
            this.handleX.style.left = 0;
            transformation  = "translateX(";
            transformation += position.x + "px) ";
            transformation += "translateX(-50%)";
            this.handleX.style.webkitTransitionDuration = "0.3s";
            this.handleX.style.transitionDuration = "0.3s";
            this.handleX.style.webkitTransform = transformation;
            this.handleX.style.transform = transformation;
        }
        if(this.axis == "both" || this.axis == "y") {
            this.handleY.style.top = 0;
            transformation  = "translateY(";
            transformation += position.y + "px) ";
            transformation += "translateY(-50%)";
            this.handleY.style.webkitTransitionDuration = "0.3s";
            this.handleY.style.transitionDuration = "0.3s";
            this.handleY.style.webkitTransform = transformation;
            this.handleY.style.transform = transformation;
        }
    }
}

var SliderX = function(socket, options) {
    if(!options) options = {};
    options.eventName    = options.eventName    !== undefined ?
                           options.eventName    : "updateX";
    options.axis         = options.axis         !== undefined ?
                           options.axis         : "x";
    options.minX         = options.minX         !== undefined ?
                           options.minX         : options.min;
    options.maxX         = options.maxX         !== undefined ?
                           options.maxX         : options.max;
    options.startX       = options.startX       !== undefined ?
                           options.startX       : options.start;
    options.resetOnEvent = options.resetOnEvent !== undefined ?
                           options.resetOnEvent : "";
    options.autoReset    = options.autoReset    !== undefined ?
                           options.autoReset    : false;
    return new SliderXY(socket, options);
}

var SliderY = function(socket, options) {
    if(!options) options = {};
    options.eventName    = options.eventName    !== undefined ?
                           options.eventName    : "updateY";
    options.axis         = options.axis         !== undefined ?
                           options.axis         : "y";
    options.minY         = options.minY         !== undefined ?
                           options.minY         : options.min;
    options.maxY         = options.maxY         !== undefined ?
                           options.maxY         : options.max;
    options.startY       = options.startY       !== undefined ?
                           options.startY       : options.start;
    options.resetOnEvent = options.resetOnEvent !== undefined ?
                           options.resetOnEvent : "";
    options.autoReset    = options.autoReset    !== undefined ?
                           options.autoReset    : false;
    return new SliderXY(socket, options);
}
