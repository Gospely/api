//socket io module
var socketIo = require('socket.io');

// create a new ojbect file_socket
var file_socket = {};

//file_socket property
// io object
file_socket.io = false;

file_socket.map = {};



//file_socket initialization with the passing http object
file_socket.init = function(http) {
    console.log("socket start");
    this.io = socketIo(http);
    this.ioListen();
};

// major socket listening method
file_socket.ioListen = function() {

    console.log("socket listen");

    var that = this;

    this.io.on('connection', function(socket){
        console.log("socket connect");
        that.io.to(socket.id).emit('welcome!',welcome);
    });
};

file_socket.map = function (socket) {

    var that = this;

    socket.on('userId:',function (data) {

        that.map[socket.id] = data;

    });

};

file_socket.disconnnect = function (socket) {

    socket.on('disconnect',function () {
        socket.leave(socket.id);
    })

};



module.exports = file_socket;