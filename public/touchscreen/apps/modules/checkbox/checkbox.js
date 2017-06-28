var Checkbox = function(socket, options, multiple) {
    if(!socket) this.socket = { emit : function() { console.log("No Socket") } };
    this.socket = socket;

    if(!options) options = {};
    this.name         = options.name         !== undefined ?
                        options.name         : "";
    this.eventName    = options.eventName    !== undefined ?
                        options.eventName    : "checkbox";
    this.caption      = options.caption      !== undefined ?
                        options.caption      : "";
    this.default      = options.default      !== undefined ?
                        options.default      : false;
    this.keepState    = options.keepState    !== undefined ?
                        options.keepState    : true;
    this.resetOnEvent = options.resetOnEvent !== undefined ?
                        options.resetOnEvent : "";

    this.container = document.createElement('div');
    this.container.classList.add('container');

    this.button = new Button(socket, {
        "eventName"    : this.eventName,
        "state"        : this.default,
        "keepState"    : this.keepState,
        "resetOnEvent" : this.resetOnEvent
    });
    this.container.appendChild(this.button.DOMElement);

    var caption = document.createElement('p');
    caption.classList.add('caption');
    caption.innerHTML = this.caption;
    this.container.appendChild(caption);

    if(!multiple) {
        this.DOMElement = document.createElement('div');
        this.DOMElement.classList.add('module', 'checkbox');

        var name = document.createElement('p');
        name.classList.add('name');
        name.innerHTML = this.name;
        this.DOMElement.appendChild(name);

        var wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');
        wrapper.appendChild(this.container);

        this.DOMElement.appendChild(wrapper);

        document.getElementById('modules').appendChild(this.DOMElement);
    }
}

var Checkboxes = function(socket, options) {
    if(!options) options = {};
    this.name            = options.name      !== undefined ?
                           options.name      : "";
    this.eventName       = options.eventName !== undefined ?
                           options.eventName : ["checkbox1"];
    this.caption         = options.caption   !== undefined ?
                           options.caption   : [""];
    this.default         = options.default   !== undefined ?
                           options.default   : [false];
    this.keepState       = options.keepState !== undefined ?
                           options.keepState : [true];
    this.uniqueSelection = options.uniqueSelection  !== undefined ?
                           options.uniqueSelection  : false;
    this.resetOnEvent    = options.resetOnEvent !== undefined ?
                           options.resetOnEvent : "";

    this.DOMElement = document.createElement('div');
    this.DOMElement.classList.add('module', 'checkbox');

    var name = document.createElement('p');
    name.classList.add('name');
    name.innerHTML = this.name;
    this.DOMElement.appendChild(name);

    var wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    this.checkboxes  = [];
    for(var i = 0, l = this.eventName.length; i < l; i++) {
        var checkbox = new Checkbox(socket, {
            "eventName" : this.eventName[i],
            "caption"   : this.caption[i % this.eventName.length],
            "default"   : this.default[i % this.eventName.length],
            "keepState" : this.keepState[i % this.eventName.length]
        }, true);
        this.checkboxes.push(checkbox);
        wrapper.appendChild(checkbox.container);
    }

    this.DOMElement.appendChild(wrapper);

    if(this.uniqueSelection) {
        this.DOMElement.addEventListener('click', (function(e) {
            if(e.target.classList.contains('button')) {
                for(var i = 0, l = this.checkboxes.length; i < l; i++) {
                    if(this.checkboxes[i].button.DOMElement != e.target) {
                        this.checkboxes[i].button.switchState(false);
                    }
                }
            }
        }).bind(this));
    }

    document.getElementById('modules').appendChild(this.DOMElement);
}

var Button = function(socket, options) {
    this.socket = socket;

    if(!options) options = {};
    this.eventName    = options.eventName    !== undefined ?
                        options.eventName    : "checkbox";
    this.state        = options.default      !== undefined ?
                        options.default      : false;
    this.keepState    = options.keepState    !== undefined ?
                        options.keepState    : true;
    this.resetOnEvent = options.resetOnEvent !== undefined ?
                        options.resetOnEvent : "";

    this.DOMElement = document.createElement('div');
    this.DOMElement.classList.add('button');
    if(this.state) this.DOMElement.classList.add('active');
    if(!this.keepState) this.DOMElement.classList.add('momentary');

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

Button.prototype = {

    init: function() {
        if(this.keepState) {
            addMultipleEventListener('touchstart mousedown', this.DOMElement, function(e) {
                if(document.body.classList.contains('light')) {
                    this.style.backgroundColor = 'rgb(0, 90, 106)';
                } else {
                    this.style.backgroundColor = 'rgb(50, 50, 50)';
                }
            });

            addMultipleEventListener('touchend mouseup', this.DOMElement, function(e) {
                this.style.backgroundColor = '';
            });
        }

        this.DOMElement.addEventListener('click', this.switchState.bind(this));
    },

    switchState: function(state) {
        if(state.target) state = !this.state;
        if(!state) {
            this.DOMElement.classList.remove('active');
        } else {
            this.DOMElement.classList.add('active');
        }
        this.state = state;
        this.json  = JSON.stringify({
            event : this.eventName,
            state : this.state
        });
        this.socket.emit('sendData', this.json);
        if(state && !this.keepState) {
            setTimeout(this.reset.bind(this), 100);
        }
    },

    reset: function() {
        this.DOMElement.classList.remove('active');
        this.state = false;
    }

}
