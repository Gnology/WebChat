var socketio = require('socket.io');
var namesUsed = [];
var nickNames = {};
var guestNumber = 1;
var io;


exports.listen = function(server) {
    io = socketio.listen(server);

    io.on('connection', function (socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        console.log(nickNames[socket.id] + ' connected');

        socket.on('set name', function(newName){
            changeGuestName(socket, nickNames, namesUsed, newName);
            io.emit('change html');
            console.log('new name: ' + newName);
        });

        socket.on('disconnect', function () {
            console.log(nickNames[socket.id] + ' disconnected');
        });

    });

};

function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    namesUsed.push(name);
    return guestNumber + 1;
}

function changeGuestName(socket, nickNames, namesUsed, newName){
    nickNames[socket.id] = newName;
    namesUsed.push(newName);
}