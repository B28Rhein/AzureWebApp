import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
class Border extends Tile {
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled, additionalScale) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = true;
        this.additionalScale = additionalScale;
    }
    tileInteraction() {
        return;
    }
}

export { Border }