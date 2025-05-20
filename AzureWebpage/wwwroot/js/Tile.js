import { initBuffers } from "./init-buffers.js"
import {Texture } from "./Texture.js"
class Tile {
    constructor(x, y, tex, gl, programInfo, rotation, trueScaled) {
        this.x = x;
        this.y = y;
        this.tex = tex;
        this.positions = [0.5, 0.5,
                          -0.5, 0.5,
                          0.5, -0.5,
                          -0.5, -0.5];
        //this.positions = [1, 1,
        //-1, 1,
        //1, -1,
        //-1, -1];
        this.buffers = initBuffers(gl, this.positions);
        this.programInfo = programInfo;
        this.gl = gl;
        this.rotation = rotation;
        this.trueScaled = trueScaled;
    }
    
    draw(projection) {
        let model = mat4.create();

        mat4.translate(
            model,
            model,
            [-0.0, 0.0, -6.0],
        );

        mat4.translate(model, model, [this.x-0.5, this.y, -6]);
        if (this.rotation === 2 || this.rotation === 1) {
            mat4.rotate(model, model, Math.PI, [0, 1, 0]);
        }
        if(this.rotation != 2) {
            mat4.rotate(model, model, this.rotation * 90 * Math.PI / 180, [0, 0, 1]);
        }
        if (!this.trueScaled) {
            mat4.scale(model, model, [0.8, 0.8, 1]);
        }
        this.setPositionAttribute(this.gl, this.buffers, this.programInfo);
        this.setTextureAttribute(this.gl, this.buffers, this.programInfo);
        this.gl.useProgram(this.programInfo.program);

        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projection,
        );
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            model,
        );

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex.texture);
        this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        

        {
            const offset = 0;
            const vertexCount = 4;
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    setPositionAttribute(gl, buffers, programInfo) {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalise = false;
        const stride = 0;

        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalise,
            stride,
            offset,
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    setTextureAttribute(gl, buffers, programInfo) {
        const num = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            num,
            type,
            normalize,
            stride,
            offset,
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }
}

export { Tile };