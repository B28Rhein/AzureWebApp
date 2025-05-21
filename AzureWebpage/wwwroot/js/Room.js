import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Border } from "./Border.js";
import { Door } from "./Door.js";
import { Container } from "./Container.js";
import { Blockade } from "./Blockade.js";
class Room {
    static doorTex;
    static borderTex;
    static emptyTex;
    static bagTex;
    static openedBagTex;
    static chairTex;
    static tableTex;
    static test = 5;
    static init(gl) {
        Room.doorTex = new Texture(gl, "../images/door.png");
        Room.borderTex = new Texture(gl, "../images/border.png");
        Room.emptyTex = new Texture(gl, "../images/empty.png");
        Room.bagTex = new Texture(gl, "../images/bag.png");
        Room.openedBagTex = new Texture(gl, "../images/opened_bag.png");
        Room.chairTex = new Texture(gl, "../images/chair.png")
        Room.tableTex = new Texture(gl, "../images/table.png")
    }
    static genRoom(gl, programInfo, player, projection, inventory, roomCounter, neighbour = -1, neighbourRoom = null) {
        let newRoom = new Room(gl, programInfo, player, projection);

        let isFinal = (roomCounter == 0 ? true : false);

        Room.genRandomFurnitures(gl, programInfo, newRoom);

        if (neighbour != -1) {
            newRoom.placeDoor(neighbour, inventory, neighbourRoom);
        }

        if (!isFinal) {
            let newDoorSide;
            do {
                newDoorSide = Room.randomInteger(0, 3);
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
                    (4 - newDoorSide) % 2 == 0 ? (newDoorSide == 2 ? 0 : 2) : 4 - newDoorSide, this));
        }
        newRoom.setTile(new Container(2, 2, Room.bagTex, Room.openedBagTex, gl, programInfo, 0, false, ["key", 1], inventory, false));
        return newRoom;
    }
    static genRandomFurnitures(gl, programInfo, newRoom) {
        let funitureCount = Room.randomInteger(1, 5);
        for (let i = 0; i < funitureCount; i++) {
            let x = Room.randomInteger(-4, 5);
            let y = Room.randomInteger(-3, 3);
            let t = Room.randomInteger(0, 1);
            if (!(newRoom.getTile(x, y) instanceof Blockade) && (x != 0 || y != 0)) {
                switch (t) {
                    case 0:
                        newRoom.setTile(new Blockade(x, y, Room.chairTex, gl, programInfo, Room.randomInteger(0, 3), false));
                        break;
                    case 1:
                        newRoom.setTile(new Blockade(x, y, Room.tableTex, gl, programInfo, Room.randomInteger(0, 3), false));
                        break;
                }
            }
            else {
                i--;
            }
        }
    }
    static randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    drawRoom(projection) {
        this.tiles.forEach((x) => {
            if (x.x != this.player.x || x.y != this.player.y) {
                x.draw(projection);
            }
        });
    }

    

    placeDoor(side, inventory, room) {
        switch (side) {
            case 0:
                this.setTile(new Door(-6, 0, Room.doorTex, this.gl, this.programInfo, 1, true, inventory, true, this, room));
                break;
            case 1:
                this.setTile(new Door(0, -5, Room.doorTex, this.gl, this.programInfo, 2, true, inventory, true, this, room));
                break;
            case 2:
                this.setTile(new Door(7, 0, Room.doorTex, this.gl, this.programInfo, 3, true, inventory, true, this, room));
                break;
            case 3:
                this.setTile(new Door(0, 5, Room.doorTex, this.gl, this.programInfo, 0, true, inventory, true, this, room));
                break;

        }
    }
    placeChest(x, y, items, inv) {
        this.setTile(new Container(x, y, Room.bagTex, Room.openedBagTex, this.gl, this.programInfo, 0, false, items, inv, true));
    }
}

export { Room };