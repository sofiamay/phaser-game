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
  }
};

var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer, pineappleLayer;
var text;
var score = 0;

function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON('map', 'assets/map.json');
  // tiles in spritesheet 
  this.load.image('tiles', 'assets/tiles.png')
  // load player sprites
  this.load.spritesheet('player', 
    '/assets/player.png',
    { frameWidth: 50, frameHeight: 85 }
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

  //set the boundaries of our game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  //////* Player */////

  player = this.physics.add.sprite(100, 200, 'player');
  player.setBounce(.2);
  player.setCollideWorldBounds(true);
  player.setScale(0.9);
  // player will collide with the level tiles 
  this.physics.add.collider(groundLayer, player);
}

function update() {}
