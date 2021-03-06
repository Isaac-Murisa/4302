/**
 * Group #3
 *
 * Student Names: Isaac Murisa  201534328
 *                Shamiso Jaravaza 201522448
 *
 */

var project = function() {
  var canvas;
  var gl;
  
  var numTimesToSubdivide = 7;
  var index = 0;
  
  var positionsArray = [];
  var normalsArray = [];
  
  //SWITCH SHADING
  var flat = true;
  //DISABLE LIGHTING
  var lightON = true;
  var leftLightON = true;
  
  // Modelview and projection matrix variables
  var near = -10;
  var far = 10;
  var left = -3.0;
  var right = 3.0;
  var top =3.0;
  var bottom = -3.0;
  
  // Sphere helper variables
  var va = vec4(0.0, 0.0, -1.0,1);
  var vb = vec4(0.0, 0.942809, 0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  var vd = vec4(0.816497, -0.471405, 0.333333,1);
  
  //default Light source
  var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
  var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
  
  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
  var materialShininess = 20.0;
  
  // Matrices
  var modelViewMatrix, projectionMatrix;
  var modelViewMatrixLoc, projectionMatrixLoc;
  var nMatrix, nMatrixLoc;
  
  // Perspective view
  var eye;
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 1.0, 0.0);

  // Set image 
  // Import Earth Image
  var image = new Image();
  image.crossOrigin = "anonymous";
  image.src = 'https://raw.githubusercontent.com/Isaac-Murisa/4302/master/Final%20Project/earthmap1k.jpg';
  var imageWidth = 1000;
  var imageLength = 500;


  /**
   * Drawing a sphere using Tetrahedrons
   */
  
  function triangle(a, b, c) {
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
  
  /**
   * Init function
   */
  window.onload = function init() {
  
      // gl canvas initialization
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
  
      // Buffers 
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
  
      //SWITCH SHADING TYPE
      document.onkeydown = function (e) {
          switch (e.which) {
              //SWITCH LIGHTING ON OR OFF
              //change light/ Sun position to center
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
              // Change light/Sun position to the left
              case 76: 
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
          }
      };
  
      // Light Variables
      gl.uniform4fv( gl.getUniformLocation(program,"uAmbientProduct"), ambientProduct );
      gl.uniform4fv( gl.getUniformLocation(program,"uDiffuseProduct"), diffuseProduct );
      gl.uniform4fv( gl.getUniformLocation(program,"uSpecularProduct"), specularProduct );
      gl.uniform4fv( gl.getUniformLocation(program,"uLightPosition"), lightPosition );
      gl.uniform1f( gl.getUniformLocation(program,"uShininess"),materialShininess );
  
      // Texture variables
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageLength, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0)
      
      render();
  
  }
  
  // rotation variable
  var rot = 2;

  /**
   * Render function
   */
  function render() {
  
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      // Defining modelview matrix and projection matrix
      //eye = vec3(radius*Math.sin(theta)*Math.cos(phi),radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
      eye =  vec3(0.0, 0.0, 1.0);
      modelViewMatrix = lookAt(eye, at , up);
      modelViewMatrix = mult( modelViewMatrix, rotate(rot,vec3(0,1,0)) );
      projectionMatrix = ortho(left, right, bottom, top, near, far);

      // Increment rotation variable
      rot += 2;

      // normals
      nMatrix = normalMatrix(modelViewMatrix, true);
  
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
      gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
      gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );
  
      for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
  
      requestAnimationFrame(render);
  };
  
}

project();
  