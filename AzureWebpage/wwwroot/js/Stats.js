class Stats {
    constructor(maxHealth, strength, dexterity, defense, changeStatsEvent, type) {
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
        this.changeStatsEvent();
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
        this.changeStatsEvent();
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
}

export { Stats };