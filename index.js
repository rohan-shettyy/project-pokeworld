var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

players = {}; // Player list
 
// Use correct file directory
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

io.on('connection', function (socket) {
  console.log('a user connected');

	// Define a new player in the player list
	players[socket.id] = {
		rotation: 0,
		x: 300,
		y: 200,
		playerId: socket.id
	};

	// Send object to local player
	socket.emit('currentPlayers', players);
	// Send object to other players
	socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    console.log('user disconnected');

		// Remove this player from our players object
		delete players[socket.id];
		// Emit a message to all players to remove this player
		io.emit('disconnect', socket.id);
  });

	// Update player positions on server
	socket.on('playerMovement', function (movementData) {
		players[socket.id].x = movementData.x;
		players[socket.id].y = movementData.y;
		players[socket.id].anim = movementData.anim;
		// Emit new position to all players
		socket.broadcast.emit('playerMoved', players[socket.id]);
	});

	// Handle the cessation of animations on server
	socket.on('stopAnim', function(){
		players[socket.id].playingAnim = false;

		//Emit message to all players
		socket.broadcast.emit('stopPAnim', players[socket.id]);
	});

	socket.on('new message', function(messageData){
		socket.broadcast.emit('new message', {message: messageData.message, username: messageData.username});
	});

	socket.on('new username', function(username){
		players[socket.id].username = username;
	});
});
