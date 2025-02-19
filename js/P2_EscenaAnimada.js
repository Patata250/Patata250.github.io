/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
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

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/

let cameraControls, effectController;
let esferaCubo, cubo, esfera;
let angulo = 0;
let grupoPentagono, figuras = [];
let suelo;

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
    * TO DO: Completar el motor de render y el canvas
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );

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
    //camera.lookAt(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );
}

function loadScene()
{
    const material = new THREE.MeshNormalMaterial( {wireframe:false} );

    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/

    //const material = new THREE.MeshNormalMaterial( );
    
    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/

    const sueloGeo = new THREE.PlaneGeometry(10, 10);
    const sueloMat = new THREE.MeshBasicMaterial({ color: 0x888885, side: THREE.DoubleSide });
    suelo = new THREE.Mesh(sueloGeo, sueloMat);
    suelo.rotation.x = -Math.PI / 2; // Rotar para que quede en el plano XZ
    scene.add(suelo);



    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),       // Cubo
        new THREE.SphereGeometry(0.5, 32, 32), // Esfera
        new THREE.ConeGeometry(0.5, 1, 32),   // Cono
        new THREE.CapsuleGeometry(0.2, 0.3, 32), // Cilindro
        new THREE.TorusGeometry(0.4, 0.15, 16, 100) // Toro
    ];
    
    grupoPentagono = new THREE.Group(); // Agrupamos las figuras
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        const figura = new THREE.Mesh(geometries[i], material);
        figura.position.set(Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2);
        grupoPentagono.add(figura);
        figuras.push(figura);
    }
    
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


    

    const ejes = new THREE.AxesHelper(3);
    scene.add(ejes);

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