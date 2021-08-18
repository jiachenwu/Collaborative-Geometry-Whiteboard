//var mongojs = require("mongojs");
import {default as mongojs} from 'mongojs'
var uri = 'mongodb+srv://euclid:JbKQSWtqSvDoYnd8@webgeometry-31jda.mongodb.net/test?retryWrites=true&w=majority';
var db = mongojs(uri, ['account','construction']);

//var express = require('express');
import {default as express} from 'express'
var app = express();

import {default as http} from 'http'
var serv = http.Server(app);

//let __dirname = ".";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/client/index.html');
});
app.use('/client', express.static(__dirname+'/client'));

serv.listen(process.env.PORT || 2000);
console.log('Server started.');


import {Action} from './client/action/action.js'
import {ActionManager} from './client/action/actionmanager.js'
import {Construction} from './client/construction/construction.js'


var DEBUG = true;


let Room = function(params) {
    //let construction = Construction();
    let self = {
        id: params.id,
        name: params.name,
        creator: params.creator,  // Just a string name
        users: [],
        actions: ActionManager({construction:null}),
        construction: null
    };

    self.userJoined = function(user) {
        self.users.push(user);
    }

    self.userLeft = function(user) {
        let index = self.users.indexOf(user);
        if (index >= 0) {
            self.users.splice(index, 1);
        }
        if (user.socket.id === self.id) {
            self.close();
        }
    }

    self.close = function() {
        while (self.users.length > 0) {
            let user = self.users[self.users.length-1];
            user.exitRoom();
            user.socket.emit('leaveRoomResponse', {message:"Room was closed."});
        }
    }

    self.broadcastUsersData = function() {
        let pack = {userData:[], actions:[]};
        for (let user of self.users) {
            pack.userData.push({
                id: user.socket.id,
                mouse: user.mouse 
            });
        }
        pack.actions = self.actions.serializedActions();
        for (let user of self.users) {
            user.socket.emit('updateUsersData', pack);
        }
        self.actions.clear();  // No need to keep actions around after sending.
    }

    return self;
}


let User = function(params) {
    let self = {
        socket: params.socket,
        username: params.username,
        isHostingRoom: false,
        room: null,
        mouse: {x:0, y:0}
    };

    self.enterRoom = function(room, isHost) {
        if (self.room) self.exitRoom();
        self.room = room;
        if (isHost) self.isHostingRoom = true;
        else self.isHostingRoom = false;
        room.userJoined(self);
    }

    self.exitRoom = function() {
        if (self.room) {
            self.room.userLeft(self);
            self.room = null;
        }
        self.isHostingRoom = false;
    }

    return self;
}
User.list = {};
User.getFromUsername = function(username) {
    for (let id of Object.keys(User.list)) {
        let user = User.list[id];
        if (user.username === username)
            return user;
    }
    return null;
}


var isUsernameTaken = function(data, cb) {
    db.account.find(
        {username:data.username}, 
        function(err,res) {
            if (res.length > 0) cb(true);
            else cb(false);
        }
    );
}
var addUser = function(data, cb) {
    db.account.insert(
        {username:data.username, password:data.password}, 
        function(err) { cb(); }
    );
}
var isValidPassword = function(data, cb) {
    db.account.find(
        {username:data.username, password:data.password}, 
        function(err,res) {
            if (res.length > 0) cb(true);
            else cb(false);
        }
    );
}

var doesConstructionExist = function(data, cb) {
    db.construction.find(
        {creator:data.creator, constructionName:data.constructionName}, 
        function(err,res) {
            if (res.length > 0) cb(true);
            else cb(false);
        }
    );
}
var doesConstructionIdExist = function(data, cb) {
    db.construction.find(
        {_id:data._id}, 
        function(err,res) {
            if (res.length > 0) cb(true);
            else cb(false);
        }
    );
}
var addConstruction = function(data, cb) {
    db.construction.insert(
        {
            creator: data.creator, 
            constructionName: data.constructionName, 
            construction: data.construction,
            private: data.constructionPrivate
        }, 
        function(err) { cb(); }
    );
}
var getConstructionList = function(params, cb) {
    var { user } = params;
    db.construction.find(
        {}, 
        {creator:1, constructionName:1, private:1},
        function(err,res) { 
            var filter = res.filter(construction => {
                if (user && user.username === construction.creator) return true;
                else if ('private' in construction) return !construction['private'];
                else return true;
            })
            cb(filter); 
        }
    );
}
var getConstructionFromId = function(_id, cb) {
    db.construction.find(
        {_id:_id},
        function(err,res) { cb(res); }
    );
}


var socketList = {};

import {default as socketio} from 'socket.io'
var io = socketio(serv,{});

io.sockets.on('connection', function(socket) 
{
    socketList[socket.id] = socket;  // socket comes with a unique id.

    function leaveRoom() {
        let user = User.list[socket.id];
        if (user) {
            user.exitRoom();
            socket.emit('leaveRoomResponse');
        }
    }

    function logout() {
        let user = User.list[socket.id];
        if (user) {
            leaveRoom();
            delete User.list[socket.id];
        }
    }

    socket.on('login', function(data) {
        let user = User.list[data.username];
        if (!user) {
            isValidPassword(data, function(res) {
                if (res) {
                    let user = User({socket:socket, username:data.username});
                    User.list[socket.id] = user;
                    socket.emit('loginResponse', {success:true, username:data.username});
                }
                else {
                    socket.emit('loginResponse', {success:false, message:"Username and password do not match."});
                }
            });
        }
        else {
            socket.emit('loginResponse', {success:false, message:"Already logged in."});
        }
    });

    socket.on('logout', function() {
        logout();
    });

    socket.on('signup', function(data) {
        if (data.username && data.username.length > 0) {
            isUsernameTaken(data, function(res) {
                if (!res) {
                    addUser(data, function() {
                        socket.emit('signupResponse', {success:true});
                    });
                }
                else {
                    socket.emit('signupResponse', {success:false, message:"Username is taken."});
                }
            });
        }
        else {
            socket.emit('signupResponse', {success:false, message:"Username cannot be empty."});
        }
    });

    socket.on('saveConstruction', function(data) {
        let user = User.list[socket.id];
        if (user) {
            data.creator = user.username;
            if (data.constructionName && data.constructionName.length > 0) {
                doesConstructionExist(data, function(res) {
                    if (!res) {
                        addConstruction(data, function() {
                            socket.emit('saveConstructionResponse', {success:true});
                        });
                    }
                    else {
                        socket.emit('saveConstructionResponse', {success:false, message:"Construction with name '"+data.constructionName+"' already exists."});
                    }
                });
            }
            else {
                socket.emit('saveConstructionResponse', {success:false, message:"Construction name cannot be empty."});
            }
        }
        else {
            socket.emit('saveConstructionResponse', {success:false, message:"Not logged in."});
        }
    });

    socket.on('getConstructionList', function() {
        let user = User.list[socket.id];
        getConstructionList({ user }, function(res) {
            socket.emit('getConstructionListResponse', res);
        });
    });

    socket.on('getConstructionFromId', function(_id) {
        getConstructionFromId(mongojs.ObjectId(_id), function(res) {
            if (res.length === 0)
                socket.emit('getConstructionFromIdResponse', {success:false});
            else
                socket.emit('getConstructionFromIdResponse', {success:true, data:res[0]});
        });
    });

    socket.on('sendMessage', function(data) {
        function hash(string) {
            let sum = 0;
            for (let char of string.split('')) {
              sum += char.charCodeAt(0);
            }
            return sum;
        }
        let user = User.list[socket.id] || { username: 'Guest' + hash(socket.id) };
        
        for (let other of Object.values(socketList)) {
            if (other !== socket) {
                other.emit('receiveMessage', { sender: user.username, message: data.message })
            }
        }
    });

    socket.on('makeRoom', function(data) {
        let user = User.list[socket.id];
        if (user) {
            if (data.roomName && data.roomName.length > 0) {
                if (!user.isHostingRoom) {
                    if (user.room) user.exitRoom();
                    let newRoom = Room({
                        id: user.socket.id,
                        name: data.roomName,
                        creator: user.username
                    });
                    newRoom.construction = Construction.deserialize(data.constructionSerial);
                    newRoom.actions.construction = newRoom.construction;
                    user.enterRoom(newRoom, true);
                    socket.emit('makeRoomResponse', {success:true});
                }
                else {
                    socket.emit('makeRoomResponse', {success:false, message:"Already hosting a room."});
                }
            }
            else {
                socket.emit('makeRoomResponse', {success:false, message:"Room name cannot be empty."});
            }
        }
        else {
            socket.emit('makeRoomResponse', {success:false, message:"Not logged in."});
        }
    });

    socket.on('getRoomList', function() {
        let user = User.list[socket.id];
        if (user) {
            let rooms = [];
            for (let otherUserId of Object.keys(User.list)) {
                let otherUser = User.list[otherUserId];
                let room = otherUser.room;
                if (otherUser.isHostingRoom && room) rooms.push({creator:room.creator, roomName:room.name, id:otherUser.socket.id});
            }
            socket.emit('getRoomListResponse', {success:true, rooms:rooms});
        }
        else {
            socket.emit('getRoomListResponse', {success:false, message:"Not logged in."});
        }
    });

    socket.on('loadRoom', function(id) {
        let user = User.list[socket.id];
        if (user) {
            let creator = User.list[id];
            if (creator && creator.isHostingRoom && creator.room) {
                //creator.room.userJoined(user);
                user.enterRoom(creator.room, false);
                socket.emit('loadRoomResponse', {success:true, constructionSerial:creator.room.construction.serialized()});
            }
            else {
                socket.emit('loadRoomResponse', {success:false, message:"Could not find room."});
            }
        }
        else {
            socket.emit('loadRoomResponse', {success:false, message:"Not logged in."});
        }
    });

    socket.on('updateUserData', function(data) {
        let user = User.list[socket.id];
        if (user) {
            user.mouse = data.mouse;
            if (user.room) {
                let resetUserConstruction = false;
                let actions = ActionManager.deserializeActions(data.actions, user.room.construction, user.room.actions);
                for (let action of actions) {
                    let success = user.room.actions.add(action, true);
                    //console.log(success);
                    if (!success) resetUserConstruction = true;
                }
                if (resetUserConstruction) {
                    socket.emit('resetConstruction', user.room.construction.serialized());
                }
            }
        }
    });

    socket.on('leaveRoom', function() {
        leaveRoom();
    });

    socket.on('disconnect', function() {
        logout();
        delete socketList[socket.id];
    });
});


setInterval(function() {
    for (let otherUserId of Object.keys(User.list)) {
        let otherUser = User.list[otherUserId];
        let room = otherUser.room;
        if (otherUser.isHostingRoom && room) room.broadcastUsersData();
    }
}, 1000/30);