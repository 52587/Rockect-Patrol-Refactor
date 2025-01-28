class Play extends Phaser.Scene {
    constructor() {
      super("playScene");
    }
  
    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)

        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)

        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0)

        // add second rocket (p2) if two-player mode
        if (game.settings.twoPlayer) {
            this.p2Rocket = new Rocket(this, game.config.width / 2 + 50, game.config.height - borderUISize - borderPadding, 'rocket', 0, true).setOrigin(0.5, 0);
        }

        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize * 6, borderUISize * 4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize * 3, borderUISize * 5 + borderPadding * 2, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize * 6 + borderPadding * 4, 'spaceship', 0, 10).setOrigin(0, 0);

        // add boss in the middle
        this.boss = new Boss(this, game.config.width / 2, game.config.height / 2, 'boss', 0, 5).setOrigin(0.5, 0.5);

        // define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        if (game.settings.twoPlayer) {
            keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        }

        // initialize score
        this.p1Score = 0

        // display score
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, this.scoreConfig)

        // display high score
        this.highScoreRight = this.add.text(game.config.width - borderUISize - borderPadding - 100, borderUISize + borderPadding*2, highScore, this.scoreConfig);

        // display timer
        this.timeLeft = game.settings.gameTimer / 1000;
        this.timerRight = this.add.text(game.config.width - borderUISize - borderPadding - 100, borderUISize + borderPadding * 2 + 50, this.timeLeft, this.scoreConfig);

        //game over flag
        this.gameOver = false

        // 60-second play clock
        this.scoreConfig.fixedWidth = 0
        this.clock = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // play background music
        this.bgm = this.sound.add('bgm', { volume: 0.2, loop: true });
        if (!this.sound.get('bgm').isPlaying) {
            this.bgm.play();
        }

        // 30-second speed increase timer
        this.speedIncreaseTimer = this.time.delayedCall(30000, () => {
            this.ship01.moveSpeed += 2;
            this.ship02.moveSpeed += 2;
            this.ship03.moveSpeed += 2;
        }, null, this);

        // create explosion animation if it doesn't exist
        if (!this.anims.exists('explode')) {
            this.anims.create({
                key: 'explode',
                frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0 }),
                frameRate: 30
            });
        }

        // create particle emitter
        this.emitter = this.add.particles(-100, -100, 'explosion', {
            frame: { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], cycle: true },
            speed: 300,
            lifespan: 300,
            quantity: 50,
            scale: { start: 1, end: 0 },
            tint: [0xff6666, 0xffff66], // brighter red and yellow colors
            on: false
        });

        // timer speed increase
        this.timerSpeedIncrease = this.time.addEvent({
            delay: 10000, // every 10 seconds
            callback: this.increaseTimerSpeed,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        //check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.scene.restart()
        }

        // scroll starfield
        this.starfield.tilePositionX -= 3

        // update rocket and ships
        if (!this.gameOver) {
            this.p1Rocket.update();
            if (game.settings.twoPlayer && this.p2Rocket) {
                this.p2Rocket.update();
            }
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
            this.boss.update(); // Update boss movement
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship03, 3)
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship02, 4)
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset()
            this.shipExplode(this.ship01, 5)
        }
        if (this.checkCollision(this.p1Rocket, this.boss) && !this.boss.isDestroyed) {
            this.p1Rocket.reset();
            this.boss.takeHit();
            if (this.boss.health <= 0) {
                this.shipExplode(this.boss, 10); // Boss gives a larger time bonus
            }
        }
        if (game.settings.twoPlayer && this.p2Rocket) {
            if (this.checkCollision(this.p2Rocket, this.ship03)) {
                this.p2Rocket.reset();
                this.shipExplode(this.ship03, 3);
            }
            if (this.checkCollision(this.p2Rocket, this.ship02)) {
                this.p2Rocket.reset();
                this.shipExplode(this.ship02, 4);
            }
            if (this.checkCollision(this.p2Rocket, this.ship01)) {
                this.p2Rocket.reset();
                this.shipExplode(this.ship01, 5);
            }
            if (this.checkCollision(this.p2Rocket, this.boss) && !this.boss.isDestroyed) {
                this.p2Rocket.reset();
                this.boss.takeHit();
                if (this.boss.health <= 0) {
                    this.shipExplode(this.boss, 10); // Boss gives a larger time bonus
                }
            }
        }

        // check for game over menu
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.bgm.stop();
            this.scene.start("menuScene")
          }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerRight.text = this.timeLeft;
        if (this.timeLeft <= 0) {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or <- for Menu', this.scoreConfig).setOrigin(0.5);
            this.gameOver = true;
            this.clock.remove();

            // Update high score if current score is higher
            if (this.p1Score > highScore) {
                highScore = this.p1Score;
                this.highScoreRight.text = highScore;
            }
        }
    }

    increaseTimerSpeed() {
        if (this.clock.delay > 10) { // minimum delay of 10ms
            this.clock.delay *= 0.75; // decrease delay by 25%
        }
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
          rocket.x + rocket.width > ship.x && 
          rocket.y < ship.y + ship.height &&
          rocket.height + rocket.y > ship. y) {
          return true
        } else {
          return false
        }
    }

    shipExplode(ship, timeBonus) {
        // temporarily hide ship
        ship.alpha = 0
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0)
        boom.anims.play('explode')
        boom.on('animationcomplete', () => {
            ship.reset()
            ship.alpha = 1
            boom.destroy()
        })
        // trigger particle explosion
        this.emitter.setPosition(ship.x + ship.width / 2, ship.y + ship.height / 2);
        this.emitter.explode(50);
        // score add and repaint
        this.p1Score += ship.points
        this.scoreLeft.text = this.p1Score
        this.sound.play('sfx-explosion', { volume: 0.2 })

        // add time bonus
        this.timeLeft += timeBonus;
        this.timerRight.text = this.timeLeft;

        // if the ship is the boss, add an additional 30 seconds
        if (ship instanceof Boss) {
            if (!ship.isDestroyed) {
                this.timeLeft += 30;
                this.timerRight.text = this.timeLeft;
                ship.isDestroyed = true; // Mark the boss as destroyed
                ship.destroy(); // Ensure the boss is fully destroyed
            }
        }
    }

  }