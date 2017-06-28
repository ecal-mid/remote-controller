var Example = function(socket) {
    this.modules = [];

    this.infos = {
        "folder"       : "Example",
        "student"      : "[insert student name]",
        "project"      : "[insert project name]",
        "description"  : "[insert project description]",
        "instructions" : [
            "Instruction 1",
            "Instruction 2",
            "Instruction 3"
        ]
    }

    this.init(socket);
}

Example.prototype = {

    init: function(socket) {
        this.modules.push(new SliderXY(socket, {
            "name"         : "Slider XY",
            "eventName"    : "updateXY",
            "minX"         : -1,
            "maxX"         : +1,
            "minY"         : -1,
            "maxY"         : +1,
            "startX"       : 0,
            "startY"       : 0,
            "resetOnEvent" : ["checkbox", "swipeXY"]
        }));

        this.modules.push(new SliderX(socket, {
            "name"      : "Slider X",
            "eventName" : "updateX",
            "minX"      : -1,
            "maxX"      : +1,
            "startX"    : 0,
            "autoReset" : true
        }));

        this.modules.push(new SliderY(socket, {
            "name"      : "Slider Y",
            "eventName" : "updateY",
            "minY"      : -1,
            "maxY"      : +1,
            "startY"    : 0,
            "autoReset" : true
        }));

        this.modules.push(new Checkbox(socket, {
            "name"      : "Button",
            "eventName" : "button",
            "caption"   : "A caption displayed under the button",
            "keepState" : false
        }));

        this.modules.push(new Checkbox(socket, {
            "name"         : "Checkbox",
            "eventName"    : "checkbox",
            "caption"      : "A caption displayed under the checkbox",
            "default"      : true,
            "resetOnEvent" : "button"
        }));

        this.modules.push(new Checkboxes(socket, {
            "name"            : "Checkboxes",
            "eventName"       : ["checkbox1", "checkbox2", "checkbox3"],
            "caption"         : ["Checkbox 1", "Checkbox 2", "Checkbox 3"],
            "default"         : [true, false, false],
            "uniqueSelection" : true
        }));

        this.modules.push(new SwiperXY(socket, {
            "name"      : "Swiper XY",
            "eventName" : "swipeXY"
        }));

        this.configure();
    },

    configure: function() {
        if(Example.data.length == this.modules.length) {
            for(var i = 0, l = this.modules.length; i < l; i++) {
                var element = this.modules[i].DOMElement;
                element.style.left   = Example.data[i].left + "%";
                element.style.top    = Example.data[i].top + "%";
                element.style.width  = Example.data[i].width + "%";
                element.style.height = Example.data[i].height + "%";
                if(Example.data[i].left == 0)
                    element.style.borderLeft = 'none';
                if(Example.data[i].top  == 0)
                    element.style.borderTop = 'none';
                if(Example.data[i].left + Example.data[i].width == 100)
                    element.style.borderRight = 'none';
                if(Example.data[i].top + Example.data[i].height == 100)
                    element.style.borderBottom = 'none';
            }
        }
    }

}

Example.data = [{"left":10,"top":15,"width":40,"height":45},{"left":10,"top":0,"width":90,"height":15},{"left":0,"top":0,"width":10,"height":100},{"left":50,"top":15,"width":25,"height":45},{"left":75,"top":15,"width":25,"height":45},{"left":10,"top":60,"width":40,"height":40},{"left":50,"top":60,"width":50,"height":40}];
