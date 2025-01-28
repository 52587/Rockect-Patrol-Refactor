class Boss extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, health) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.health = health;
        this.moveSpeed = 2; // Boss moves left to right
        this.direction = 1; // 1 for right, -1 for left
        this.setScale(4); // Scale the boss to 4 times its original size
        this.angle = -90; // Rotate the boss 90 degrees counterclockwise
        this.points = 100; // Boss gives 100 points when defeated
        this.isDestroyed = false; // Track if the boss is destroyed
    }

    update() {
        if (this.isDestroyed) return; // Do nothing if the boss is already destroyed

        this.x += this.moveSpeed * this.direction;

        // Change direction when reaching the screen edges
        if (this.x >= game.config.width - this.width || this.x <= 0) {
            this.direction *= -1;
        }
    }

    takeHit() {
        if (this.isDestroyed) return; // Do nothing if the boss is already destroyed

        this.health--;
        console.log(`Boss health: ${this.health}`);
        if (this.health <= 0) {
            console.log('Boss defeated');
            this.isDestroyed = true; // Mark the boss as destroyed
            this.destroy(); // Remove the boss from the game
        }
    }

    reset() {
        // No reset logic as the boss should not respawn
    }
}
