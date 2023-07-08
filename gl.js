
const uw = 1;
const uh = 1;

let quadVertices = [
	-uw,  uh, 0.0, // triangle 1
	-uw, -uh, 0.0,
	 uw, -uh, 0.0,
	 uw, -uh, 0.0, // triangle 2
	 uw,  uh, 0.0,
	-uw,  uh, 0.0
];

// texture coordinates
let quadTexcoords = [
	0,1,
	0,0,
	1,0,
	1,0,
	1,1,
	0,1
];

class mygl {
    constructor(config) {

        this.NUM_TEXTURES = config.numTextures;
        this.PATH = config.path;
        this.EXT = config.ext;

        this.loadedImages = 0;

        this.texturedShader = null;
        this.quadVerticesBuffer = null;
        this.texCoordBuffer = null;
        this.texture = [];

        this.ctx = null;
    }

    init(canvas) {
        let gl = canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        // Create textures
        let i = 0;

        // create empty textures
        for (i = 0; i <= this.NUM_TEXTURES; i++) {
            this.texture[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture[i]);
            // Fill the texture with a 1x1 gray pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([200, 200, 200, 255])
            );
        }

        // Asynchronously load all images
        for (i = 0; i <= this.NUM_TEXTURES; i++) {
            let file = i.toString().padStart(4, "0");

            file = this.PATH + "/" + file + "." + this.EXT;
            new Promise((res) => {
                const preloadImage = new Image();
                preloadImage.id = i;
                preloadImage.src = file;
                preloadImage.onload = (res) => {
                    this.loadedImages++;
                    gl.bindTexture(gl.TEXTURE_2D, this.texture[preloadImage.id]);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, preloadImage);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                    const event = new CustomEvent("imagesLoaded", { detail: mygl.loadedImages });
                    document.dispatchEvent(event);
                };
            });
        }

        this.quadVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexcoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let texturedShaderVertCode =
            "attribute vec3 a_coordinates;" +
            "attribute vec2 a_texcoord;" +
            "varying vec2 v_texcoord;" +
            "uniform mat4 model;" +
            "uniform mat4 view;" +
            "uniform mat4 proj;" +
            "uniform vec2 u_scaler;" +
            "void main(void)" +
            "{" +
            "v_texcoord = a_texcoord;" +
            "gl_Position = proj * view * model * vec4(a_coordinates.x * u_scaler.x, -a_coordinates.y * u_scaler.y, a_coordinates.z, 1.0);" +
            "}";

        let vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, texturedShaderVertCode);
        gl.compileShader(vertShader);

        let texturedShaderFragCode =
            "precision mediump float;" +
            "varying vec2 v_texcoord;" +
            "uniform sampler2D u_texture;" +
            "void main(void)" +
            "{" +
            "gl_FragColor = texture2D(u_texture, v_texcoord);" +
            "}";

        let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, texturedShaderFragCode);
        gl.compileShader(fragShader);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(vertShader));
        }

        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(fragShader));
        }

        this.texturedShader = gl.createProgram();
        gl.attachShader(this.texturedShader, vertShader);
        gl.attachShader(this.texturedShader, fragShader);

        gl.linkProgram(this.texturedShader);
    }
}
