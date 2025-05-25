import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Room } from "./Room.js";
import { Blockade } from "./Blockade.js";
import { Inventory } from "./Inventory.js";
import { Stats } from "./Stats.js";
import { Door } from "./Door.js";
import { Enemy } from "./Enemy.js";
import { Fight } from "./Fight.js";

console.log(this);

var player;
var projectionMatrix;
var gl;
var currentRoom;
var inventory;
var stats;
var localisationFile;
var fight;
var title;
var colorPick;
var escaped = false;
var isAlive = true;
var isPaused = false;
var inFight = false;
var hasWon = false;
var gameStarted = false;
var enemies = [];
var lang = "en";
var canMove = true;
const map = document.querySelector("#gl-canvas");
const mainInfo = document.getElementById("#mainInfo");
const addInfo = document.getElementById("#additionalInfo");
main();

function startGame() {
    let mainL = document.getElementById("#mainSize").value;
    let str = document.getElementById("#strCrt").value;
    let dex = document.getElementById("#dexCrt").value;
    let def = document.getElementById("#defCrt").value;
    document.getElementById("#mainSize").style = "";
    document.getElementById("#strCrt").style = "";
    document.getElementById("#dexCrt").style = "";
    document.getElementById("#defCrt").style = "";
    document.getElementById("#maxSideSize").style = "";
    document.getElementById("#minSideSize").style = "";
    document.getElementById("#maxSideSize").style = "";
    document.getElementById("#minSideSize").style = "";

    let sideMaxS = 0;
    let sideMinS = 0;
    let sideT = document.getElementById("SideTracks").checked;
    let invalid = false;
    if (mainL == "") {
        document.getElementById("#mainSize").style = "border-color:red";
        invalid = true;
    } if (str == "") {
        document.getElementById("#strCrt").style = "border-color:red";
        invalid = true;
    } if (dex == "") {
        document.getElementById("#dexCrt").style = "border-color:red";
        invalid = true;
    } if (def == "") {
        document.getElementById("#defCrt").style = "border-color:red";
        invalid = true;
    }
    if (sideT) {
        sideMaxS = document.getElementById("#maxSideSize").value;
        sideMinS = document.getElementById("#minSideSize").value;
        if (sideMaxS == "") {
            document.getElementById("#maxSideSize").style = "border-color:red";
            invalid = true;
        }
        if (sideMinS == "") {
            document.getElementById("#minSideSize").style="border-color:red";
            invalid = true;
        }
        if (sideMinS > sideMaxS) {
            document.getElementById("#maxSideSize").style = "border-color:red";
            document.getElementById("#minSideSize").style = "border-color:red";
            invalid = true;
        }
    }
    if (invalid) {
        return;
    }
    currentRoom = Room.genRoom(gl, title.programInfo, player, projectionMatrix, inventory, mainL, enemies, sideT, () => { gameFinished() }, sideMaxS, sideMinS);
    document.getElementById("newGame").hidden = true;
    document.getElementById("duringGame").hidden = false;
    gameStarted = true;
    document.getElementById("inventoryView").hidden = false;
    document.getElementById("#outventory").hidden = false;
    document.getElementById("#stats").hidden = false;
    document.getElementById("statView").hidden = false;
    mainInfo.id = "#explore";
    addInfo.id = "#empty";
    stats.strength = str;
    stats.dexterity = dex;
    stats.defense = def;
    showStats();
    showInventory();
    localise(lang);
}

async function main() {

    gl = map.getContext("webgl2");

    if (gl === null) {
        alert("unable to initialize webgl. browser or machine may not support it");
        return;
    }
    
    const programInfo = SetUpRenderer(gl);
    localisationFile = await fetch("./js/languages.json").then((x) => localisationFile = x.json());
    setUpButtons();


    inventory = new Inventory(showInventory);
    stats = new Stats(100, 5, 5, 5, showStats, "player", () => { playerDead() });

    Room.init(gl);
    Blockade.init(gl);
    Enemy.init(gl, enemies, stats, inventory);
    Fight.init(gl);

    let playerTex = new Texture(gl, "../images/player.png");

    player = new Tile(0, 0, playerTex, gl, programInfo, 0);


    //currentRoom = Room.genRoom(gl, programInfo, player, projectionMatrix, inventory, 3, enemies, true, () => { gameFinished()}, 3, 0);

    fight = new Fight(gl, Fight.unknownTex, programInfo, projectionMatrix, null, stats, () => { localise(lang)}, inventory);

    title = new Fight(gl, Fight.titleTex, programInfo, projectionMatrix, null, null, () => { localise(lang) }, null);

    //currentRoom = new Room(gl, programInfo, player, projectionMatrix);
    //currentRoom.setTile(new Blockade(-4, -3, tableTex, gl, programInfo, 0));
    //currentRoom.setTile(new Blockade(-3, -3, chairTex, gl, programInfo, 0));

    //currentRoom.placeDoor(2, inventory);

    //currentRoom.placeChest(3, 3, ["key", 2, "sword", 1, "arrow", 50, "rostbef", 12], inventory);

    mainInfo.id = "#newGame";
    addInfo.id = "#empty";

    document.getElementById("inventoryView").hidden = true;
    document.getElementById("statView").hidden = true;
    document.getElementById("#outventory").hidden = true;
    document.getElementById("#stats").hidden = true;
    colorPick = document.getElementById("gameColor");

    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                moveDown();
                break;
            case "ArrowUp":
                moveUp();
                break;
            case "ArrowLeft":
                moveLeft();
                break;
            case "ArrowRight":
                moveRight();
                break;
            case " ":
                interact(programInfo);
                break;
            case "Escape":
                if (isAlive && gameStarted && !hasWon && !inFight){
                    isPaused = (isPaused == true) ? false : true;
                    if (isPaused) {
                        mainInfo.id = "#paused";
                        addInfo.id = "#empty";
                    }
                    else {
                        mainInfo.id = "#explore";
                        addInfo.id = "#empty";
                    }
                    localise(lang);
                }
                break;
            default:
                break;
        }
    })
    showInventory();
    showStats();
    localise(lang);
    requestAnimationFrame(renderLoop);
    
    
}

function setUpButtons() {
    document.getElementById("Up").onclick = moveUp;
    document.getElementById("Down").onclick = moveDown;
    document.getElementById("Left").onclick = moveLeft;
    document.getElementById("Right").onclick = moveRight;
    document.getElementById("Interact").onclick = interact;
    document.getElementById("SideTracks").onchange = () => { sideTracksChanged() };
    document.getElementById("#startGame").onclick = () => { startGame() };
    document.getElementById("enBTN").onclick = function () { setLang("en") };
    document.getElementById("plBTN").onclick = function () { setLang("pl")};
    document.getElementById("frBTN").onclick = function () { setLang("fr") };
}

function SetUpRenderer(gl) {
    const vsSource = `
        attribute vec4 aVertexPos;
        attribute vec2 aTexCoord;

        uniform mat4 uModelViewMtx;
        uniform mat4 uProjectionMtx;

        varying highp vec2 vTexCoord;


        void main() {
            gl_Position = uProjectionMtx * uModelViewMtx * aVertexPos;
            vTexCoord = aTexCoord;
        }
    `;

    const fsSource = `
        varying highp vec2 vTexCoord;
        uniform sampler2D uSampler;
        uniform lowp vec4 Color;

        void main() {
            gl_FragColor = texture2D(uSampler, vTexCoord) * Color;
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPos"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMtx"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMtx"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
            Color: gl.getUniformLocation(shaderProgram, "Color"),
        },
    };
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    

    return programInfo;
}

function playerDead() {
    mainInfo.id = "#playerDead";
    addInfo.id = "#empty";
    isAlive = false;
    player.rotation = 3;
    document.getElementById("inventoryView").hidden = true;
    document.getElementById("statView").hidden = true;
    document.getElementById("#outventory").hidden = true;
    document.getElementById("#stats").hidden = true;
    document.getElementById("duringGame").hidden = false;
}

function gameFinished() {
    hasWon = true;
    mainInfo.id = "#gameWon";
    addInfo.id = countScore();;
    localise(lang);
    document.getElementById("inventoryView").hidden = true;
    document.getElementById("statView").hidden = true;
    document.getElementById("#outventory").hidden = true;
    document.getElementById("#stats").hidden = true;
    document.getElementById("duringGame").hidden = true;
    document.getElementById("newGame").hidden = false;
}

function countScore() {
    let score = 0;
    score += stats.enemiesDefeeted * 5;
    let items = inventory.getItems();
    for (let i = 0; i < items.length; i++) {
        switch (items[i][0]) {
            case "sword":
                items[i][1] > 1 ? score += 2 * items[i][1] : score;
                break;
            case "pants":
                items[i][1] > 1 ? score += 2 * items[i][1] : score;
                break;
            case "tunic":
                items[i][1] > 1 ? score += 2 * items[i][1] : score;
                break;
            case "dagger":
                items[i][1] > 1 ? score += 2 * items[i][1] : score;
                break;
            case "sadlinEar":
                score += items[i][1] * 5;
                break;
            case "goldCoin":
                score += items[i][1] * 10;
                break;
            case "silverTrinket":
                score += items[i][1] * 30;
                break;
            case "slimeGoo":
                score += items[i][1] * 4;
                break;
            case "bone":
                score += items[i][1] * 7;
                break;
            case "chickenFeed":
                score += items[i][1] * 100;
                break;
            case "chickenMeat":
                score += items[i][1] * 50;
                break;
            case "feather":
                score += items[i][1] * 15;
                break;
            case "goldenRing":
                score += items[i][1] * 20;
                break;
            case "healingPot":
                score += items[i][1] * 3;
                break;
            default:
                score += items[i][1];
                break;

        }
    }
    return score;
}

function update() {
    moveEnemies();
    let tile = currentRoom.getTile(player.x, player.y)
    if (tile instanceof Door) {
        currentRoom = tile.room2;
        switch (tile.rotation) {
            case 0:
                player.y = -4;
                player.x = tile.x;
                break;
            case 1:
                player.y = tile.y;
                player.x = 6;
                break;
            case 2:
                player.y = 4;
                player.x = tile.x;
                break;
            case 3:
                player.y = tile.y;
                player.x = -5;
                break;
        }
    }
    if (tile instanceof Enemy) {
        
        inFight = true;
        mainInfo.id = "#fight";
        addInfo.id = "#" + tile.stats.type;
        localise(lang);
        fight.newFight(tile);
    }
}

function moveEnemies() {
    enemies.forEach((x) => x.enemyMove());
}

function moveUp() {
    //console.log(canMove);
    if (canMove == true && !isPaused && isAlive && !hasWon) {
        if (player.rotation == 3) {
            if (!currentRoom.checkBlockage(player.x, player.y + 1))
                player.y++;
        }   
        player.rotation = 3;
        MoveCannes();
    }

}
function moveRight() {
    //console.log(canMove);
    if (canMove == true && !isPaused && isAlive && !hasWon) {
        if (player.rotation == 2) {
            if (!currentRoom.checkBlockage(player.x + 1, player.y))
                player.x++;
        }
        player.rotation = 2;
        MoveCannes();
    }
}
function moveDown() {
    //console.log(canMove);
    if (canMove == true && !isPaused && isAlive && !hasWon) {
        if (player.rotation == 1) {
            if (!currentRoom.checkBlockage(player.x, player.y - 1))
                player.y--;

        }
        player.rotation = 1;
        MoveCannes();
    }
}
function moveLeft() {
    //console.log(canMove);
    if (canMove == true && !isPaused && isAlive && !hasWon) {
        if (player.rotation == 0) {
            if (!currentRoom.checkBlockage(player.x - 1, player.y))
                player.x--;

        }
        player.rotation = 0;
        MoveCannes();
    }
}
function MoveCannes() {
    if (canMove) {
        canMove = false;
        setTimeout(MoveCannes, 50)
    }
    else {
        canMove = true;
    }
}

function interact(programInfo) {
    if (!isPaused && isAlive && !hasWon) {
        switch (player.rotation) {
            case 0:
                currentRoom.getTile(player.x - 1, player.y).tileInteraction();
                break;
            case 1:
                currentRoom.getTile(player.x, player.y - 1).tileInteraction();
                break;
            case 2:
                currentRoom.getTile(player.x + 1, player.y).tileInteraction();
                break;
            case 3:
                currentRoom.getTile(player.x, player.y + 1).tileInteraction();
                break;
            default:
                break;
        }
    }
}

function renderLoop() {
    resizeCanvasToDisplaySize(gl.canvas);
    let tokens = colorPick.value.match(/[0-9a-z]{2}/gi);
    let color = tokens.map(t => parseInt(t, 16));
    color[0] /= 256;
    color[1] /= 256;
    color[2] /= 256;
    color.push(1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    document.getElementById("controls").hidden = inFight;
    if (gameStarted) {
        if (!isPaused && isAlive && !hasWon) {
            if (!inFight) {
                escaped = false;
                currentRoom.drawRoom(projectionMatrix, color);
                player.draw(projectionMatrix, color);
                update();
                //showInventory();
                //localise(lang);
            }
            else {
                fight.drawFight(color);
                inFight = !fight.fightEnded;
                if (fight.playerEscaped == true && !escaped) {
                    let t;
                    let i = 3;
                    do {
                        t = currentRoom.getFreeTileInDistance(i, player.x, player.y);
                        i++;
                    } while (t == undefined);
                    player.x = t.x;
                    player.y = t.y;
                    escaped = true;
                }
                if (!inFight) {
                    mainInfo.innerText = "#explore";
                    addInfo.innerText = "";
                    localise(lang);
                }
            }
        }
        else {
            currentRoom.drawRoom(projectionMatrix, color);
            player.draw(projectionMatrix, color);
        }
    }
    else {
        title.drawFight(color);
    }
    requestAnimationFrame(renderLoop);
}

function showInventory() {
    const div = document.getElementById("inventoryView");
    let inv = inventory.getItems();
    div.innerHTML = "";
    inv.forEach((x) => div.innerHTML += `<nobr><a name="translatable" id=#${x[0]}>#${x[0]}</a>: ${x[1]}</nobr>`)
    localise(lang);
}
function showStats() {
    const div = document.getElementById("statView");
    div.innerHTML = "";
    div.innerHTML += `<nobr><a name="translatable" id=#level></a>: ${stats.level}</nobr>`
    div.innerHTML += `<nobr><a name="translatable" id=#strength>#strength</a>: ${stats.strength}</nobr>`
    div.innerHTML += `<nobr><a name="translatable" id=#defense>#defense</a>: ${stats.defense}</nobr>`
    div.innerHTML += `<nobr><a name="translatable" id=#dexterity>#dexterity</a>: ${stats.dexterity}</nobr>`
    document.getElementById("health").innerText = stats.health;
    document.getElementById("maxHealth").innerText = stats.maxHealth;
    document.getElementById("exp").innerText = stats.experience;
    document.getElementById("maxExp").innerText = stats.toNextLevel;
    localise(lang);
}

function setLang(l) {
    lang = l;
    localise(lang);
}

async function localise(lang) {
    //console.log(localisationFile);
    let translatables = document.getElementsByName("translatable");
    translatables.forEach((x) => {
        if (localisationFile[lang][x.id] != undefined) {
            x.innerText = localisationFile[lang][x.id]
        }
        else {
            x.innerText = x.id;
        }
    })
    translatables = document.getElementsByName("translatableForm");
    translatables.forEach((x) => {
        if (localisationFile[lang][x.id] != undefined) {
            x.placeholder = localisationFile[lang][x.id]
        }
        else {
            x.placeholder = x.id;
        }
    })
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`unable to initialise the shader program ${gl.getProgramInfoLog(
            shaderProgram,
        )}`,);
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}

function sideTracksChanged() {
    let a = document.getElementById("SideTracks").checked;
    let b = document.getElementById("#maxSideSize");
    let c = document.getElementById("#minSideSize");
    if (a) {
        b.disabled = false;
        c.disabled = false;
    }
    else {
        b.disabled = true;
        c.disabled = true;
    }
    localise(lang);
}