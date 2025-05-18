// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";

main();
function main() {
    const canvas = document.querySelector("#gl-canvas");

    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("unable to initialize webgl. browser or machine may not support it");
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPos;
        uniform mat4 uModelViewMtx;
        uniform mat4 uProjectionMtx;
        void main() {
            gl_Position = uProjectionMtx * uModelViewMtx * aVertexPos;
        }
    `;

    const fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPos"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMtx"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMtx"),
        },
    };
    const buffers = initBuffers(gl);
    drawScene(gl, programInfo, buffers);
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
