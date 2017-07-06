/* math functions */
function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

function random(min, max) {
    if(min == max) return min;
    var min = min < max ? min : max;
    var max = max > min ? max : min;
    return min + Math.random() * (max - min);
};

function constrain(val, min, max) {
    var min = min < max ? min : max;
    var max = max > min ? max : min;
    return Math.min(Math.max(val, min), max);
};

/* get el position relative to the window top-left corner */
function getOffsetPos(el) {
    var box = el.getBoundingClientRect();
    return { x: box.left, y: box.top };
}

/* get mouse position relative to el top-left corner */
function getRelativePointerPos(e, el) {
    var xy      = getOffsetPos(el);
    var pointer = e;
    if(pointer.changedTouches) {
        pointer = {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        };
    }
    return { x: pointer.clientX - xy.x, y: pointer.clientY - xy.y }
}

/* animation function, duration is set with frames (depends on fps...) */
var animations = [];

function startAnimation(options) {
    if(!checkAndDeleteAnimation(options)) {
        animations.push(new Animation(options));
    }
}

function updateAnimations() {
    for(var i = animations.length - 1; i >= 0; i--) {
        if(animations[i].update()) animations.splice(i, 1);
    }
}

function checkAndDeleteAnimation(options) {
    for(var i = animations.length - 1; i > 0; i--) {
        if(animations[i].target   == options.target &&
           animations[i].property == options.property) {
            animations.splice(i, 1, new Animation(options));
            return true;
        }
    }

    return false;
}

var Animation = function(options) {
    this.target   = options.target;
    this.property = options.property;
    this.duration = options.duration !== undefined ?
                    options.duration : 60;
    this.easeFunc = options.easeFunc !== undefined ?
                    options.easeFunc : expEaseInOut;
    this.from     = options.from !== undefined ?
                    options.from : this.target[this.property];
    this.to       = options.to;
    this.delay    = options.delay !== undefined ?
                    options.delay : 0;
    this.unit     = options.unit !== undefined ?
                    options.unit : 0;
    this.start    = options.start !== undefined ?
                    options.start :
                    function() {
                        var str = "Animation for ";
                        str += this.target;
                        str += "[";
                        str += this.property;
                        str += "] has started";
                        // console.log(str);
                    };
    this.finish   = options.finish !== undefined ?
                    options.finish :
                    function() {
                        var str = "Animation for ";
                        str += this.target;
                        str += "[";
                        str += this.property;
                        str += "] has finished";
                        // console.log(str);
                    };
    this.currTime = 0;

    this.start();
};

Animation.prototype = {
    update: function() {
        if(this.duration == 0) console.log("DELETE");
        else if(this.currTime > this.delay) {
            var x = (this.currTime - this.delay) / this.duration;
            var y = this.easeFunc(x, 0.75);

            if(this.target[this.property] instanceof Vector) {
                console.log(this.from);
                this.target[this.property] = Vector.map(y, 0, 1, this.from, this.to);
            } else {
                this.target[this.property] = map(y, 0, 1, this.from, this.to);
                this.target[this.property] += this.unit;
            }
        }

        this.currTime++;

        return this.isFinished();
    },

    isFinished: function() {
        if(this.currTime >= this.delay + this.duration) {
            if(this.target[this.property] instanceof Vector) {
                this.target[this.property].equals(this.to);
            } else {
                this.target[this.property] = this.to;
            }
            this.finish();
            return true;
        }

        return false;
    }
};

/* http://www.flong.com/texts/code/shapers_exp/ */
var expEaseInOut = function(x, a){
    var epsilon = 0.00001,
        minA    = 0.0 + epsilon;
        maxA    = 1.0 - epsilon;
    a = constrain(a, minA, maxA);
    a = 1.0 - a;

    var y = 0;
    if(x <= 0.5){
        y = (Math.pow(2.0 * x, 1.0 / a)) / 2.0;
    } else {
        y = 1.0 - (Math.pow(2.0 * (1.0 - x), 1.0 / a)) / 2.0;
    }

    return y;
};

/* vectors */
var Vector = function(x, y, z, a) {
    this.x = x;
    this.y = y;
    this.z = z !== undefined ? z : 0;
    this.a = a !== undefined ? a : 1;
}

Vector.add = function(vec1, vec2) {
    return new Vector(vec1.x + vec2.x,
                      vec1.y + vec2.y,
                      vec1.z + vec2.z,
                      vec1.a + vec2.a);
}
Vector.sub = function(vec1, vec2) {
    return new Vector(vec1.x - vec2.x,
                      vec1.y - vec2.y,
                      vec1.z - vec2.z,
                      vec1.a - vec2.a);
}
Vector.map = function(val, inMin, inMax, vec1, vec2) {
    return new Vector(map(val, inMin, inMax, vec1.x, vec2.x),
                      map(val, inMin, inMax, vec1.y, vec2.y),
                      map(val, inMin, inMax, vec1.z, vec2.z),
                      map(val, inMin, inMax, vec1.a, vec2.a));
}

Vector.prototype = {
    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        this.a += vec.a;
        return this;
    },

    sub: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        this.a -= vec.a;
        return this;
    },

    mult: function(val) {
        this.x *= val;
        this.y *= val;
        this.z *= val;
        this.a *= val;
        return this;
    },

    limit: function(val) {
        this.x = this.x > val ? val : this.x;
        this.y = this.y > val ? val : this.y;
        this.z = this.z > val ? val : this.z;
        this.a = this.a > val ? val : this.a;
        return this;
    },

    set: function(x, y, z, a) {
        this.x = x;
        this.y = y;
        this.z = z !== undefined ? z : 0;
        this.a = a !== undefined ? a : 1;
    },

    equals: function(vec) {
        return this.x == vec.x &&
               this.y == vec.y &&
               this.z == vec.z &&
               this.a == vec.a;
    }
}

/* add multiple event listeners with the same callback */
function addMultipleEventListener(e, el, callback) {
    e = e.split(' ');
    if(el.length) {
        for(var i = 0, l = el.length; i < l; i++) {
            for(var j = 0, ll = e.length; j < l; j++) {
                el[i].addEventListener(e[j], callback, false);
            }
        }
    } else {
        for(var i = 0, l = e.length; i < l; i++) {
            el.addEventListener(e[i], callback, false);
        }
    }
}

/* ajax, slightly simpler */
var AJAX = function(callback) {
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener('readystatechange', function() {
        if(this.readyState == 4 && this.status == 200) {
            var url = this.responseURL;
            url = url.substring(0, url.indexOf('?'));

            callback(this.responseText, url);
        }
    });
}

AJAX.prototype = {
    get: function(url) {
        if(url.indexOf('ajax=true') == -1) {
            if(url.indexOf('?') == -1) {
                url += '?ajax=true';
            } else {
                url += '&ajax=true';
            }
        }
        this.xhr.open('GET', url, true);
        this.xhr.send();
    }
}

/* custom event emitter */
function Emitter() {
    var eventTarget = document.createDocumentFragment();

    function delegate(method) {
        this[method] = eventTarget[method].bind(eventTarget);
    }

    [
        "addEventListener",
        "dispatchEvent",
        "removeEventListener"
    ].forEach(delegate, this);
}

/* cookies */
function setCookie(name, value, days) {
    days = days !== undefined ? days : 1;
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + "; " + expires + ";path=/";
}

function getCookie(name) {
    name += "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
