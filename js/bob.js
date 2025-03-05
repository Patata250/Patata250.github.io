/**
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
import {FBXLoader} from "../lib/three/examples/jsm/loaders/FBXLoader.js";
//import {PointerLockControls} from "../lib/three/examples/jsm/controls/PointerLockControls.js";



// Variables de consenso
let renderer, scene, camera;

let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo,bob,ciudad,barco;
let video;
let angulo = 0;
let grupoPentagono, figuras = [];
let mixers = [];
let velocity = new THREE.Vector3(0, 0, 0); // Velocidad inicial
const gravity = new THREE.Vector3(0, -0.01, 0); // Simulación de gravedad
let cameraMode = "third"; // "first" para primera persona, "third" para tercera
const offsetThirdPerson = new THREE.Vector3(0, 2, 5); // Distancia detrás de Bob
const offsetFirstPerson = new THREE.Vector3(0, 1.8, 0.2); // Cercana a la cabeza de Bob



// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/

// Acciones
init();
loadScene();
loadGUI();
//render();

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
    //scene.background = new THREE.Color(0.5,0.5,0.5);
    
    // Camara
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0, 2, 7 );
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/

    cameraControls = new OrbitControls( camera, renderer.domElement );
    //cameraControls.target.set(0,1,0);
    //camera.lookAt( new THREE.Vector3(0,1,0) );

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
    
    // Suelo
    const path ="./images/";
    const texsuelo = new THREE.TextureLoader().load(path+"wood512.jpg");
    texsuelo.repeat.set(1,1);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;



    const matsuelo = new THREE.MeshBasicMaterial({transparent:true, opacity: 0,map:texsuelo});


    
    
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(16,9, 100,100), matsuelo );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    // BARCO
    const glloader = new GLTFLoader();


    glloader.load( 'models/spongebob_boat/scene.gltf', function ( gltf ) {
        barco = gltf.scene;
        gltf.scene.position.y = 0;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.1, 0.1, 0.1); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x, -center.y+0.2, -center.z);


        scene.add( gltf.scene );
        console.log("ROBOT");
        console.log(gltf);
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } ); 

    //CIUDAD
    glloader.load( 'models/spongebob_city/scene.gltf', function ( gltf ) {
        ciudad = gltf.scene;
        ciudad.position.y = 0;
        ciudad.rotation.y = -Math.PI/2;
        ciudad.scale.set(0.4, 0.4, 0.4); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(ciudad);
        const center = box.getCenter(new THREE.Vector3());
        ciudad.position.set(-center.x, -center.y+15, -center.z);

        ciudad.rotation.x = Math.PI/2;
        ciudad.position.y = -0.2;
        ciudad.receiveShadow = true;
        suelo.add(ciudad);
        console.log("ROBOT");
        console.log(gltf);
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } ); 

    //BOB ESPONJA
    glloader.load( 'models/spongebob/scene.gltf', function ( gltf ) {
        bob = gltf.scene;
        bob.position.y = 0;
        bob.rotation.y = -Math.PI;

        //gltf.scene.scale.set(0.1, 0.1, 0.1); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(bob);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x+2, -center.y, -center.z);


        scene.add( bob );

        // Cargar animación de Bob Esponja
        /* const fbxLoader = new FBXLoader();
        fbxLoader.load('models/spongebob/Walking.fbx', function (fbx) {
            if (fbx.animations.length > 0) {
                const animationMixer = new THREE.AnimationMixer(bob); 
                const action = animationMixer.clipAction(fbx.animations[0]); 
                action.play(); 
                mixers.push(animationMixer);
            } else {
                console.warn("No se encontraron animaciones en el archivo FBX.");
            }
        }, undefined, function (error) {
            console.error("Error al cargar la animación FBX:", error);
        }); */


    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } ); 

    // HABITACIÓN
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
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(1000,1000,1000),paredes);
    scene.add(habitacion);


}

const clock = new THREE.Clock();
const keys = {}; // Para rastrear las teclas presionadas

document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

function animate() {
    requestAnimationFrame(animate);

    /* const delta = clock.getDelta(); // Tiempo entre frames
    if (mixers.length > 0) {
        mixers.forEach(mixer => mixer.update(delta));
    } */

    const delta = clock.getDelta(); // Tiempo entre frames

    // Aplicar gravedad
    velocity.add(gravity);

    // Movimiento con WASD
    const force = 0.07; // Fuerza aplicada
    if (keys['KeyD']) velocity.x += force;
    if (keys['KeyA']) velocity.x -= force;
    if (keys['KeyW']) velocity.z -= force;
    if (keys['KeyS']) velocity.z += force;

    // Salto con la barra espaciadora
    if (keys['Space'] && bob.position.y <= 0) {
        velocity.y = 0.2; // Fuerza de salto
    }

    // Mover el objeto
    bob.position.add(velocity);

    // Colisión con el suelo (detener caída)
    if (bob.position.y < -0.23) {
        bob.position.y = -0.23;
        velocity.y = 0; // Detener el movimiento vertical
    }

    // Colisiones con otros objetos
    const box = new THREE.Box3().setFromObject(bob);
    scene.traverse((object) => {
        if (object !== bob && object == ciudad) {
            const otherBox = new THREE.Box3().setFromObject(object);
            if (box.intersectsBox(otherBox)) {
                // Detener el movimiento en la dirección de la colisión
                if (velocity.x > 0) velocity.x = 0;
                if (velocity.x < 0) velocity.x = 0;
                if (velocity.z > 0) velocity.z = 0;
                if (velocity.z < 0) velocity.z = 0;
            }
        }
    });
    updateCamera();
    cameraControls.update();
    renderer.render(scene, camera);
}
animate();

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
        animar: function () {
            changeCamera();
        }
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Control Bob");

    h.add(effectController, "animar").name("Cambiar camara").onChange(changeCamera);
}

function changeCamera(){
    if (cameraMode === "third") {
        cameraMode = "first";
    } else {
        cameraMode = "third";
    }
}

function updateCamera() {
    const offset = new THREE.Vector3(0, 2, 5); // Ajusta la distancia y altura de la cámara
    const cameraPosition = bob.position.clone().add(offset);
    camera.position.lerp(cameraPosition, 0.1); // Suaviza el movimiento de la cámara
    camera.lookAt(bob.position); // La cámara siempre mira a Bob
}

/* function updateCamera() {
    if (cameraMode === "third") {
        const thirdPersonPosition = bob.position.clone().add(offsetThirdPerson);
        camera.position.lerp(thirdPersonPosition, 0.1);
        camera.lookAt(bob.position);
    } else if (cameraMode === "first") {
        const firstPersonPosition = bob.position.clone().add(offsetFirstPerson);
        camera.position.lerp(firstPersonPosition, 0.1);
        camera.lookAt(bob.position.clone().add(new THREE.Vector3(0, 1.8, -2))); 
    }
}
 */
/* document.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    if (event.code === "KeyC") {
        cameraMode = (cameraMode === "third") ? "first" : "third";
    }
}); */



// Variables para almacenar el ángulo de rotación actual y la posición inicial del ratón
/* let prevMouseX = 0;
let rotationSpeed = 0.005; // Velocidad de rotación, ajustable

// Escuchar el movimiento del ratón
document.addEventListener('mousemove', (event) => {
    // Obtener la diferencia en el movimiento del ratón

    const deltaX = event.clientX - prevMouseX;
    
    // Actualizar la rotación de 'bob' en el eje Y (horizontal)
    bob.rotation.y -= deltaX * rotationSpeed; // Usamos un signo negativo para invertir la rotación

    // Actualizar la posición del ratón
    prevMouseX = event.clientX;
}); */




function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    TWEEN.update();
}




/* function render(delta)
{
    requestAnimationFrame( render );
     if (mixers.length > 0) { 
        mixers.forEach(mixer => mixer.update(0.01)); // Recorre el array y actualiza cada mixer
    } 
    update(delta);
    cameraControls.update(); // Necesario si OrbitControls está en uso
    renderer.render( scene, camera );
} */