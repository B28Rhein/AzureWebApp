class Inventory {
    constructor() {
        this.items = new Map();
    }
    addItem(item, count) {
        if (this.items.has(item)) {
            this.items[item] += count;
        }
        else {
            this.items.set(item, count);
        }
    }
    removeItem(item, count) {
        this.items[item] -= count;
        if (this.items[item] == 0) {
            this.items.delete(item);
        }
    }
    contains(item) {
        return this.items.has(item);
    }
}

export { Inventory };