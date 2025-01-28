// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, isPlayerTwo = false) {
        super(scene, x, y, texture, frame);
  
        // add object to existing scene
        scene.add.existing(this);
        this.isFiring = false;
        this.moveSpeed = 2;
        this.isPlayerTwo = isPlayerTwo;

        // add rocket sfx
        this.sfxshot = scene.sound.add('sfx-shot', { volume: 0.2 });
    }

    update() {
        // left/right movement
        if (!this.isFiring) {
            if (this.isPlayerTwo) {
                if (keyA.isDown && this.x >= borderUISize + this.width) {
                    this.x -= this.moveSpeed;
                } else if (keyD.isDown && this.x <= game.config.width - borderUISize - this.width) {
                    this.x += this.moveSpeed;
                }
            } else {
                if (keyLEFT.isDown && this.x >= borderUISize + this.width) {
                    this.x -= this.moveSpeed;
                } else if (keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width) {
                    this.x += this.moveSpeed;
                }
            }
        }

        // fire button
        if (Phaser.Input.Keyboard.JustDown(this.isPlayerTwo ? keyW : keyFIRE) && !this.isFiring) {
            this.isFiring = true;
            this.sfxshot.play();
            this.scene.timeLeft -= 2; // subtract 2 seconds for each shot
            this.scene.timerRight.text = this.scene.timeLeft;
        }

        // if fired, move up
        if (this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed;
        }

        // reset on miss
        if (this.y <= borderUISize * 3 + borderPadding) {
            this.isFiring = false;
            this.y = game.config.height - borderUISize - borderPadding;
        }
    }

    // reset rocket to "ground"
    reset() {
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}