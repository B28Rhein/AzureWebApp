import { Tile } from "./Tile.js";

class Container extends Tile {
    static opennedTex;
    static closedTex;
    static init(gl) {
        //Container.opennedTex = new Texture(gl, "../images/opened_bag.png");
        //Container.closedTex = new Texture(gl, "../images/bag.png");
    }
    constructor(x, y, tex, openedTex, gl, programInfo, rotation, trueScaled, lootTable, inventory, blocking) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = true;
        this.items = new Map();
        this.openedTex = openedTex;
        this.loot = lootTable;
        
        this.closed = true;
        this.invReference = inventory;
        this.blockade = blocking;
    }
    tileInteraction() {
        if (this.closed) {
            let h = this.loot.getLoot();
            for (let i = 0; i < h.length; i += 2) {
                this.items.set(h[i], h[i + 1]);
            }
            this.closed = false;
            this.tex = this.openedTex;
            let e = this.items.entries();
            for (let i = 0; i < this.items.size; i += 1) {
                let t = e.next().value;
                this.invReference.addItem(t[0], t[1]);
            }
        }
    }
}

export { Container };