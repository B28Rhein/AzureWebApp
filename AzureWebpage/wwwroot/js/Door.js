import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
class Door extends Tile {
    
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled, inventory, locked) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.locked = locked;
        this.inv = inventory;
        this.blockade = true;
        this.trueRotation = true;
    }
    tileInteraction() {
        if (this.locked && this.inv.contains("key")) {
            this.locked = false;
            console.log(this.locked);
        }
        return;
    }
}

export { Door }