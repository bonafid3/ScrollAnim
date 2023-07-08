
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function map(input, in_sta, in_end, out_sta, out_end) {
  const slope = (out_end - out_sta) / (in_end - in_sta);
  if(out_sta < out_end)
    return clamp(out_sta + slope * (input - in_sta), out_sta, out_end);
  return clamp(out_sta + slope * (input - in_sta), out_end, out_sta);
}

function resizeCanvas(event) {
    var canvas = document.getElementById('myCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawScene();
}

function scrollEvent() {
    drawScene();
}

function imagesLoaded(e) {
    drawScene();
}

function init() {
    // init OpenGL canvas
    
    mygl.init(document.getElementById('myCanvas'));

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('scroll', scrollEvent, false);
    document.addEventListener('imagesLoaded', imagesLoaded, false);
    resizeCanvas();
}

function calcPercentage() {
    const trench = document.getElementById('trench').getBoundingClientRect();
    let percentage = trench.top / ((window.innerHeight - trench.height) / 100) / 100;
    return percentage;
}

function drawScene() {

    let canvas = document.getElementById("myCanvas");
    let gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // All of them are identity matrices
    let projMatrix = new mat4();
    let viewMatrix = new mat4();
    let modelMatrix = new mat4();

    // map percentage to frame
    let frame = parseInt(map(calcPercentage(), 0, 1, 0, mygl.texture.length-1));

    // ==================
    // DRAW TEXTURED QUAD
    // ==================
    gl.useProgram(mygl.texturedShader);

    gl.bindTexture(gl.TEXTURE_2D, mygl.texture[frame]);

    let modelMatrixLoc = gl.getUniformLocation(mygl.texturedShader, "model");
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix.data);

    let viewMatrixLoc = gl.getUniformLocation(mygl.texturedShader, "view");
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.data);

    let projMatrixLoc = gl.getUniformLocation(mygl.texturedShader, "proj");
    gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix.data);

    let texCoordLoc = gl.getAttribLocation(mygl.texturedShader, "a_texcoord"); 
    gl.enableVertexAttribArray(texCoordLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, mygl.texCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    let coordLoc = gl.getAttribLocation(mygl.texturedShader, "a_coordinates");
    gl.enableVertexAttribArray(coordLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, mygl.quadVerticesBuffer);
    gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);

    let textureLoc = gl.getUniformLocation(mygl.texturedShader, "u_texture");
    gl.uniform1i(textureLoc, 0);

    let w = gl.canvas.clientWidth;
    let h = gl.canvas.clientHeight;

    let aspect = 16/9;

    let ws = 1; // width scaler
    let hs = 1; // height scaler
    let quadHeight = w / (aspect); // keep the aspect ratio
    
    if(h <= quadHeight) {
        hs = quadHeight / h;
    } else { // correction on width scaler
        let quadWidth = h * (aspect);
        if(w <= quadWidth) {
            ws = quadWidth / w;
        }
    }

    let scalerLoc = gl.getUniformLocation(mygl.texturedShader, "u_scaler");
    gl.uniform2fv(scalerLoc, [ws, hs]);

    gl.drawArrays(gl.TRIANGLES, 0, 6); // 2 triangles
}    

mygl = new mygl({
    numTextures: 90,
    path: "./img/",
    ext: "webp"
});

init();
