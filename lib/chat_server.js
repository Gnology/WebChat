var socketio = require('socket.io');
var namesUsed = [];
var nickNames = {};
var guestNumber = 1;
var io;


exports.listen = function(server) {
    io = socketio.listen(server);

    io.on('connection', function (socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

        handleSettingName(socket, nickNames, namesUsed);
        handleMessageBroadcasting(socket, io);
        handleDisconnection(socket, nickNames, namesUsed);

    });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    namesUsed.push(name);
    return guestNumber + 1;
}

function updateUsersList(io, namesUsed){
    io.emit('update list', namesUsed);
}

function changeGuestName(socket, nickNames, namesUsed, newName){
    nickNames[socket.id] = newName;
    namesUsed.push(newName);
    updateUsersList(io, namesUsed);
}

function removeName(socket, nickNames,namesUsed){
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
}

function processNewName(namesUsed, newName){
    newName = newName.trim();
    if(newName.length <= 1) {return false;}
    if(contains(namesUsed, newName)) {return false; }
    else{ return true;}
}

function handleMessageBroadcasting(socket, io){
    socket.on('chat message', function(msg){
        console.log(nickNames[socket.id] + ': ' + msg);
        io.emit('show message', nickNames[socket.id] + ': ' + msg);
    });
}

function handleDisconnection(socket, nickNames, namesUsed){
    socket.on('disconnect', function () {
        console.log(nickNames[socket.id] + ' disconnected');
        removeName(socket, nickNames, namesUsed);
        updateUsersList(io, namesUsed);
    });
}

function handleSettingName(socket, nickNames, namesUsed){
    socket.on('set name', function(newName){
        if(processNewName(namesUsed, newName)) {
            changeGuestName(socket, nickNames, namesUsed, newName);
            io.to(socket.id).emit('change html', newName);
        } else
        {
            io.to(socket.id).emit('inform user', {info: 'Choose other nickname' });
        }
    });
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

