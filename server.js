var express = require('express')
var app    = express();
var server = require('http').Server(app);
var io     = require('socket.io')(server);
var ip     = require('ip');
var PORT   = 8000;

app.use(express.static('public'));

server.listen(PORT, function(){
    console.log((new Date()))
    console.log('Server running:');
    console.log(ip.address() + ':' + PORT);
});

var datascreen;
var application;
var touchscreen;
io.on('connection', function(socket){
    socket.emit('type');

    socket.on('disconnect', function() {
        if(this == datascreen) {
            datascreen = null;
            console.log('The data screen disconnected');
        } else if(this == touchscreen) {
            touchscreen = null;
            console.log('The touch screen disconnected');
        } else if(this == application) {
            application = null;
            console.log('The application disconnected');
        } else {
            console.log('A client\'s connection was refused\n');
        }
    });

    socket.on('type', function(json) {
        json = JSON.parse(json);
        if(json.type == 'datascreen' && !datascreen) {
            datascreen = socket;
            this.emit('onConnection');
            console.log('The data screen is now connected');
        } else if(json.type == 'touchscreen' && !touchscreen) {
            touchscreen = socket;
            this.emit('onConnection');
            console.log('The touch screen is now connected');
        } else if(json.type == 'application' && !application) {
            application = socket;
            this.emit('onConnection');
            console.log('The application is now connected');
        } else {
            this.emit('noConnection');
            console.log('A client of type: ' + json.type + ' tried to connect');
        }
    });

    socket.on('sendData', function(json) {
        if(this == touchscreen && datascreen && application) {
            application.emit('sendData', json);
        }
        json = JSON.parse(json);
        if(this == touchscreen) {
            this.emit(json.event);
        }
    });

    socket.on('switchApp', function(json) {
        if(this == touchscreen && datascreen && application) {
            datascreen.emit('switchApp', json);
        }
    });

    socket.on('loading', function() {
        if(this == touchscreen && datascreen && application) {
            datascreen.emit('loading');
        }
    });

    socket.on('applicationLoaded', function() {
        if(this == datascreen && touchscreen) {
            touchscreen.emit('applicationLoaded');
        }
    });
});
