import { Tile } from "./Tile.js";

class Container extends Tile {
    static opennedTex;
    static closedTex;
    static init(gl) {
        //Container.opennedTex = new Texture(gl, "../images/opened_bag.png");
        //Container.closedTex = new Texture(gl, "../images/bag.png");
    }
    constructor(x, y, tex, openedTex, gl, programInfo, rotation, trueScaled, itemsList, inventory, blocking) {
        super(x, y, tex, gl, programInfo, rotation, trueScaled);
        this.blockade = true;
        this.items = new Map();
        this.openedTex = openedTex;
        for (let i = 0; i < itemsList.length; i += 2) {
            this.items.set(itemsList[i], itemsList[i + 1]);
        }
        this.closed = true;
        this.invReference = inventory;
        this.blockade = blocking;
    }
    tileInteraction() {
        if (this.closed) {
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