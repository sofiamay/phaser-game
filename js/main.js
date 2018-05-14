var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: {y: 500},
          debug: false
      }
  },
  scene: {
      key: 'main',
      preload: preload,
      create: create,
      update: update
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

}

function create() {}

function update() {}
