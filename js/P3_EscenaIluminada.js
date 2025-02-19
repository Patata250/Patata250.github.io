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
let angulo = 0;
let grupoPentagono, figuras = [];

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
    const texsuelo = new THREE.TextureLoader().load(path+"wood512.jpg");
    texsuelo.repeat.set(1,1);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;



    const matsuelo = new THREE.MeshBasicMaterial({color:"rgb(150,150,150)",map:texvideo});


    
    // Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(16,9, 100,100), matsuelo );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    const entorno = [ path+"Forest_Room/posx.jpg", path+"Forest_Room/negx.jpg",
                        path+"Forest_Room/posy.jpg", path+"Forest_Room/negy.jpg",
                        path+"Forest_Room/posz.jpg", path+"Forest_Room/negz.jpg"];

    const texFigura = new THREE.CubeTextureLoader().load(entorno);

    const material = new THREE.MeshPhongMaterial( {wireframe:false, 
        color:'white',
        specular:'gray',
        shininess: 30,
        envMap: texFigura } );

    const materialTorus = new THREE.MeshLambertMaterial( {wireframe:false,
        color:'white',
        envMap: texFigura } );

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/

    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),       // Cubo
        new THREE.SphereGeometry(0.5, 32, 32), // Esfera
        new THREE.ConeGeometry(0.5, 1, 32),   // Cono
        new THREE.CapsuleGeometry(0.2, 0.3, 32), // Cilindro
        new THREE.TorusGeometry(0.4, 0.15, 16, 100) // Toro
    ];
    
    grupoPentagono = new THREE.Group(); // Agrupamos las figuras
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        const figura = new THREE.Mesh(geometries[i], material);
        figura.position.set(Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2);
        figura.castShadow = true;
        figura.receiveShadow = true;
        grupoPentagono.add(figura);
        figuras.push(figura);
    }
    
    //Toroide con otro material
    const angle = (4 * 2 * Math.PI) / 5;
    const figura = new THREE.Mesh(geometries[4], materialTorus);
    figura.position.set(Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2);
    figura.castShadow = true;
    figura.receiveShadow = true;
    grupoPentagono.add(figura);
    figuras.push(figura);
        
    scene.add(grupoPentagono);

    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

    //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
    glloader.load( 'models/spongebob_boat/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.1, 0.1, 0.1); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x, -center.y+0.4, -center.z);


        scene.add( gltf.scene );
        console.log("ROBOT");
        console.log(gltf);
    
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
    *******************/

    // Definicion de los controles
    effectController = {
        mensaje: 'Figuras',
        giroY: 0.0,
        colorsuelo: "rgb(150,150,150)",
        radioPentagono: 2,
        wireframe: false,
        animar: function () {
            animateFigures();
        }
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Control Pentagono");
    h.add(effectController, "mensaje").name("Aplicacion");
    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y").onChange(updateRotationY);
    h.addColor(effectController, "colorsuelo").name("Color suelo").onChange(updateWireframeColor);
    h.add(effectController, "radioPentagono", 1, 5, 0.1).name("Radio Pentágono").onChange(updatePentagonRadius);
    h.add(effectController, "wireframe").name("Wireframe").onChange(updateWireframe);
    h.add(effectController, "animar").name("Animar");
}

function updatePentagonRadius() {
    const radius = effectController.radioPentagono;
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        figuras[i].position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
    }
}

function updateWireframe() {
    const wireframe = effectController.wireframe;
    figuras.forEach(figura => {
        figura.material.wireframe = wireframe;
    });
}

function animateFigures() {
    figuras.forEach((figura, index) => {
        new TWEEN.Tween(figura.position)
            .to({ y: [2, 0.5] }, 1000)
            .interpolation(TWEEN.Interpolation.Bezier)
            .easing(TWEEN.Easing.Bounce.Out)
            .delay(index * 200)
            .start();
    });
}

function updateWireframeColor() {
    const color = new THREE.Color(effectController.colorsuelo);
    suelo.material.color.set(color);
}

function updateRotationY() {
    grupoPentagono.rotation.y = effectController.giroY * Math.PI / 180;
}



function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}