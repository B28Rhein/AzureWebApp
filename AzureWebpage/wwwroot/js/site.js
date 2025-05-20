// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import { Tile } from "./Tile.js";
import { Texture } from "./Texture.js";
import { Room } from "./Room.js";

var player;
var projectionMatrix;
var gl;
var currentRoom;
main();

function main() {
    const canvas = document.querySelector("#gl-canvas");
    
    gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert("unable to initialize webgl. browser or machine may not support it");
        return;
    }
    
    const programInfo = SetUpRenderer(gl);

    let playerTex = new Texture(gl, "../images/player.png");
    let tableTex = new Texture(gl, "../images/table.png");
    let chairTex = new Texture(gl, "../images/chair.png");

    

    player = new Tile(0, 0, playerTex, gl, programInfo, 0);

    currentRoom = new Room(gl, programInfo, player, projectionMatrix);
    currentRoom.setTile(new Tile(-4, -3, tableTex, gl, programInfo, 0));
    currentRoom.setTile(new Tile(-3, -3, chairTex, gl, programInfo, 0));

    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                player.y--;
                player.rotation = 1;
                console.log(player.y);
                break;
            case "ArrowUp":
                player.y++;
                player.rotation = 3;
                console.log(player.y);
                break;
            case "ArrowLeft":
                player.x--;
                player.rotation = 0;
                console.log(player.x);
                break;
            case "ArrowRight":
                player.x++;
                player.rotation = 2;
                console.log(player.x);
                break;
            case "Escape":
                paused = (paused == true) ? false : true;
                break;
            default:
                break;
        }
    })
    requestAnimationFrame(renderLoop);
    
    
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

}

function renderLoop() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    currentRoom.drawRoom(projectionMatrix);
    player.draw(projectionMatrix);
    requestAnimationFrame(renderLoop);
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
