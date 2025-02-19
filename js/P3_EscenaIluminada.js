/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
 * 
 * @author 
 * 
 */

// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/

import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables de consenso
let renderer, scene, camera;

let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo;
let video;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/

// Acciones
init();
loadScene();
loadGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras
    *******************/

    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/

    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

    // Luces
    /*******************
     * TO DO: Añadir luces y habilitar sombras
     * - Una ambiental
     * - Una direccional
     * - Una focal
     *******************/

    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.3);
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    const puntual = new THREE.PointLight(0xFFFFFF,0.5);
    puntual.position.set(2,7,-4);
    scene.add(puntual);
    const focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

function loadScene()
{
    // Texturas
    /*******************
     * TO DO: Cargar texturas
     * - De superposición
     * - De entorno
     *******************/

    video = document.createElement('video');
    video.src = "./videos/Pixar.mp4";
    video.load();
    video.muted = true;
    video.play();
    const texvideo = new THREE.VideoTexture(video);
    texvideo.repeat.set(1,1);


    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic
     *******************/

    const path ="./images/";
    const texcubo = new THREE.TextureLoader().load(path+"wood512.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"wood512.jpg");
    texsuelo.repeat.set(1,1);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [ path+"Forest_Room/posx.jpg", path+"Forest_Room/negx.jpg",
                        path+"Forest_Room/posy.jpg", path+"Forest_Room/negy.jpg",
                        path+"Forest_Room/posz.jpg", path+"Forest_Room/negz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);

    const matcubo = new THREE.MeshLambertMaterial({color:'yellow',map:texcubo});
    const matesfera = new THREE.MeshPhongMaterial({color:'white',
                                                    specular:'gray',
                                                    shininess: 30,
                                                    envMap: texesfera });
    const matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texvideo});
    
    // Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(16,9, 100,100), matsuelo );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/

    // Esfera y cubo
        esfera = new THREE.Mesh( new THREE.SphereGeometry(1,20,20), matesfera );
        cubo = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), matcubo );
        esfera.position.x = 1;
        cubo.position.x = -1;
        esfera.castShadow = true;
        esfera.receiveShadow = true;
        cubo.castShadow = cubo.receiveShadow = true;
    
        esferaCubo = new THREE.Object3D();
        esferaCubo.add(esfera);
        esferaCubo.add(cubo);
        esferaCubo.position.y = 1;
    
        scene.add(esferaCubo);
    
        scene.add( new THREE.AxesHelper(3) );
        cubo.add( new THREE.AxesHelper(1) );

    // Modelos importados
        const loader = new THREE.ObjectLoader();
        loader.load('models/soldado/soldado.json', 
        function (objeto)
        {
            const soldado = new THREE.Object3D();
            soldado.add(objeto);
            cubo.add(soldado);
            soldado.position.y = 1;
            soldado.name = 'soldado';
            soldado.traverse(ob=>{
                if(ob.isObject3D) ob.castShadow = true;
            });
            objeto.material.setValues( {map:
             new THREE.TextureLoader().load("models/soldado/soldado.png")} );
        });
    
        // Importar un modelo en gltf
       const glloader = new GLTFLoader();
    
       glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
           gltf.scene.position.y = 1;
           gltf.scene.rotation.y = -Math.PI/2;
           gltf.scene.name = 'robota';
           esfera.add( gltf.scene );
           gltf.scene.traverse(ob=>{
            if(ob.isObject3D) ob.castShadow = true;
        })
       
       }, undefined, function ( error ) {
       
           console.error( error );
       
       } );

    /******************
     * TO DO: Crear una habitacion de entorno
     ******************/

    // Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                    map: new THREE.TextureLoader().load(path+"Forest_Room/negz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);

    /******************
     * TO DO: Asociar una textura de vídeo al suelo
     ******************/

}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir
    *   encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    * - Checkbox de sombras
    * - Selector de color para cambio de algun material
    * - Boton de play/pause y checkbox de mute
    *******************/

    // Definicion de los controles
        effectController = {
            mensaje: 'My cinema',
            giroY: 0.0,
            separacion: 0,
            sombras: true,
            play: function(){video.play();},
            pause: function(){video.pause();},
            mute: true,
            colorsuelo: "rgb(150,150,150)"
        };
    
        // Creacion interfaz
        const gui = new GUI();
    
        // Construccion del menu
        const h = gui.addFolder("Control esferaCubo");
        h.add(effectController, "mensaje").name("Aplicacion");
        h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
        h.add(effectController, "separacion", { 'Ninguna': 0, 'Media': 2, 'Total': 5 })
         .name("Separacion")
         .onChange(s=>{
            cubo.position.set( -1-s/2, 0, 0 );
            esfera.position.set( 1+s/2, 0, 0 );
         });
        h.add(effectController, "sombras")
          .onChange(v=>{
            cubo.castShadow = v;
            esfera.castShadow = v;
          });
        h.addColor(effectController, "colorsuelo")
         .name("Color moqueta")
         .onChange(c=>{suelo.material.setValues({color:c})});
        const videofolder = gui.addFolder("Control video");
        videofolder.add(effectController,"mute").onChange(v=>{video.muted = v});
        videofolder.add(effectController,"play");
        videofolder.add(effectController,"pause");
}

function updateAspectRatio()
{
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function animate(event)
{
    // Capturar y normalizar
    let x= event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = -( y / window.innerHeight ) * 2 + 1;

    // Construir el rayo y detectar la interseccion
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);
    const soldado = scene.getObjectByName('soldado');
    const robot = scene.getObjectByName('robota');
    let intersecciones = rayo.intersectObjects(soldado.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( soldado.position ).
        to( {x:[0,0],y:[3,1],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.Out ).
        start();
    }

    intersecciones = rayo.intersectObjects(robot.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( robot.rotation ).
        to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
        interpolation( TWEEN.Interpolation.Linear ).
        easing( TWEEN.Easing.Exponential.InOut ).
        start();
    }
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/

    esferaCubo.rotation.y = effectController.giroY * Math.PI/180;
    
        TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}