class Inventory {
    constructor(inventoryChangeEvent) {
        this.items = new Map();
        this.inventoryChangeEvent = inventoryChangeEvent;
        this.inventoryChangeEvent();
    }
    addItem(item, count) {
        if (this.items.has(item)) {
            this.items[item] += count;
        }
        else {
            this.items.set(item, count);
        }
        this.inventoryChangeEvent();
    }
    removeItem(item, count) {
        this.items.set(item, this.items.get(item) - count);
        if (this.items.get(item) == 0) {
            this.items.delete(item);
        }
        this.inventoryChangeEvent();
    }
    contains(item) {
        return this.items.has(item);
    }
    getItems() {
        let arr = [];
        let t = this.items.entries();
        for (let i = 0; i < this.items.size; i += 1) {
            arr.push(t.next().value);
        }
        return arr;
    }
}

export { Inventory };