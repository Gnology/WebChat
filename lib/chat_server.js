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
            if(processNewName(namesUsed, newName)) {
                changeGuestName(socket, nickNames, namesUsed, newName);
                io.emit('change html', newName);
            } else
            {
                io.emit('inform user', {info: 'Choose other nickname' });
            }
        });

        socket.on('chat message', function(msg){
           console.log(nickNames[socket.id] + ': ' + msg);
        });

        socket.on('disconnect', function () {
            removeName(socket, nickNames, namesUsed);
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

function removeName(socket, nickNames,namesUsed){
    for (var i = (namesUsed.length-1); i>=0; i--) {
        if (namesUsed[i] === nickNames[socket.id]) {
            namesUsed.splice(i, 1);
        }
    }
}

function processNewName(namesUsed, newName){
    console.log(namesUsed.length);
    if(contains(namesUsed,newName)) {return false; }
    else{ return true;}
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}