import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";

class Room {
    constructor(gl, programInfo, player, projection) {
        this.emptyTex = new Texture(gl, "../images/empty.png");
        this.borderTex = new Texture(gl, "../images/border.png");
        this.tiles = [];
        for (let i = 0; i < 155; i++) {
            this.tiles.push(new Tile((i % 14) - 6, Math.floor(i / 14) - 5, (i < 14 || i % 14 == 0 || i % 14 == 13 || i > 140) ? this.borderTex : this.emptyTex, gl, programInfo, 0, true));
            this.tiles[i].draw(projection)
        }
        this.player = player;
    }
    setTile(tile) {
        this.tiles[(tile.y + 5) * 14 + (tile.x+6)] = tile;
    }
    removePlayer() {

    }

    drawRoom(projection) {
        this.tiles.forEach((x) => {
            if (x.x != this.player.x || x.y != this.player.y) {
                x.draw(projection);
            }
        });
    }
}

export { Room };