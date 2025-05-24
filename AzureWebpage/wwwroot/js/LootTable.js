import { Random } from "./Random.js";
class LootTable {
    constructor(items, chances) {
        this.items = items;
        this.chances = chances;
    }
    getLoot() {
        let loot = [];
        for (let i = 0; i < this.items.length; i += 2) {
            let r = Random.randomInteger(1, 100);
            if (r <= this.chances[i / 2]) {
                loot.push(this.items[i]);
                loot.push(this.items[i + 1]);
            }
        }
        return loot;
    }
}

export { LootTable };