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
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';


// Variables de consenso
let renderer, scene, camera;

let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo;
let video;
let angulo = 0;
let grupoPentagono, figuras = [];
let mixers = [];


// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/

// Acciones
init();
loadScene();
//loadGUI();
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

    // Importar un modelo en gltf
    const glloader = new GLTFLoader();


     glloader.load( 'models/spongebob_boat/scene.gltf', function ( gltf ) {
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

    glloader.load( 'models/spongebob_city/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.4, 0.4, 0.4); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x, -center.y+15, -center.z);

        gltf.scene.rotation.x = Math.PI/2;
        gltf.scene.position.y = -0.2;
        gltf.scene.receiveShadow = true;
        suelo.add( gltf.scene );
        console.log("ROBOT");
        console.log(gltf);
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    glloader.load( 'models/spongebob/scene.gltf', function ( gltf ) {
        const bob = gltf.scene;
        bob.position.y = 0;
        bob.rotation.y = -Math.PI/2;
        //gltf.scene.scale.set(0.1, 0.1, 0.1); // Reducir el tamaño si es muy grande
        
        //camera.position.set(1, 5, 10); // Alejar la cámara si es necesario
        const box = new THREE.Box3().setFromObject(bob);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x+2, -center.y+0.2, -center.z);


        scene.add( bob );

        const fbxLoader = new FBXLoader();
        fbxLoader.load('models/spongebob/Walking.fbx', function (fbx) {
            const animationMixer = new THREE.AnimationMixer(bob); // Usa el modelo GLTF existente
            const action = animationMixer.clipAction(fbx.animations[0]); // Aplica la animación al modelo
            action.play(); // Opcional, solo si quieres que la animación se reproduzca automáticamente
            mixers.push(animationMixer); // Ahora sí puedes usar mixers.push()
        });

    
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
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(1000,1000,1000),paredes);
    scene.add(habitacion);


}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));


    updateCharacterMovement(); // Verifica si el personaje está caminando

    renderer.render(scene, camera);
}
animate();


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
    if (mixer) {
        mixer.update(0.01); // Actualiza la animación
    }
    update(delta);
    renderer.render( scene, camera );
}