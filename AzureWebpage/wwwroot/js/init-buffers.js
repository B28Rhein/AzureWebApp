function initBuffers(gl, positions) {
    const posBuffer = initPosBuffer(gl, positions);
    const texBuffer = initTexBuffer(gl);
    return {
        position: posBuffer,
        texCoord: texBuffer,
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

export { initBuffers };