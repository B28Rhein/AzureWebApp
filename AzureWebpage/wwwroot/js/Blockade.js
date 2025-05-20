import { Tile } from "./Tile.js";
class Blockade extends Tile {
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = true;
    }
    interact() {
        this.blockade = false;
        this.tex = new Texture(this.gl, "../images/empty.png");
    }
}