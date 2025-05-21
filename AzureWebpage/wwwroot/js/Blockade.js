import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
class Blockade extends Tile {
    static brokenTex;
    static init(gl) {
        Blockade.brokenTex = new Texture(gl, "../images/broken.png");
    }
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = true;
        
    }
    tileInteraction() {
        this.blockade = false;
        this.tex = Blockade.brokenTex;
        this.rotation = Math.floor(Math.random() * 4);
    }
}

export { Blockade }