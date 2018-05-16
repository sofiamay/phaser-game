var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: {y: 500}, //maybe change?
        debug: false, 
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update,
  },
};

game = new Phaser.Game(config);

var map;
var player;
var note;
var cursors;
var groundLayer, pineappleLayer;
var trumps;
var text;
var frozenText;
var gameWonText;
var score = 0;
var timer;

function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON('map', 'assets/map.json');
  // tiles in spritesheet 
  this.load.image('tiles', 'assets/tiles.png')
  // pineapple
  this.load.image('pineapple', 'assets/pineapple.png');
  // twitter
  this.load.image('twitter', 'assets/twitter.png');
  // note
  this.load.image('note', 'assets/note.png')
  // load player sprites
  this.load.spritesheet('player', 
    '/assets/player.png',
    { frameWidth: 50, frameHeight: 85 }
  )
  // load trump sprite
  this.load.spritesheet('trump', 
    '/assets/trump.png',
    { frameWidth: 102, frameHeight: 70 }
  )
}

function create() {

  /////* load the map *//////

  map = this.make.tilemap({key: 'map'});
  // tiles for the ground layer
  var groundTiles = map.addTilesetImage('tiles','tiles',70,70);
  // create the ground layer
  groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
  // Color the background
  this.cameras.main.setBackgroundColor('#87cefa'); 
  // the player will collide with this layer
  groundLayer.setCollisionByExclusion([-1]);
  //pineapple layer
  var pineappleTiles = map.addTilesetImage('pineapple');

  //set the boundaries of our game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  /////* Score Text */////

  // this text will show the score
  text = this.add.text(20, 20, '0', {
    fontSize: '60px',
    fill: '#ffffff'
  });
  // fix the text to the camera
  text.setScrollFactor(0);

  ////* Note *////
  note = this.physics.add.sprite(3400, 300, 'note');
  // note = this.physics.add.sprite(200, 300, 'note');
  this.physics.add.collider(note, groundLayer);

  ////* Twitter *////

  twitters = this.physics.add.staticGroup();
  this.physics.add.collider(twitters, groundLayer);

  function enableControls(){
    frozenText.destroy();
    this.physics.resume();
  }

  function hitTwitter(player, twitters) {
    player.x -= 50;
    this.physics.pause();
    frozenText = this.add.text(20, 250, 'Frozen', {
      fontSize: '60px',
      fill: '#ff0000'
    });
    frozenText.x = player.x;


    timedEvent = this.time.addEvent({
      delay: 2000,
      callback: enableControls,
      callbackScope: this
    });

    return false;
  }

  twitters.create(300, 250, 'twitter');
  twitters.create(1400, 180, 'twitter');
  twitters.children.iterate(function(twitter){
    twitter.setBounce(.2);
    twitter.setCollideWorldBounds(true);
  });

 
  //////* Player */////

  player = this.physics.add.sprite(100, 200, 'player');
  player.setBounce(.2);
  player.setCollideWorldBounds(true);
  player.setScale(0.9);
  // player will collide with the level tiles 
  this.physics.add.collider(groundLayer, player);
  // player will collide with twitter
  this.physics.add.collider(player, twitters, hitTwitter, null, this);
  // collide with note 
   this.physics.add.collider(player, note, gameWon, null, this);
  function gameWon(player, note) {
    this.physics.pause();

    // create a group for our graphics
    let rectGroup = this.add.group();
    // created on the world
    let graphics = this.add.graphics(); // adds to the world stage
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.fillStyle(0xFFF6EC7),
    graphics.fillRect(2700, 100, 800,400)
    rectGroup.add(graphics) // moves from world stage to group as a child

    var message = "Dear Bret, \n Thank you for a wonderful evening! \n \n <3 Sophia"

    gameWonText = this.add.text(2800, 150, message, {
      fontSize: '20px',
      fill: '#000000'
    });
  }



  //player anims
  this.anims.create ({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
    framerate: 3,
    repeat: -1,
  });

  this.anims.create({
    key: 'idle',
    frames: [ { key: 'player', frame: 0 } ],
    framerate: 2,
  });

  this.anims.create ({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
    framerate: 2,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();


  ///* Pineapples *///

  pineappleLayer = map.createDynamicLayer('Pineapples', pineappleTiles, 0, 0);
  pineappleLayer.setTileIndexCallback(18, collectPineapple, this);
  this.physics.add.overlap(player, pineappleLayer);

  function collectPineapple(sprite, tile) {
    pineappleLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score+=10; // add 10 points to the score
    text.setText(score); // set the text to show the current score
    return false;
  }

  ////* Camera *////

  // set bounds so the camera won't go outside the game world
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  // make the camera follow the player
  this.cameras.main.startFollow(player);

  /////* Trump */////

  trumps = this.physics.add.group({
    key: 'trump',
    repeat: 3,
    setXY: {
      x: 400,
      y: 100,
      stepX: 400,
      stepY: 0,
    },
  });
  this.physics.add.collider(trumps, groundLayer);
  this.physics.add.collider(player, trumps, hitTrump, null, this);
  function hitTrump (player, bombs) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');

    // fade camera
    this.time.delayedCall(250, function(){
      this.cameras.main.fade(250);
    }, [], this);

    // restart the game
    this.time.delayedCall(2000, function() {
      this.scene.restart();
    }, [], this);
  }

  this.anims.create ({
    key: 'trump-left',
    frames: this.anims.generateFrameNumbers('trump', { start: 6, end: 11 }),
    framerate: 5,
    repeat: -1,
  });

  this.anims.create ({
    key: 'trump-right',
    frames: this.anims.generateFrameNumbers('trump', { start: 18, end: 23 }),
    framerate: 5,
    repeat: -1,
  });

  trumps.children.iterate(function(trump){
    trump.collideWorldBounds = true;
    trump.setBounce(.2);
    if (Math.random() < .5) {
      trump.setVelocityX(100);
      trump.anims.play('trump-left');
    } else {
      trump.setVelocityX(-100)};
      trump.anims.play('trump-right');
  });


}

function update() {
  if (cursors.left.isDown)
  {
    player.body.setVelocityX(-200);
    player.anims.play('left', true); // walk left
    player.flipX = true; // flip the sprite to the left
  }
  else if (cursors.right.isDown)
  {
    player.body.setVelocityX(200);
    player.anims.play('right', true);
    player.flipX = false; // use the original sprite looking to the right
  } else {
    player.body.setVelocityX(0);
    player.anims.play('idle', true);
  }
  // jump 
  if (cursors.up.isDown && player.body.onFloor())
  {
    player.body.setVelocityY(-500);        
  }
}
