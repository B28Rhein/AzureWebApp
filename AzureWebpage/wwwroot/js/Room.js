import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Border } from "./Border.js";
import { Door } from "./Door.js";
import { Container } from "./Container.js";
class Room {
    static doorTex;
    static borderTex;
    static emptyTex;
    static bagTex;
    static openedBagTex;
    static test = 5;
    static init(gl) {
        Room.doorTex = new Texture(gl, "../images/door.png");
        Room.borderTex = new Texture(gl, "../images/border.png");
        Room.emptyTex = new Texture(gl, "../images/empty.png");
        Room.bagTex = new Texture(gl, "../images/bag.png");
        Room.openedBagTex = new Texture(gl, "../images/opened_bag.png");
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
    placeDoor(side, inventory) {
        switch (side) {
            case 0:
                this.setTile(new Door(-6, 0, Room.doorTex, this.gl, this.programInfo, 1, true, inventory, true));
                break;
            case 1:
                this.setTile(new Door(0, -5, Room.doorTex, this.gl, this.programInfo, 2, true, inventory, true));
                break;
            case 2:
                this.setTile(new Door(7, 0, Room.doorTex, this.gl, this.programInfo, 3, true, inventory, true));
                break;
            case 3:
                this.setTile(new Door(0, 5, Room.doorTex, this.gl, this.programInfo, 0, true, inventory, true));
                break;

        }
    }
    placeChest(x, y, items, inv) {
        this.setTile(new Container(x, y, Room.bagTex, Room.openedBagTex, this.gl, this.programInfo, 0, false, items, inv, true));
    }
}

export { Room };