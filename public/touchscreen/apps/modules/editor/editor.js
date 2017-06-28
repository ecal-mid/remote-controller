var Editor = function(resolution) {
    this.width  = modules.offsetWidth  / resolution;
    this.height = modules.offsetHeight / resolution;

    this.resolution = resolution;

    this.DOMElement = document.createElement('div');
    this.DOMElement.classList.add('editor');

    this.anchors = [];
    for(var y = 0; y <= resolution; y++) {
        for(var x = 0; x <= resolution; x++) {
            var anchor = document.createElement('div');
            anchor.classList.add('anchor');
            anchor.style.width  = this.width + "px";
            anchor.style.height = this.height + "px";
            anchor.style.left   = (x * this.width - this.width / 2) + "px";
            anchor.style.top    = (y * this.height - this.height / 2) + "px";
            anchor.posX = x;
            anchor.posY = y;
            this.DOMElement.appendChild(anchor);
            this.anchors.push(anchor);
        }
    }

    this.preview = document.createElement('div');
    this.preview.classList.add('preview');
    this.DOMElement.appendChild(this.preview);

    var bar = document.createElement('div');
    bar.classList.add('bar');
    this.DOMElement.appendChild(bar);

    var resetBtn = document.createElement('div');
    resetBtn.classList.add('reset');
    resetBtn.innerHTML = "Reset";
    resetBtn.addEventListener('click', this.reset.bind(this));
    bar.appendChild(resetBtn);

    this.saveBtn = document.createElement('a');
    this.saveBtn.classList.add('save');
    this.saveBtn.innerHTML = "Save";
    bar.appendChild(this.saveBtn);

    this.json = [];

    modules.appendChild(this.DOMElement);

    this.init();
}

Editor.prototype = {

    init: function() {
        this.index = 0;
        for(var i = 0, m = apps[apps.length - 1].modules, l = m.length; i < l; i++) {
            m[i].DOMElement.style.width  = "0";
            m[i].DOMElement.style.height = "0";
        }

        this.movingCursor = false;
        addMultipleEventListener('touchstart mousedown', this.anchors, (function(e) {
            if(this.index < apps[apps.length - 1].modules.length) {
                this.movingCursor       = true;
                this.firstAnchor        = e.target;
                this.previousAnchor     = e.target;
                this.preview.style.left = (e.target.offsetLeft + this.width / 2 - 1) + "px";
                this.preview.style.top  = (e.target.offsetTop + this.height / 2 - 1) + "px";
                this.preview.classList.add('active');
            }
        }).bind(this));

        addMultipleEventListener('touchmove mousemove', modules, (function(e) {
            e.preventDefault();
            if(this.movingCursor) {
                var pointer = e;
                if(pointer.changedTouches) {
                    pointer = {
                        clientX: e.changedTouches[0].clientX,
                        clientY: e.changedTouches[0].clientY
                    };
                }
                var anchor = document.elementFromPoint(pointer.clientX, pointer.clientY);
                if(anchor != this.previousAnchor && anchor.classList.contains('anchor')) {
                    this.preview.style.width  = Math.abs(anchor.offsetLeft - this.firstAnchor.offsetLeft) + 2 + "px";
                    this.preview.style.height = Math.abs(anchor.offsetTop - this.firstAnchor.offsetTop) + 2 + "px";
                    var change = false;
                    if(anchor.offsetLeft < this.firstAnchor.offsetLeft || anchor.offsetLeft == this.firstAnchor.offsetLeft) {
                        this.preview.style.left = (anchor.offsetLeft + this.width / 2 - 1) + "px";
                        change = true;
                    }
                    if(anchor.offsetTop < this.firstAnchor.offsetTop || anchor.offsetTop == this.firstAnchor.offsetTop) {
                        this.preview.style.top  = (anchor.offsetTop + this.height / 2 - 1) + "px";
                        change = true;
                    }
                    this.previousAnchor = anchor;
                }
            }
        }).bind(this));

        addMultipleEventListener('touchend mouseup', modules, (function(e) {
            if(this.movingCursor) {
                this.movingCursor = false;
                var module = apps[apps.length - 1].modules[this.index];
                var left   = this.firstAnchor.posX < this.previousAnchor.posX ?
                             this.firstAnchor.posX : this.previousAnchor.posX;
                left      *= 100 / this.resolution;
                var top    = this.firstAnchor.posY < this.previousAnchor.posY ?
                             this.firstAnchor.posY : this.previousAnchor.posY;
                top       *= 100 / this.resolution;
                var width  = Math.abs(this.firstAnchor.posX - this.previousAnchor.posX);
                width     *= 100 / this.resolution;
                var height = Math.abs(this.firstAnchor.posY - this.previousAnchor.posY);
                height    *= 100 / this.resolution;
                module.DOMElement.style.left   = left + "%";
                module.DOMElement.style.top    = top + "%";
                module.DOMElement.style.width  = width + "%";
                module.DOMElement.style.height = height + "%";
                if(left == 0) module.DOMElement.style.borderLeft              = 'none';
                if(top  == 0) module.DOMElement.style.borderTop               = 'none';
                if(left + width == 100) module.DOMElement.style.borderRight   = 'none';
                if(top + height == 100) module.DOMElement.style.borderBottom  = 'none';
                this.json.push({
                    "left"   : left,
                    "top"    : top,
                    "width"  : width,
                    "height" : height,
                })
                this.preview.style.left   = "";
                this.preview.style.top    = "";
                this.preview.style.width  = "";
                this.preview.style.height = "";
                this.preview.classList.remove('active');
                this.index++;
            }
            var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.json));
            this.saveBtn.setAttribute("href", data);
            this.saveBtn.setAttribute("download", "data.json");
        }).bind(this));
    },

    reset: function() {
        this.index = 0;
        for(var i = 0, m = apps[apps.length - 1].modules, l = m.length; i < l; i++) {
            m[i].DOMElement.style.width  = "0";
            m[i].DOMElement.style.height = "0";
        }
        this.json = [];
    }

}
