class Menu extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  preload() {
    // load images/tile sprites
    this.load.image('rocket', './assets/rocket.png');
    this.load.image('spaceship', './assets/spaceship.png');
    this.load.image('starfield', './assets/starfield.png');
    this.load.image('boss', './assets/boss.png'); // Add this line to load the boss texture
    
    // load spritesheet
    this.load.spritesheet('explosion', './assets/explosion.png', {
        frameWidth: 64,
        frameHeight: 32,
        startFrame: 0,
        endFrame: 9
    });

    // load audio
    this.load.audio('sfx-select', './assets/sfx-select.wav');
    this.load.audio('sfx-explosion', './assets/sfx-explosion.wav');
    this.load.audio('sfx-shot', './assets/sfx-shot.wav');
    this.load.audio('bgm', './assets/background-music.mp3');
  }

  create() {
    let menuConfig = {
        fontFamily: 'Courier',
        fontSize: '28px',
        backgroundColor: '#F3B141',
        color: '#843605',
        align: 'right',
        padding: {
            top: 5,
            bottom: 5
        },
        fixedWidth: 0
    };

    // display menu text
    this.add.text(game.config.width / 2, game.config.height / 2 - borderUISize - borderPadding, 'ROCKET PATROL', menuConfig).setOrigin(0.5);
    this.add.text(game.config.width / 2, game.config.height / 2, 'Use <  > arrows to move & (^) to fire', menuConfig).setOrigin(0.5);
    menuConfig.backgroundColor = '#00FF00';
    menuConfig.color = '#000';
    this.add.text(game.config.width / 2, game.config.height / 2 + borderUISize + borderPadding, 'Press < for Novice or > for Expert', menuConfig).setOrigin(0.5);
    this.add.text(game.config.width / 2, game.config.height / 2 + borderUISize + borderPadding * 5, 'Press ^ for 2 Player', menuConfig).setOrigin(0.5);
    
    // define keys
    keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
        // easy mode
        game.settings = {
            spaceshipSpeed: 3,
            gameTimer: 60000,
            twoPlayer: false
        };
        this.sound.play('sfx-select');
        this.scene.start('playScene');
    }
    if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
        // hard mode
        game.settings = {
            spaceshipSpeed: 4,
            gameTimer: 45000,
            twoPlayer: false
        };
        this.sound.play('sfx-select');
        this.scene.start('playScene');
    }
    if (Phaser.Input.Keyboard.JustDown(keyUP)) {
        // two-player mode
        game.settings = {
            spaceshipSpeed: 3,
            gameTimer: 60000,
            twoPlayer: true
        };
        this.sound.play('sfx-select');
        this.scene.start('playScene');
    }
  }
}