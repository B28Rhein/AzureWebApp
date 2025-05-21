// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Room } from "./Room.js";
import { Blockade } from "./Blockade.js";
import { Inventory } from "./Inventory.js";
import { Stats } from "./Stats.js";
import { Door } from "./Door.js";

var player;
var projectionMatrix;
var gl;
var currentRoom;
var inventory;
var stats;
var localisationFile;
var lang = "en";
var canMove = true;
main();

async function main() {
    const canvas = document.querySelector("#gl-canvas");



    gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert("unable to initialize webgl. browser or machine may not support it");
        return;
    }
    
    const programInfo = SetUpRenderer(gl);
    setUpButtons();
    localisationFile = await fetch("./js/languages.json").then((x) => localisationFile = x.json());


    inventory = new Inventory(showInventory);
    stats = new Stats(100, 5, 4, 10);
    showStats();

    Room.init(gl);
    Blockade.init(gl);

    let playerTex = new Texture(gl, "../images/player.png");
    let tableTex = new Texture(gl, "../images/table.png");
    let chairTex = new Texture(gl, "../images/chair.png");

    

    player = new Tile(0, 0, playerTex, gl, programInfo, 0);

    currentRoom = Room.genRoom(gl, programInfo, player, projectionMatrix, inventory, 3);
    //currentRoom = new Room(gl, programInfo, player, projectionMatrix);
    //currentRoom.setTile(new Blockade(-4, -3, tableTex, gl, programInfo, 0));
    //currentRoom.setTile(new Blockade(-3, -3, chairTex, gl, programInfo, 0));

    //currentRoom.placeDoor(2, inventory);

    //currentRoom.placeChest(3, 3, ["key", 2, "sword", 1, "arrow", 50, "rostbef", 12], inventory);

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
                paused = (paused == true) ? false : true;
                break;
            default:
                break;
        }
    })
    localise(lang);
    requestAnimationFrame(renderLoop);
    
    
}

function setUpButtons() {
    document.getElementById("Up").onclick = moveUp;
    document.getElementById("Down").onclick = moveDown;
    document.getElementById("Left").onclick = moveLeft;
    document.getElementById("Right").onclick = moveRight;
    document.getElementById("Interact").onclick = interact;
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

        void main() {
            gl_FragColor = texture2D(uSampler, vTexCoord);
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPos"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMtx"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMtx"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
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

function update() {
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
}

function moveUp() {
    //console.log(canMove);
    if (canMove == true) {
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
    if (canMove == true) {
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
    if (canMove == true) {
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
    if (canMove == true) {
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
    switch (player.rotation) {
        case 0:
            currentRoom.getTile(player.x - 1, player.y).tileInteraction();
            break;
        case 1:
            currentRoom.getTile(player.x, player.y-1).tileInteraction();
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

function renderLoop() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    currentRoom.drawRoom(projectionMatrix);
    player.draw(projectionMatrix);
    update();
    //showInventory();
    //localise(lang);
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
