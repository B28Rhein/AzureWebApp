import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
class Door extends Tile {
    
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled, inventory, locked, room1,room2) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.locked = locked;
        this.inv = inventory;
        this.blockade = (locked ? true : false);
        this.trueRotation = true;
        this.room1 = room1;
        this.room2 = room2;
    }
    tileInteraction() {
        if (this.locked && this.inv.contains("key")) {
            this.locked = false;
            this.inv.removeItem("key", 1);
            this.blockade = false;
            console.log(this.locked);
        }
        else {
            console.log(this.locked ? "locked" : "open");
        }
        return;
    }
}

export { Door }