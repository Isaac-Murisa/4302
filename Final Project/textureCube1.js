"use strict";
// WebGL - Textures - Skybox
// from https://webglfundamentals.org/webgl/webgl-skybox.html

var canvas;
var gl;
var poi;

  canvas = document.getElementById( "gl-canvas" );
  gl = canvas.getContext("webgl2");
   if (!gl) { alert( "WebGL 2.0 isn't available" );}
  poi = document.querySelector(".poi");

  //var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  //gl.useProgram( program );

class Vector2 {
  constructor(x = 0.0, y = 0.0) {
    this.x = x;
    this.y = y;
  }
  copyFromEvent(e) {
    this.x = e.clientX;
    this.y = e.clientY;
  }
}

function point(x = 0.0, y = 0.0) {
  return new Vector2(x, y);
}

const start = point();
const end = point();
const current = point();
const last = point();
const movement = point();
const velocity = point();

let isMoving = false;
let isProjectionDirty = true;
let fieldOfView = Math.PI * 0.5;

function checkerboard(w = 512, h = 512, c = 8, r = 8) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  const bw = w / c;
  const bh = h / r;
  for (let y = 0; y < r; y++) {
    for (let x = 0; x < c; x++) {
      context.fillStyle = (x % 2 === 0 && y % 2 === 0 || x % 2 !== 0 && y % 2 !== 0) ? "#f00" : "#fff";
      context.fillRect(x * bw, y * bh, bw, bh);
    }
  }
  return canvas;
}

function cubeTextureFromUrl(url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const checker = checkerboard();
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checker);

  function handler(e) {
    const image = e.target;
    image.removeEventListener("load", handler);
    image.removeEventListener("error", handler);
    image.removeEventListener("abort", handler);
    if (e.type === "load") {
      const WIDTH = 1024;
      const HEIGHT = 1024;

      const W0 = WIDTH * 0;
      const W1 = WIDTH * 1;
      const W2 = WIDTH * 2;
      const W3 = WIDTH * 3;

      const H0 = HEIGHT * 0;
      const H1 = HEIGHT * 1;
      const H2 = HEIGHT * 2;

      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const context = canvas.getContext("2d"); // Get canvas 2d context

      context.drawImage(image, W2, H1, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

      context.drawImage(image, W0, H1, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

      context.drawImage(image, W1, H2, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

      context.drawImage(image, W1, H0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

      context.drawImage(image, W1, H1, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

      context.drawImage(image, W3, H1, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    } else {
      throw new Error("Error loading image");
    }
  }

  const image = new Image();
  image.addEventListener("load", handler);
  image.addEventListener("error", handler);
  image.addEventListener("abort", handler);
  image.crossOrigin = "anonymous";
  image.src = url;

  return texture;
}

function texture() {
  const texture2d = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2d);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture2d;
}

function updateTexture(texture2d, video) {
  gl.bindTexture(gl.TEXTURE_2D, texture2d);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture2d;
}

function shader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function program(vertex, fragment) {
  const program = gl.createProgram();

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);

  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw ("program filed to link:" + gl.getProgramInfoLog(program));
  }
  return program;
}

const BOX = {
  VERTICES: new Float32Array([

    // FRONT FACE
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    // LEFT FACE
    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,

    // BACK FACE
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // RIGHT FACE
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,

    // TOP FACE
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // BOTTOM FACE
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0

  ]),
  INDICES: new Uint8Array([

    // FRONT FACE
    0, 1, 2,
    0, 2, 3,

    // LEFT FACE
    4, 5, 6,
    4, 6, 7,

    // BACK FACE
    8, 9, 10,
    8, 10, 11,

    // RIGHT FACE
    12, 13, 14,
    12, 14, 15,

    // TOP FACE
    16, 17, 18,
    16, 18, 19,

    // BOTTOM FACE
    20, 21, 22,
    20, 22, 23

  ])
};

var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, BOX.VERTICES, gl.STATIC_DRAW);

var fBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, BOX.INDICES, gl.STATIC_DRAW);


const TEXTURE = texture();

const SHADERS = {
  VERTEX: shader(`
    precision highp float;

    attribute vec3 position;
    uniform mat4 transform;

    varying vec3 cubePosition;

    void main() {
      vec4 pos = transform * vec4(position, 1.0);

      cubePosition = position;

      gl_Position = vec4(pos.x, -pos.y, pos.z, pos.w);
    }
  `, gl.VERTEX_SHADER),
  FRAGMENT: shader(`
    precision highp float;

    varying vec3 cubePosition;
    uniform samplerCube cubeMap;

    void main() {
      gl_FragColor = textureCube(cubeMap, cubePosition);
    }
  `, gl.FRAGMENT_SHADER)
};

const MATERIALS = {
  DEFAULT: program(SHADERS.VERTEX, SHADERS.FRAGMENT)
};

const PROJECTION = mat4.create();
const WORLD = mat4.create();
const TRANSFORM = mat4.create();
const IWORLD = mat4.create();
const ITRANSFORM = mat4.create();

const UNIFORMS = {
  TRANSFORM: gl.getUniformLocation(MATERIALS.DEFAULT, "transform"),
  TEXTURE: gl.getUniformLocation(MATERIALS.DEFAULT, "cubeMap")
};
const ATTRIBUTES = {
  POSITION: gl.getAttribLocation(MATERIALS.DEFAULT, "position")
};

//cubemap image comes from resource http://3dprintrva.com/wp-content/plugins/canvasio3dpro/inc/resource/cubeMaps/
const cubeTexture = cubeTextureFromUrl("https://raw.githubusercontent.com/Isaac-Murisa/4302/master/map.jpg");

const unprojectedVector = vec4.set(vec4.create(), 0.0,0.0,-1.0,0.0);
const projectedVector = vec4.create();

function render(now) {

  if (isProjectionDirty) {
    mat4.perspective(PROJECTION, fieldOfView, canvas.width / canvas.height, 0.01, 1000.0);
    isProjectionDirty = false;
  }

  movement.x += velocity.x;
  movement.y += velocity.y;

  velocity.x *= 0.9;
  velocity.y *= 0.9;

  if (movement.y < Math.PI * -0.5) {
    movement.y = Math.PI * -0.5;
  } else if (movement.y > Math.PI * 0.5) {
    movement.y = Math.PI * 0.5;
  }

  mat4.identity(WORLD);
  mat4.rotateX(WORLD, WORLD, movement.y);
  mat4.rotateY(WORLD, WORLD, -movement.x);
  //mat4.rotateX(WORLD, WORLD, Math.PI * 0.001);
  //mat4.rotateY(WORLD, WORLD, Math.PI * 0.01);
  mat4.multiply(TRANSFORM, PROJECTION, WORLD);

  vec4.transformMat4(projectedVector,unprojectedVector,TRANSFORM);

  /*const transform = `translate(${Math.round(projectedVector[0] * (canvas.width * 0.5))}px,${Math.round(projectedVector[1] * (canvas.height * 0.5))}px)`;

  if (projectedVector[3] >= 0.0) {
    poi.style.transform = transform;
    if (poi.style.visibility == "hidden") {
      poi.style.visibility = "visible";
    }
  } else {
    if (poi.style.visibility != "hidden") {
      poi.style.visibility = "hidden";
    }
  }*/

  // set clear color.
//  gl.clearColor(1.0, 0.0, 0.0, 1.0);
//  gl.clear(gl.COLOR_BUFFER_BIT);

  // set viewport size.
  //gl.viewport(0, 0, canvas.width, canvas.height);

  gl.useProgram(MATERIALS.DEFAULT);

  // set viewport size.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
  gl.uniform1i(UNIFORMS.TEXTURE, 0);

  gl.enableVertexAttribArray(ATTRIBUTES.POSITION);
  gl.vertexAttribPointer(ATTRIBUTES.POSITION, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(UNIFORMS.TRANSFORM, false, TRANSFORM);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

  window.requestAnimationFrame(render);

}

function resize() {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  isProjectionDirty = true;

}

resize();
render();

function down(e) {
  if (!isMoving && e.button === 0) {
    start.copyFromEvent(e);
    current.copyFromEvent(e);
    last.copyFromEvent(e);
    end.copyFromEvent(e);
    isMoving = true;
  }
}

function up(e) {
  if (isMoving && e.button === 0) {
    current.copyFromEvent(e);
    end.copyFromEvent(e);
    isMoving = false;
  } else if (e.button === 1) {
    fieldOfView = Math.PI * 0.5;
    isProjectionDirty = true;
  }
}

function move(e) {
  if (isMoving && e.button === 0) {
    current.copyFromEvent(e);
    velocity.x += ((current.x - last.x) / window.innerWidth) * 0.5;
    velocity.y += ((current.y - last.y) / window.innerHeight) * 0.5;
    last.copyFromEvent(e);
  }
}

function wheel(e) {
  if (e.deltaY > 0) {
    if (fieldOfView > Math.PI * 0.25) {
      fieldOfView -= 0.01;
      isProjectionDirty = true;
    }
  } else if (e.deltaY < 0) {
    if (fieldOfView < Math.PI * 0.9) {
      fieldOfView += 0.01;
      isProjectionDirty = true;
    }
  }
}

window.addEventListener("resize", resize);

window.addEventListener("wheel", wheel, false);
window.addEventListener("mousedown", down, false);
window.addEventListener("mousemove", move, false);
window.addEventListener("mouseup", up, false);
