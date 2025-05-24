function initBuffers(gl, positions, color) {
    const posBuffer = initPosBuffer(gl, positions);
    const texBuffer = initTexBuffer(gl);
    //const colBuffer = initColorBuffer(gl, color);
    return {
        position: posBuffer,
        texCoord: texBuffer,
        //color: colBuffer,
    };
}

function initPosBuffer(gl, positions) {
    const posBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return posBuffer;
}

function initTexBuffer(gl) {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const texturecoords = [
        1, 0,
        0, 0,
        1, 1,
        0, 1,
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(texturecoords),
        gl.STATIC_DRAW,
    );
    return textureCoordBuffer;
}

//function initColorBuffer(gl, color) {
//    const colors = color.concat(color.concat(color.concat(color));
//    const colorBuffer = gl.createBuffer();
//    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
//}

export { initBuffers };