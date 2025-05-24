class Stats {
    constructor(maxHealth, strength, dexterity, defense, changeStatsEvent, type, deadEvent) {
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.level = 1;
        this.experience = 0;
        this.toNextLevel = 100;
        this.strength = strength;
        this.dexterity = dexterity;
        this.defense = defense;
        this.changeStatsEvent = changeStatsEvent;
        this.type = type;
        this.isDefending = false;
        this.deadEvent = deadEvent;
    }
    levelUp() {
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.level++;
        this.experience -= this.toNextLevel;
        this.strength += 2;
        this.defense += 5;
        this.dexterity += 2;
        this.toNextLevel += 100;
        this.changeStatsEvent();
        this.checkLevelUp();
    }
    changeHealth(amount) {
        this.health += amount;
        this.health = Math.round((this.health + Number.EPSILON) * 100) / 100;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        this.changeStatsEvent();
        if (this.health < 0) {
            this.deadEvent();
        }
    }
    addExp(amount) {
        this.experience += amount;
        this.changeStatsEvent();
        this.checkLevelUp();
    }
    checkLevelUp() {
        if (this.experience >= this.toNextLevel) {
            this.levelUp();
        }
    }
    print() {
        console.log([this.level, this.maxHealth, this.health, this.strength, this.dexterity, this.defense, this.type]);
    }
}

export { Stats };