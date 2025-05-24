import { Texture } from "./Texture.js";
import { Tile } from "./Tile.js";
import { Random } from "./Random.js";
class Fight {
    static unknownTex;
    static goblinTex;
    static skellyTex;
    static slimeTex;
    static chickenTex;
    static buttons;
    static fightInfo;
    static init(gl) {
        Fight.unknownTex = new Texture(gl, "../images/unknown_fight.png");
        Fight.goblinTex = new Texture(gl, "../images/goblin_fight.png");
        Fight.skellyTex = new Texture(gl, "../images/skelly_fight.png");
        Fight.slimeTex = new Texture(gl, "../images/slime_fight.png");
        Fight.chickenTex = new Texture(gl, "../images/chicken_fight.png");
        Fight.fightInfo = document.getElementById("#fightInfo");
    }
    constructor(gl, tex, programInfo, projection, enemy, player, localisationFunc, inventory) {
        this.fightView = new Tile(0.5, 0, tex, gl, programInfo, 0, true, true, [14, 11, 1]);
        this.gl = gl;
        this.programInfo = programInfo;
        this.projection = projection;
        this.enemy = enemy;
        this.player = player;
        this.turn = 0;
        this.turnTaker = enemy;
        this.fightEnded = true;
        this.localisationFunc = localisationFunc;
        this.enemyTile = enemy;
        this.inventory = inventory;
    }
    drawFight() {
        this.fightView.draw(this.projection);
    }
    newFight(enemy) {
        this.turn = 0;
        this.fightEnded = false;
        this.playerEscaped = false;
        switch (enemy.stats.type) {
            case "goblin":
                this.fightView.tex = Fight.goblinTex;
                break;
            case "slime":
                this.fightView.tex = Fight.slimeTex;
                break;
            case "chicken":
                this.fightView.tex = Fight.chickenTex;
                break;
            case "skelly":
                this.fightView.tex = Fight.skellyTex;
                break;
        }
        this.enemyTile = enemy;
        this.enemy = enemy.stats;

        document.getElementById("enemyHealthDiv").hidden = false;

        document.getElementById("maxEnemyHealth").innerText = this.enemy.maxHealth;
        this.enemy.changeStatsEvent = () => { this.updateEnemyHealth() };
        this.enemy.deadEvent = () => { this.enemyDead() };

        document.getElementById("#attack").onclick = () => { this.attack(this.player, this.enemy); };
        document.getElementById("#defend").onclick = () => { this.defend() };
        document.getElementById("#run").onclick = () => { this.run(); };

        this.updateEnemyHealth();
        document.getElementById("fightControls").hidden = false;
        document.getElementById("fightInfoDiv").hidden = false;
        this.changeInfoText("#fightInfo", "");
        this.turnTaker = this.player;
        document.getElementById("#attack").disabled = false;
        document.getElementById("#defend").disabled = false;
        document.getElementById("#run").disabled = false;
    }
    changeTurn() {
        this.changeInfoText("#fightInfo", "");

        this.turn++;
        this.turnTaker === this.player ? this.turnTaker = this.enemy : this.turnTaker = this.player;
        if (this.turnTaker.isDefending) {
            this.turnTaker.isDefending = false;
        }
        if (this.turnTaker === this.player) {
            this.playerTurn();
        }
        if (this.turnTaker === this.enemy) {
            this.enemyTurn();
        }
    }
    attack(attackerStats, targetStats) {
        let str = attackerStats.strength;
        let attDex = attackerStats.dexterity
        let defDex = targetStats.dexterity;
        let def = targetStats.defense;
        let r = Random.randomInteger(0, 100);
        let c = 100 * Math.sqrt(defDex / attDex)/2;
        c = (c > 95) ? 95 : (c < 5 ? 5 : c);
        if (this.turnTaker === this.player) {
            this.changeInfoText("#playerAttackFail", "");

        }
        else {
            this.changeInfoText("#enemyAttackFail", "");
        }
        if (r > c) {
            var damage = Random.randomInteger(5, 15) * str / def;
            damage = Math.round((damage + Number.EPSILON) * 100) / 100
            if (targetStats.isDefending) {
                damage /= 2;
            }
            if (targetStats == this.player ) {
                if (this.inventory.contains("pants")) {
                    damage *= 0.75;
                }
                if (this.inventory.contains("tunic")) {
                    damage *= 0.7;
                }
            }
            if (targetStats == this.enemy) {
                if (this.inventory.contains("sword")) {
                    damage *= 1.5;
                }
                if (this.inventory.contains("dagger")) {
                    damage *= 1.2;
                }
            }
            targetStats.changeHealth(-damage);
            if (this.turnTaker === this.player) {
                this.changeInfoText("#playerAttack", damage);

            }
            else {
                this.changeInfoText("#enemyAttack", damage);
            }
        }
        this.disableButtons();
        this.isWaiting = true;
        
        this.wait();
    }
    defend(entity) {
        entity.isDefending = true;
        this.disableButtons();
        if (this.turnTaker === this.player) {
            this.changeInfoText("#playerDefended", "");
        }
        else {
            this.changeInfoText("#enemyDefended", "");
        }
        this.isWaiting = true;
        this.wait();
    }
    run() {
        let r = Random.randomInteger(0, 100);
        this.changeInfoText("#runFail", "");
        if (r + this.player.dexterity > 70) {
            this.playerEscaped = true;
            this.changeInfoText("#runSuccess", "");
        }
        this.disableButtons();
        this.isWaiting = true;
        this.wait();
    }
    playerTurn() {
        document.getElementById("#attack").disabled = false;
        document.getElementById("#defend").disabled = false;
        document.getElementById("#run").disabled = false;
    }
    enemyTurn() {
        let r = Random.randomInteger(0, 100);
        if (r >= 50) {
            this.attack(this.enemy, this.player);
        }
        else {
            this.defend(this.enemy);
        }
    }
    disableButtons() {
        document.getElementById("#attack").disabled = true;
        document.getElementById("#defend").disabled = true;
        document.getElementById("#run").disabled = true;
    }
    updateEnemyHealth() {
        document.getElementById("enemyHealth").innerText = this.enemy.health;
    }
    wait() {
        if (this.isWaiting) {
            this.isWaiting = false;
            setTimeout(() => {this.playerEscaped === false ? this.changeTurn() : this.endFight()}, 3000);
        }
    }
    enemyDead() {
        this.enemyTile.enemyDefeated();
        this.endFight();
    }
    endFight() {
        this.fightEnded = true;

        document.getElementById("fightControls").hidden = true;
        document.getElementById("fightInfoDiv").hidden = true;
        document.getElementById("enemyHealthDiv").hidden = true;
    }
    changeInfoText(newTag, newValue) {
        Fight.fightInfo.id = newTag;
        document.getElementById("fightInfo").innerText = newValue;
        this.localisationFunc();
    }
}
export { Fight }