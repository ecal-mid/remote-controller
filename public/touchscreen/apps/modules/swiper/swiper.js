var SwiperXY = function (socket, options) {
    if(!socket) this.socket = { emit: function () { console.log("No Socket") } };
    this.socket = socket;

    if(!options) options = {};
    this.name      = options.name      !== undefined ?
                     options.name      : "";
    this.eventName = options.eventName !== undefined ?
                     options.eventName : "swipe";
    this.axis      = options.axis      !== undefined ?
                     options.axis      : "both";
    this.direction = "";

    this.DOMElement = document.createElement('div');
    this.DOMElement.classList.add('module', 'swiper');

    this.xDown = null;
    this.yDown = null;

    this.blobs = document.createElement('div');
    this.blobs.classList.add('blobs');
    this.DOMElement.appendChild(this.blobs);

    blob = document.createElement('div');
    blob.classList.add('blob');
    this.blobs.appendChild(blob);

    trace = document.createElement('div');
    trace.classList.add('trace');
    this.blobs.appendChild(trace);

    var name = document.createElement('p');
    name.classList.add('name');
    name.innerHTML = this.name;
    this.DOMElement.appendChild(name);

    modules.appendChild(this.DOMElement);

    this.init();
}

SwiperXY.prototype = {

    init: function() {
        addMultipleEventListener('touchstart mousedown', this.DOMElement, (function (e) {
            this.onStart(e);
        }).bind(this));

        addMultipleEventListener('touchmove mousemove', this.DOMElement, (function (e) {
            e.preventDefault();
            this.onMove(e);
        }).bind(this));
    },

    onStart: function(e) {
        this.blobs.classList.remove('left-swipe');
        this.blobs.classList.remove('right-swipe');
        this.blobs.classList.remove('up-swipe');
        this.blobs.classList.remove('down-swipe');

        var position = getRelativePointerPos(e, this.DOMElement);
        position = this.limit(position);
        this.xDown = position.x;
        this.yDown = position.y;
    },

    onMove: function (e) {
        if (!this.xDown || !this.yDown) {
            return;
        }

        var position = getRelativePointerPos(e, this.DOMElement);
        position = this.limit(position);

        var xUp = position.x;
        var yUp = position.y;

        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;

        this.json = { event: this.eventName };


        if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
            if (xDiff > 0) {
                // left swipe
                // console.log('left');
                this.blobs.classList.add('left-swipe');
                this.json.direction = 'left';
                this.json = JSON.stringify(this.json);
                this.socket.emit('sendData', this.json);
            } else {
                // right swipe
                // console.log('right');
                this.blobs.classList.add('right-swipe');
                this.json.direction = 'right';
                this.json = JSON.stringify(this.json);
                this.socket.emit('sendData', this.json);
            }
        } else {
            if (yDiff > 0) {
                // up swipe
                // console.log('up');
                this.blobs.classList.add('up-swipe');
                this.json.direction = 'up';
                this.json = JSON.stringify(this.json);
                this.socket.emit('sendData', this.json);
            } else {
                // down swipe
                // console.log('down');
                this.blobs.classList.add('down-swipe');
                this.json.direction = 'down';
                this.json = JSON.stringify(this.json);
                this.socket.emit('sendData', this.json);
            }
        }

        this.xDown = null;
        this.yDown = null;
    },

    limit: function (position) {
        position.x = position.x;
        position.y = position.y;
        return position;
    }
}

// var SwiperX = function (socket, options) {

//     if (!options) options = {};
//     options.eventName = options.eventName !== undefined ?
//         options.eventName : "swipeX";
//     options.axis = options.axis !== undefined ?
//         options.axis : "x";
//     return new SwiperXY(socket, options);

// }

// var SwiperY = function (socket, options) {

//     if (!options) options = {};
//     options.eventName = options.eventName !== undefined ?
//         options.eventName : "swipeY";
//     options.axis = options.axis !== undefined ?
//         options.axis : "y";
//     return new SwiperXY(socket, options);

// }
