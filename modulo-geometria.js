/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/
var superficie3D;
var mallaDeTriangulos;
var indexBuffer = [];
var columnas=50;
var filas=50;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

function crearGeometria(){
        
    superficie3D=new Plano(3,3);
    var forma= getUrlVars()["forma"]

    if(forma == "esfera"){
        superficie3D=new Esfera(1);
    }
    else if(forma == "tubo"){
        superficie3D=new CilindroSenoidal(1,0.5,1,3);
    }

    //superficie3D=new Esfera(1);
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Cilindro(radio, alto){

    this.getPosicion=function(u,v){

        lon =  v * 2 * Math.PI;
        var x = radio * Math.sin( lon );
        var y = u*alto;
        var z = radio * Math.cos( lon );

        return [x,y,z];
    }

    this.getNormal=function(u,v){

        lon = (v*2.0-1.0) * Math.PI;

        var x = Math.cos( lon );
        var z = Math.sin( lon );
        return [x,0,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radius){

    this.getPosicion=function(u,v){

        var phi   = u  * 2 * Math.PI;
        var theta = v  * Math.PI;

        var x = (radius) * Math.sin(theta)*Math.cos(phi);
        var z = (radius) * Math.sin(theta)*Math.sin(phi);
        var y = (radius) * Math.cos(theta);

        return [x,y,z];
    }

    this.getNormal=function(u,v){

        var phi   = v  * 2 * Math.PI;
        var theta = u  * Math.PI;

        var x =  Math.sin(theta)*Math.cos(phi);
        var z =  Math.sin(theta)*Math.sin(phi);
        var y =  Math.cos(theta);

        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


function CilindroSenoidal(amplitud, longitud, radio, altura){

    this.getPosicion=function(u,v){

        var theta =  u * 2 * Math.PI;
        
        var y = v*altura-(altura/2);

        var phi = ((y) * ((Math.PI*2)/longitud));

        var x = Math.cos( theta ) * (Math.sin(phi)*0.1*amplitud + radio);
        var z = Math.sin( theta ) * (Math.sin(phi)*0.1*amplitud + radio);

        return [x,y,z];
    }

    this.getNormal=function(u,v){

        return [0,0,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


function generarSuperficie(superficie,filas,columnas){
    
    let positionBuffer = [];
    let normalBuffer = [];
    let uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    

    // Buffer de indices de los triángulos

    var arrayDeIndices = [];

    var contador = 0;

    for (i=0; i <= filas; i++) {
        let indices = [];
        for (j=0; j <= columnas; j++) {
            indices.push(contador);
            contador++;
        }
        arrayDeIndices.push(indices);
    }

    console.log(arrayDeIndices);

    let recorridoInverso = false;

    for(i = 0; i < arrayDeIndices.length-1; i++){

        if(recorridoInverso){
            for(j = arrayDeIndices[i].length-1; j >= 0; j--){
                indexBuffer.push(arrayDeIndices[i][j]);
                indexBuffer.push(arrayDeIndices[i+1][j]);
            }
            recorridoInverso = !recorridoInverso;

        }else{
            for(j = 0; j < arrayDeIndices[i].length; j++){
                indexBuffer.push(arrayDeIndices[i][j]);
                indexBuffer.push(arrayDeIndices[i+1][j]);
            }
            //recorridoInverso = !recorridoInverso;
            if(i < arrayDeIndices.length-2){
                indexBuffer.push(arrayDeIndices[i+1][(arrayDeIndices[i+1].length-1)]);
                indexBuffer.push(arrayDeIndices[i+1][0]);
            }
        }
    }

    console.log(indexBuffer);
    
    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

