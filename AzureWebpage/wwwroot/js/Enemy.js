import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Random } from "./Random.js";
import { Stats } from "./Stats.js";
import { Door } from "./Door.js";
class Enemy extends Tile {
    static playerInv;
    static playerStats;
    static chickTex;
    static gobboTex;
    static skellyTex;
    static slimeTex;
    static globalEnemyList;
    static init(gl, globalEnemyList, playerStats, playerInv) {
        Enemy.playerInv = playerInv;
        Enemy.playerStats = playerStats;
        Enemy.globalEnemyList = globalEnemyList;
        Enemy.skellyTex = new Texture(gl, "../images/skelly.png");
        Enemy.slimeTex = new Texture(gl, "../images/slime.png");
        Enemy.gobboTex = new Texture(gl, "../images/gobbo.png");
        Enemy.chickTex = new Texture(gl, "../images/chicken.png");
    }
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled, room, type, lootTable) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = false;
        this.room = room;
        this.loot = lootTable;
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
                this.tex = Enemy.gobboTex;
                this.expGiven = Random.randomInteger(15, 30);
                this.speed = 7;
                break;
            case "slime":
                this.stats = new Stats(
                    Random.randomInteger(50, 130),
                    Random.randomInteger(5, 12),
                    Random.randomInteger(1, 5),
                    Random.randomInteger(12, 17),
                    () => { },
                    "slime");
                this.tex = Enemy.slimeTex;
                this.expGiven = Random.randomInteger(20, 35);
                this.speed = 3;
                break;
            case "chicken":
                this.stats = new Stats(
                    Random.randomInteger(10, 15),
                    Random.randomInteger(1, 3),
                    Random.randomInteger(50, 150),
                    Random.randomInteger(1, 2),
                    () => { },
                    "chicken");
                this.tex = Enemy.chickTex;
                this.expGiven = Random.randomInteger(50, 200);
                this.speed = 1;
                break;
            case "skelly":
                this.stats = new Stats(
                    Random.randomInteger(90, 120),
                    Random.randomInteger(10, 15),
                    Random.randomInteger(3, 8),
                    Random.randomInteger(5, 15),
                    () => { },
                    "skelly");
                this.tex = Enemy.skellyTex;
                this.expGiven = Random.randomInteger(30, 35);
                this.speed = 6;
        }
        this.alive = true;
        this.timer = Random.randomInteger(0, 600/this.speed);
    }
    tileInteraction() {
        console.log()
        this.stats.print();
        this.enemyDefeated();
    }
    enemyMove() {
        this.timer++;
        if (this.alive && this.timer > 600/this.speed) {
            let dir = Random.randomInteger(0, 3);
            switch (dir) {
                case 0:

                    if (this.room.getTile(this.x - 1, this.y).blockade == false && !(this.room.getTile(this.x - 1, this.y) instanceof Door) && !(this.room.getTile(this.x - 1, this.y) instanceof Enemy)) {
                        this.room.removeEnemy(this.x, this.y);
                        this.x--;
                        this.room.setTile(this);
                    }
                    break;
                case 1:
                    if (this.room.getTile(this.x, this.y - 1).blockade == false && !(this.room.getTile(this.x, this.y - 1) instanceof Door) && !(this.room.getTile(this.x, this.y - 1) instanceof Enemy)) {
                        this.room.removeEnemy(this.x, this.y);
                        this.y--;
                        this.room.setTile(this);
                    }
                    break;
                case 2:
                    if (this.room.getTile(this.x + 1, this.y).blockade == false && !(this.room.getTile(this.x + 1, this.y) instanceof Door) && !(this.room.getTile(this.x, this.y - 1) instanceof Enemy)) {
                        this.room.removeEnemy(this.x, this.y);
                        this.x++;
                        this.room.setTile(this);

                    }
                    break;
                case 3:
                    if (this.room.getTile(this.x, this.y + 1).blockade == false && !(this.room.getTile(this.x, this.y + 1) instanceof Door) && !(this.room.getTile(this.x, this.y - 1) instanceof Enemy)) {
                        this.room.removeEnemy(this.x, this.y);
                        this.y++;
                        this.room.setTile(this);

                    }
                    break;
            }
            this.timer = 0;
        }
        
    }
    enemyDefeated() {
        let loot = this.loot.getLoot();
        for (let i = 0; i < loot.length; i += 2) {
            Enemy.playerInv.addItem(loot[i], loot[i+1])
        }
        Enemy.playerStats.addExp(this.expGiven);
        this.room.removeEnemy(this.x, this.y);
        this.alive = false;
        
    }
}

export { Enemy }