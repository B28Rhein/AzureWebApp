import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Random } from "./Random.js";
import { Stats } from "./Stats.js";
class Enemy extends Tile {
    static playerInv;
    static playerStats;
    static Init(playerStats, playerInv) {
        Enemy.playerInv = playerInv;
        Enemy.playerStats = playerStats;
    }
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled, room, type) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = false;
        this.room = room;
        this.loot = Random.randomInteger(0, 3);
        this.expGiven = 0;
        switch (type) {
            case "goblin":
                this.stats = new Stats(
                    Random.randomInteger(60, 150),
                    Random.randomInteger(7, 15),
                    Random.randomInteger(4, 14),
                    Random.randomInteger(1, 5),
                    () => { },
                    "goblin");
                this.expGiven = Random.randomInteger(15, 30);
                break;
            case "slime":
                this.stats = new Stats(
                    Random.randomInteger(50, 130),
                    Random.randomInteger(5, 12),
                    Random.randomInteger(1, 5),
                    Random.randomInteger(12, 17),
                    () => { },
                    "slime");
                this.expGiven = Random.randomInteger(20, 35);
                break;
            case "chicken":
                this.stats = new Stats(
                    Random.randomInteger(10, 15),
                    Random.randomInteger(1, 3),
                    Random.randomInteger(50, 150),
                    Random.randomInteger(1, 2),
                    () => { },
                    "chicken");
                this.expGiven = Random.randomInteger(50, 200);

                break;
        }
    }
    tileInteraction() {

    }
    enemyMove() {
        dir = Random.randomInteger(0, 3);
        switch (dir) {
            case 0:
                if (room.getTile(this.x - 1, this.y).blockade == false)
                    this.x--;
                break;
            case 1:
                if (room.getTile(this.x, this.y - 1).blockade == false)
                    this.y--;
                break;
            case 2:
                if (room.getTile(this.x + 1, this.y).blockade == false)
                    this.x++;
                break;
            case 3:
                if (room.getTile(this.x, this.y + 1).blockade == false)
                    this.y++;
                break;
        }
    }
    enemyDefeated() {
        
    }
}

export { Blockade }