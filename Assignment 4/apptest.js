/**
 * Group #3
 *
 * Student Names: Isaac Murisa  201534328
 *                Shamiso Jaravaza 201522448
 *
 */


// variables for system
// Shape arrays and vertices


// http://www.cs.uregina.ca/Links/class-info/315/WebGL2/Lab6/#Lighting

var shadedSphere3 = function() {
var canvas;
var gl;
var points = [];
var normalsArray = [];
var colors = [];
var s2points = [];
var s2colors = [];
var s3points = [];
var s3colors = [];
var s4points = [];
var s4colors = [];
var s5points = [];
var s5colors = [];

var numTimesToSubdivide = 4;

var index = 0;

var positionsArray = [];
var normalsArray = [];

//SWITCH SHADING
var flat = true;
//DISABLE LIGHTING
var lightON = true;
var leftLightON = true;
var rightLightON = true;

var near = -10;
var far = 10;
var radius = 1.5;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var top =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//default Light source
var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var nMatrix, nMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var shape = "circle";

function triangle(a, b, c) {
  if (flat == true){

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));

    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));

    positionsArray.push(a);
    positionsArray.push(b);
    positionsArray.push(c);

    index += 3;
  }
  else {
    positionsArray.push(a);
    positionsArray.push(b);
    positionsArray.push(c);

    // normals are vectors

    normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
    normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
    normalsArray.push(vec4(c[0],c[1], c[2], 0.0));


    index += 3;
  }
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        positionsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        positionsArray = [];
        normalsArray = [];
        init();
    };

    /**
     * Event handlers for key press and rotation
     
    document.onkeypress = function(event) {
      if (event.code=='KeyW') {  //W key
        phi += dr;
      };
      if (event.code=='KeyS') {  //s key
        phi -= dr;
      };
      if (event.code=='KeyA') {  //a key
        theta -= dr;
      };
      if (event.code=='KeyD') {  //D key
        theta += dr;
      };
    };
    */

    var slider = document.getElementById("lightSlider");
    var output = document.getElementById("value");

    output.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
      output.innerHTML = this.value;
      var sv = output.innerHTML;
      var sliderVal = sv/100;
      lightAmbient = vec4(sv, 0.0, 0.0, 1.0);
      init();
    }

    //SWITCH SHADING TYPE
    document.onkeydown = function (e) {
        switch (e.which) {
            case 83:
                index = 0;
                positionsArray = [];
                normalsArray = [];
                flat = false;
                init();
                break;
            case 70:
                index = 0;
                positionsArray = [];
                normalsArray = [];
                flat = true;
                init();
                break;
    //SWITCH LIGHTING ON OR OFF
    //change LIGHT POSITION AND COLOR
            case 84:
              if (lightON==false){
                lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
                lightON=true;
                init();
              }
              else {
                  lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
                  lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
                  lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
                  lightON=false;
                  init();
                }
                break;
            case 76: //left
              if (leftLightON==false){
                lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
                leftLightON=true;
                init();
              }
              else {
               lightAmbient = vec4(0.0, 1.0, 5.0, 1.0);
                lightDiffuse = vec4(1.0, 0.4, 0.0, 1.0);
                lightPosition = vec4(1.0, 0.0, 0.0, 0.0);
                leftLightON = false;
                init();
              }
                break;
            case 82:
              if (rightLightON==false){
                lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
                rightLightON=true;
                init();
              }
              else {
                lightAmbient = vec4(0.4, 0.1, 0.2, 1.0);
                lightDiffuse = vec4(1.0, 0.0, 0.0, 1.0);
                lightPosition = vec4(-1.0, 0.0, 0.0, 0.0);
                rightLightON = false;
                init();
              }
                break;


        }
    };

    //default
    gl.uniform4fv( gl.getUniformLocation(program,"uAmbientProduct"), ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program,"uDiffuseProduct"), diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program,"uSpecularProduct"), specularProduct );
    gl.uniform4fv( gl.getUniformLocation(program,"uLightPosition"), lightPosition );
    gl.uniform1f( gl.getUniformLocation(program,"uShininess"),materialShininess );

    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);

    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );

    requestAnimationFrame(render);
};

/**
 * Cube function
 */
function Cube(a, b, c, d) {
  if (flat){
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    points.push(vertices[a]);
    normalsArray.push(normal);
    points.push(vertices[b]);
    normalsArray.push(normal);
    points.push(vertices[c]);
    normalsArray.push(normal);
    points.push(vertices[a]);
    normalsArray.push(normal);
    points.push(vertices[c]);
    normalsArray.push(normal);
    points.push(vertices[d]);
    normalsArray.push(normal);
  }
  else {
    points.push(vertices[a]);
    normalsArray.push(vertices[a]);
    points.push(vertices[b]);
    normalsArray.push(vertices[b]);
    points.push(vertices[c]);
    normalsArray.push(vertices[c]);
    points.push(vertices[a]);
    normalsArray.push(vertices[a]);
    points.push(vertices[c]);
    normalsArray.push(vertices[c]);
    points.push(vertices[d]);
    normalsArray.push(vertices[d]);
  }
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


}

shadedSphere3();
