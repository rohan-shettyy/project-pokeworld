var gameWidth = window.innerWidth/2;
var gameHeight = window.innerHeight/2;
var config = {
  type: Phaser.AUTO,
    scale: {
        mode: Phaser.DOM.FIT,
        width: gameWidth,
        height: gameHeight,
        autoResize: true,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 } // Top down game, so no gravity
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


viewportBase = [0,0];

game = new Phaser.Game(config);

function preload ()
{
		// Load necessary spritesheets/tilemaps
    this.load.atlas('bulbasaur', 'spritesheet.png', 'spritesheet.json');
    this.load.image('tiles', 'Tiles/full-tileset.png');
    this.load.tilemapTiledJSON({
        key: 'map',
        url: 'lobby-tilemap.json'
    });
}

function create ()
{
	// Initialize client-side socket
	self = this;
	this.socket = io();
	this.otherPlayers = this.physics.add.group();
	this.socket.on('currentPlayers', cyclePlayers);
	this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
	this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

	this.socket.on('playerMoved', function (playerInfo) {
		self.otherPlayers.getChildren().forEach(function (otherPlayer) {
			if (playerInfo.playerId === otherPlayer.playerId) {
				otherPlayer.anims.play(playerInfo.anim, true);
				otherPlayer.setPosition(playerInfo.x, playerInfo.y);
			}
  	});
	});

	this.socket.on('stopPAnim', function(playerInfo){
		self.otherPlayers.getChildren().forEach(function (otherPlayer) {
			if (playerInfo.playerId === otherPlayer.playerId) {
				otherPlayer.anims.stop();
			}
  	});
	});
	

    var map = this.make.tilemap({key:'map'});

    var tiles = map.addTilesetImage('blackvolution', 'tiles');
    
    //Grass, paths, etc. (below player)
    var backgroundLayer = map.createStaticLayer("Tile Layer 2", tiles, 0,0);
    backgroundLayer.scaleX = 2;
    backgroundLayer.scaleY = 2;


    
    
    

    
    cursors = this.input.keyboard.createCursorKeys();
    

		// Initialize local player
		player = this.physics.add.sprite(300,200, 'bulbasaur');
				this.anims.create({
					key: 'down',
					frames: this.anims.generateFrameNames('bulbasaur', {prefix:'1-', end:4}),
					frameRate: 12,
					repeat: -1
				});
				this.anims.create({
					key: 'up',
					frames: this.anims.generateFrameNames('bulbasaur', {prefix:'4-', end:4}),
					frameRate: 12,
					repeat: -1
				});
				this.anims.create({
					key: 'left',
					frames: this.anims.generateFrameNames('bulbasaur', {prefix:'2-', end:4}),
					frameRate: 12,
					repeat: -1
				});
				this.anims.create({
					key: 'right',
					frames: this.anims.generateFrameNames('bulbasaur', {prefix:'3-', end:4}),
					frameRate: 12,
					repeat: -1
				});
    
    speed = 150;
  
		// Trees, houses, etc. (same as player)
    collisionLayer = map.createStaticLayer("Tile Layer 1", tiles, 0,0);
    collisionLayer.scaleX = 2;
    collisionLayer.scaleY = 2;
    collisionLayer.setCollisionByProperty({ collides: true });
  
		// Top of trees, roofs, etc. (above player)
    var aboveLayer = map.createStaticLayer("Tile Layer 3", tiles, 0,0);
    aboveLayer.scaleX = 2;
    aboveLayer.scaleY = 2;
    
    this.physics.add.collider(player, collisionLayer);

		// SHOW HITBOXES
		// const debugGraphics = this.add.graphics().setAlpha(0.75);
    // collisionLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
    
		//Initialize camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels*2, map.heightInPixels*2);
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(player);
    
}


function addOtherPlayers(self, playerInfo){
	const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'bulbasaur');
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}


function update (time, delta)
{
	//SPECIAL THANKS TO MIKE HADLEY FOR THE FOLLOWING FEW LINES

	// Stop previous movement
  player.body.setVelocityX(0);
  player.body.setVelocityY(0);
  
  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  }
  else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  }
  else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }
  

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);
  
    if (cursors.left.isDown) {
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.anims.play("right", true);
  } else if (cursors.up.isDown) {
    player.anims.play("up", true);
  } else if (cursors.down.isDown) {
    player.anims.play("down", true);
  } else {
    player.anims.stop();
		this.socket.emit('stopAnim', {playerInfo: this.socket.id});
	}

	try { // In case player.oldPosition is null
		if (player.x !== player.oldPosition.x || player.y !== player.oldPosition.y || player.anims.currentAnim.key !== player.oldPosition.anim.currentAnim.key) {
			this.socket.emit('playerMovement', { x: player.x, y: player.y, anim: player.anims.currentAnim.key});
		}
	} catch(err){} // Nothin' for a catch

	if(player.anims.currentAnim)
	// Save old position data
	player.oldPosition = {
		x: player.x, 
		y: player.y, 
		anim: player.anims.currentAnim ? player.anims.currentAnim.key : 'down' //Starting anim
	};
}

// Check through player object to see which is local, else initialize other players
function cyclePlayers(players){
	Object.keys(players).forEach(function(id){
		if (players[id].playerId === self.socket.id){
			console.log("Player initialized with global ID " + players[id].playerId);
		}
		else{
			addOtherPlayers(self, players[id]);
		}
	});
}