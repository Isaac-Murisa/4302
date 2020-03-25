/**
 * Group #3
 * 
 * Student Names: Isaac Murisa  201534328
 *                Shamiso Jaravaza 201522448
 * 
 */


// variables for system
// Shape arrays and vertices
var gl;
var points = [];
var colors = [];
var s2points = [];
var s2colors = [];
var s3points = [];
var s3colors = [];
var s4points = [];
var s4colors = [];
var s5points = [];
var s5colors = [];


var vModelViewMatrix, vProjectionMatrix;
var modelViewMatrix, projectionMatrix;

// orthogonal viewing variables
var near = -1;
var far = 1;
var radius = 1.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;
// perspective viewing variables
var pnear = 0.1;
var pfar = 1000.0;
var pradius = 3.0;
var ptheta = 0.0;
var pphi = 0.0;
var pdr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

// orthogonal viewing
var left = -1.0;
var right = 1.0;
var top = 1.0;
var bottom = -1.0;

var mv = new mat4();
var p = new mat4();

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// variables use by the tranfornations
var model_trans = "perspective";
var num = 0.1;
var y_point = 1;
var x_point = 1;

/**
 * Init() function
 */
window.onload = function init() {
  var canvas = document.getElementById( "gl-canvas" );
  gl = canvas.getContext('webgl2'); 

  if ( !gl ) { 
    alert( "WebGL isn't available" ); 
  }

  // populate indices for cube
  cubeIndices();
  tetraIndices();
  //cuboidIndices();
  //prismIndices();
  //rightAnglePrism();


  //  Configure WebGL  
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

  aspect = canvas.width/canvas.height;
  // Depth Test
  gl.enable(gl.DEPTH_TEST);


  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );     

  /**
   * Buffer objects
   */
  
  // ---------------Color Buffer-------------------
  // load the data into gpu
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // Associate color with buffer data
  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  // ---------------Vertices------------------
  // Load the data into the GPU        
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);   //change when vertices

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );    


  // pass model view matrix to vertex shader
  vModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  vProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

  // render objects
  render();
};

/**
 * Render functions
 */
function render() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  var tempMV = getModelView();
  var tempPM = getProjectionMatrix();

  gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(tempMV));
  gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(tempPM));
  gl.drawArrays( gl.TRIANGLES, 0, pointMatrix[i].length );

  requestAnimationFrame(render);
  
};


/**
 * Event handlers for key press and rotation
 */
document.onkeypress = function(event) {
  if (event.code=='KeyW') {  //W key
    pradius--;
  };
  if (event.code=='KeyS') {  //s key
    pradius++;
  };
  if (event.code=='KeyA') {  //a key
    ptheta--;
  };
  if (event.code=='KeyD') {  //D key
    ptheta++;
  };
};

function getModelView() {
  eye = vec3(pradius * Math.sin(ptheta)*Math.cos(pphi), pradius * Math.sin(ptheta) * Math.sin(pphi), pradius * Math.cos(ptheta));
  return(lookAt(eye, at , up));
};

function getProjectionMatrix() {
  return (perspective(fovy, aspect, pnear, pfar));
};



/********   Shapes  ******/


/**
 * Cube function
 */
function Cube(a, b, c, d) {
  points.push(vertices[a]);
  colors.push(faceColors[a]);
  points.push(vertices[b]);
  colors.push(faceColors[a]);
  points.push(vertices[c]);
  colors.push(faceColors[a]);
  points.push(vertices[a]);
  colors.push(faceColors[a]);
  points.push(vertices[c]);
  colors.push(faceColors[a]);
  points.push(vertices[d]);
  colors.push(faceColors[a]);
};
// cube vertices
const vertices = [
  vec4( -0.5, -0.5, 0.5, 1.0 ),
  vec4( -0.5, 0.5, 0.5, 1.0 ),
  vec4( 0.5, 0.5, 0.5, 1.0 ),
  vec4( 0.5, -0.5, 0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5, 0.5, -0.5, 1.0 ),
  vec4( 0.5, 0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 )
];
// cube colors
const faceColors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0),  // cyan
  vec4(1.0, 1.0, 1.0, 1.0)   // white
];
// cube indices
function cubeIndices(){
  Cube(1,0,3,2);
  Cube(2,3,7,6);
  Cube(3,0,4,7);
  Cube(6,5,1,2);
  Cube(4,5,6,7);
  Cube(5,4,0,1);
};


/**
 * Tetrahedrone 
 */
function Tetrahedrone(a, b, c) {
  s2points.push(tetraVertices[a]);
  s2colors.push(faceColors[a]);
  s2points.push(tetraVertices[b]);
  s2colors.push(faceColors[a]);
  s2points.push(tetraVertices[c]);
  s2colors.push(faceColors[a]);
};
// prism vertices
const tetraVertices = [
  vec4(0, 0.5, 0, 1.0),
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];
// prism indices
function tetraIndices() {
  Tetrahedrone(0, 1, 2);
  Tetrahedrone(1, 3, 0);
  Tetrahedrone(2, 4, 0);
  Tetrahedrone(3, 0, 4);
  Tetrahedrone(4, 3, 1);
  Tetrahedrone(4, 2, 1);
  colors = s2colors;
  points = s2points;
};


/**
 * Cuboid
 */
function Cuboid(a, b, c, d) {
  s3points.push(cuboidVertices[a]);
  s3colors.push(faceColors[a]);
  s3points.push(cuboidVertices[b]);
  s3colors.push(faceColors[a]);
  s3points.push(cuboidVertices[c]);
  s3colors.push(faceColors[a]);
  s3points.push(cuboidVertices[a]);
  s3colors.push(faceColors[a]);
  s3points.push(cuboidVertices[c]);
  s3colors.push(faceColors[a]);
  s3points.push(cuboidVertices[d]);
  s3colors.push(faceColors[a]);
};
// cuboid vertices
const cuboidVertices = [
  vec4( -0.5, -0.25, 0.5, 1.0 ),
  vec4( -0.5, 0.25, 0.5, 1.0 ),
  vec4( 0.5, 0.25, 0.5, 1.0 ),
  vec4( 0.5, -0.25, 0.5, 1.0 ),
  vec4( -0.5, -0.25, -0.5, 1.0 ),
  vec4( -0.5, 0.25, -0.5, 1.0 ),
  vec4( 0.5, 0.25, -0.5, 1.0 ),
  vec4( 0.5, -0.25, -0.5, 1.0 )
];
// cuboid indices
function cuboidIndices(){
  Cuboid(1,0,3,2);
  Cuboid(2,3,7,6);
  Cuboid(3,0,4,7);
  Cuboid(6,5,1,2);
  Cuboid(4,5,6,7);
  Cuboid(5,4,0,1);
  colors = s3colors;
  points = s3points;
};

/**
 * Prism as shape 4
 */
function Prism(a, b, c){
  s4points.push(prismVertices[a]);
  s4colors.push(faceColors[a]);
  s4points.push(prismVertices[b]);
  s4colors.push(faceColors[a]);
  s4points.push(prismVertices[c]);
  s4colors.push(faceColors[a]);
};
// Prism vertices
const prismVertices = [
  vec4( 0, 0.5, 0.5, 1.0 ),
  vec4( -0.5, -0.5, 0.5, 1.0 ),
  vec4( 0.5, -0.5, 0.5, 1.0 ),
  vec4( 0, 0.5, -0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 )
];
// prism indices
function prismIndices(){
  Prism(0, 1, 2);
  Prism(1, 4, 3);
  Prism(1, 3, 0);
  Prism(2, 0, 3);
  Prism(2, 5, 3);
  Prism(3, 4, 5);
  Prism(4, 5, 2);
  Prism(4, 1, 2);
  colors = s4colors;
  points = s4points;
};

/**
 * Right angle prism
 */
function RightTriangle(a, b, c){
  s5points.push(rightPrismVertices[a]);
  s5colors.push(faceColors[a]);
  s5points.push(rightPrismVertices[b]);
  s5colors.push(faceColors[a]);
  s5points.push(rightPrismVertices[c]);
  s5colors.push(faceColors[a]);
};
// Right angle prism
const rightPrismVertices =  [
  vec4( -0.5, -0.5, 0.5, 1.0 ),
  vec4( 0.5, -0.5, 0.5, 1.0 ),
  vec4( 0.5, 0.5, 0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 ),
  vec4( 0.5, 0.5, -0.5, 1.0 ),
];
// Riangle prism indices
function rightAnglePrism() {
  RightTriangle(0, 1, 2);
  RightTriangle(2, 0, 3);
  RightTriangle(2, 5, 3);
  RightTriangle(1, 2, 5);
  RightTriangle(1, 4, 5);
  RightTriangle(3, 4, 5);
  RightTriangle(4, 3, 0);
  RightTriangle(4, 1, 0);
  colors = s5colors;
  points = s5points;
};

//https://github.com/Carla-de-Beer/WebGL-projects/blob/master/Perspective%20Ortho%20Oblique/scripts/main.js