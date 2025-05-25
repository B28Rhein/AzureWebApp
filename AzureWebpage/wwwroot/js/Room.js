import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Border } from "./Border.js";
import { Door } from "./Door.js";
import { Container } from "./Container.js";
import { Blockade } from "./Blockade.js";
import { Random } from "./Random.js";
import { LootTable } from "./LootTable.js";
import { Enemy } from "./Enemy.js";
class Room {
    static doorTex;
    static borderTex;
    static emptyTex;
    static bagTex;
    static openedBagTex;
    static chairTex;
    static tableTex;
    static unknownTex;
    static keyLoot;
    static sadlinLoot;
    static slimeLoot;
    static skellyLoot;
    static chickenLoot;
    static chestLoot;
    static init(gl) {
        Room.doorTex = new Texture(gl, "../images/door.png");
        Room.borderTex = new Texture(gl, "../images/border.png");
        Room.emptyTex = new Texture(gl, "../images/empty.png");
        Room.bagTex = new Texture(gl, "../images/bag.png");
        Room.openedBagTex = new Texture(gl, "../images/opened_bag.png");
        Room.chairTex = new Texture(gl, "../images/chair.png");
        Room.tableTex = new Texture(gl, "../images/table.png");
        Room.unknownTex = new Texture(gl, "../images/unknown.png");
        Room.keyLoot = new LootTable(["key", 1, "healingPot", 2], [100, 100]);
        Room.sadlinLoot = new LootTable(
            ["sadlinEar", 1, "sadlinEar", 1, "key", 1, "key", 1, "goldCoin", 5, "goldCoin", 10, "silverTrinket", 1, "dagger", 1, "tunic", 1],
            [100, 50, 33, 20, 10, 1, 5, 5, 3]);
        Room.slimeLoot = new LootTable(
            ["slimeGoo", 3, "slimeGoo", 2, "slimeGoo", 1, "key", 1, "pants", 1],
            [25, 33, 50, 20, 5]
        );
        Room.skellyLoot = new LootTable(
            ["bone", 1, "sword", 1, "pants", 1, "tunic", 1, "key", 1, "key", 1],
            [100, 5, 10, 10, 10, 10]
        );
        Room.chickenLoot = new LootTable(
            ["chickenFeed", 1, "chickenMeat", 1, "feather", 5, "goldenRing", 1],
            [50, 10, 75, 50]
        );
        Room.chestLoot = new LootTable(
            ["sword", 1, "tunic", 1, "pants", 1, "healingPot", 1, "healingPot", 1, "healingPot", 1, "key", 1, "goldCoin", 10],
            [10, 10, 10, 10, 10, 10, 100, 50]
        )
    }
    static genRoom(gl, programInfo, player, projection, inventory, roomCounter, globalEnemyList, sideTracks, endEvent, maxSideTrackLen, minSideTrackLen, neighbour = -1, neighbourRoom = null, firstRoom = true, mainTrack = true) {
        let newRoom = new Room(gl, programInfo, player, projection);

        let isFinal = (roomCounter == 0 ? true : false);
        let isBoss = (isFinal && mainTrack ? true : false);
        Room.genRandomFurnitures(gl, programInfo, newRoom);

        if (neighbour != -1) {
            newRoom.placeDoor(neighbour, inventory, neighbourRoom, false);
        }

        let newDoorSide;
        if (!isFinal) {
            do {
                newDoorSide = Random.randomInteger(0, 3);
            } while (newDoorSide == neighbour);
            newRoom.placeDoor(
                newDoorSide,
                inventory,
                Room.genRoom(
                    gl,
                    programInfo,
                    player,
                    projection,
                    inventory,
                    roomCounter - 1,
                    globalEnemyList,
                    sideTracks,
                    endEvent,
                    maxSideTrackLen,
                    minSideTrackLen,
                    (4 - newDoorSide) % 2 == 0 ? (newDoorSide == 2 ? 0 : 2) : 4 - newDoorSide, newRoom, false, mainTrack),
            true);
        }
        let sideDoors = []
        if (sideTracks && !isFinal) {
            let l = Random.randomInteger(0, 2);
            for (let i = 0; i < l; i++) {
                let side;
                do {
                    side = Random.randomInteger(0, 3);
                } while (side == neighbour || side == newDoorSide || sideDoors.includes(side));
                let len = Random.randomInteger(minSideTrackLen, maxSideTrackLen);
                newRoom.placeDoor(side, inventory, Room.genRoom(gl, programInfo, player, projection, inventory, len, globalEnemyList, false, null, maxSideTrackLen, minSideTrackLen, (4 - side) % 2 == 0 ? (side == 2 ? 0 : 2) : 4 - side, newRoom, false, false), true);
            }
        }

        if (firstRoom == false && !isBoss) {
            Room.addEnemies(gl, programInfo, newRoom, globalEnemyList);
            Room.placeChests(newRoom, inventory);
        }
        else {
            newRoom.placeChest(2, 2, Room.keyLoot, inventory);
        }

        if (isBoss) {
            newRoom.setTile(new Blockade(0, 0, new Texture(gl, "../images/star.png"), gl, programInfo, 0, false));
            newRoom.getTile(0, 0).tileInteraction = endEvent;
        }

        //newRoom.setTile(new Container(2, 2, Room.bagTex, Room.openedBagTex, gl, programInfo, 0, false, Room.keyLoot, inventory, false));
        return newRoom;
    }
    static genRandomFurnitures(gl, programInfo, newRoom) {
        let funitureCount = Random.randomInteger(1, 5);
        for (let i = 0; i < funitureCount; i++) {
            let x = Random.randomInteger(-4, 5);
            let y = Random.randomInteger(-3, 3);
            let t = Random.randomInteger(0, 1);
            if (!(newRoom.getTile(x, y) instanceof Blockade) && (x != 0 || y != 0)) {
                switch (t) {
                    case 0:
                        newRoom.setTile(new Blockade(x, y, Room.chairTex, gl, programInfo, Random.randomInteger(0, 3), false));
                        break;
                    case 1:
                        newRoom.setTile(new Blockade(x, y, Room.tableTex, gl, programInfo, Random.randomInteger(0, 3), false));
                        break;
                }
            }
            else {
                i--;
            }
        }
    }

    static addEnemies(gl, programInfo, room, globalEnemyList) {
        let enemyNr = Random.randomInteger(1, 5);
        for (let i = 0; i < enemyNr; i++) {
            let e;
            let x = Random.randomInteger(-5, 6);
            let y = Random.randomInteger(-4, 4);
            let t = Random.randomInteger(0, 100);
            if (t < 33) {
                t = 0;
            }
            if (t >= 33 && t < 66) {
                t = 1;
            }
            if (t >= 66 && t < 94) {
                t = 2;
            }
            if (t >= 94) {
                t = 3;
            }
            if (!(room.getTile(x, y) instanceof Blockade) && !(room.getTile(x, y) instanceof Container) && !(room.getTile(x, y) instanceof Enemy)) {
                switch (t) {
                    case 0:
                        e = new Enemy(x, y, Room.unknownTex, gl, programInfo, 0, false, room, "goblin", Room.sadlinLoot);
                        room.setTile(e);
                        globalEnemyList.push(e);
                        break;
                    case 1:
                        e = new Enemy(x, y, Room.unknownTex, gl, programInfo, 0, false, room, "skelly", Room.skellyLoot);
                        room.setTile(e);
                        globalEnemyList.push(e);
                        break;
                    case 2:
                        e = new Enemy(x, y, Room.unknownTex, gl, programInfo, 0, false, room, "slime", Room.slimeLoot);
                        room.setTile(e);
                        globalEnemyList.push(e);
                        break;
                    case 3:
                        e = new Enemy(x, y, Room.unknownTex, gl, programInfo, 0, false, room, "chicken", Room.chickenLoot);
                        room.setTile(e);
                        globalEnemyList.push(e);
                        break;
                }
            }
            else {
                i--;
            }
        }
    }
    static placeChests(room, inventory) {
        let chestCount = Random.randomInteger(1, 2);
        for (let i = 0; i < chestCount; i++) {
            let x;
            let y;
            do {
                x = Random.randomInteger(-5, 6);
                y = Random.randomInteger(-4, 4);
            } while (room.getTile(x, y).blockade == false)
            room.placeChest(x, y, Room.chestLoot, inventory);
        }
    }
    constructor(gl, programInfo, player, projection) {
        this.tiles = [];
        for (let i = 0; i < 155; i++) {
            if ((i < 14 || i % 14 == 0 || i % 14 == 13 || i > 140)) {
                this.tiles.push(new Border((i % 14) - 6, Math.floor(i / 14) - 5, Room.borderTex, gl, programInfo, 0, true, (i < 14 || i >= 140) ? (i % 14 == 0 || i % 14 == 13) ? [0.68, 0.68, 1] : [1, 0.5, 1] : [0.5, 1, 1]));
            } else {
                this.tiles.push(new Tile((i % 14) - 6, Math.floor(i / 14) - 5, Room.emptyTex, gl, programInfo, 0, true));
            }
            this.tiles[i].draw(projection)
        }
        this.player = player;
        this.gl = gl;
        this.programInfo = programInfo;
    }
    setTile(tile) {
        this.tiles[(tile.y + 5) * 14 + (tile.x+6)] = tile;
    }
    getTile(x, y) {
        return this.tiles[(y + 5) * 14 + (x + 6)]
    }
    checkBlockage(x, y) {
        return this.tiles[(y + 5) * 14 + (x + 6)].blockade;
    }

    drawRoom(projection, color) {
        this.tiles.forEach((x) => {
            if (x.x != this.player.x || x.y != this.player.y) {
                x.draw(projection, color);
            }
        });
    }

    placeDoor(side, inventory, room, locked) {
        switch (side) {
            case 0:
                this.setTile(new Door(-6, 0, Room.doorTex, this.gl, this.programInfo, 1, true, inventory, locked, this, room));
                break;
            case 1:
                this.setTile(new Door(0, -5, Room.doorTex, this.gl, this.programInfo, 2, true, inventory, locked, this, room));
                break;
            case 2:
                this.setTile(new Door(7, 0, Room.doorTex, this.gl, this.programInfo, 3, true, inventory, locked, this, room));
                break;
            case 3:
                this.setTile(new Door(0, 5, Room.doorTex, this.gl, this.programInfo, 0, true, inventory, locked, this, room));
                break;

        }
    }
    placeChest(x, y, items, inv) {
        this.setTile(new Container(x, y, Room.bagTex, Room.openedBagTex, this.gl, this.programInfo, 0, false, items, inv, true));
    }
    removeEnemy(x, y) {
        this.setTile(new Tile(x, y, Room.emptyTex, this.gl, this.programInfo, 0, true));
    }
    getFreeTileInDistance(dist, n, m) {
        let x = n-dist;
        let y = m;
        let xRise = true;
        let yRise = true;
        let c = 4 * dist;
        let t;
        for (let i = 0; i < c; i++) {
            t = this.getTile(x, y);
            if (t != undefined && t.blockade === false && this.distanceBetweenPoints(t.x, t.y, n, m) <= 3) {
                return t;
            }
            if (xRise && yRise) {
                x++;
                y++;
                if (x == n + dist) {
                    xRise = false;
                }
                if (y == m + dist) {
                    yRise = false;
                }
            }
            if (!xRise && yRise) {
                x--;
                y++;
                if (x == n - dist) {
                    xRise = true;
                }
                if (y == m + dist) {
                    yRise = false;
                }
            }
            if (xRise && !yRise) {
                x++;
                y--;
                if (x == n + dist) {
                    xRise = false;
                }
                if (y == m - dist) {
                    yRise = true;
                }
            }
            if (!xRise && !yRise) {
                x--;
                y--;
                if (x == n - dist) {
                    xRise = true;
                }
                if (y == m - dist) {
                    yRise = true;
                }
            }
        }
        return undefined;
    }
    distanceBetweenPoints(x, y, m, n) {
        let a = x - m;
        let b = y - n;
        a = Math.pow(a, 2);
        b = Math.pow(b, 2);
        let dist = Math.sqrt(a + b);
        return dist;
    }
}

export { Room };