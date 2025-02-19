/**
 * Escena.js
 * 
 * Practica AGM #1. Escena basica en three.js
 * Seis objetos organizados en un grafo de escena con
 * transformaciones, animacion basica y modelos importados
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




// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/

let suelo, figuras = [], modeloImportado, grupoPentagono;


// Acciones
init();
loadScene();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render y el canvas
    *******************/

    renderer.setClearColor(new THREE.Color(0xAAAAAA)); // Color de fondo
    document.body.appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( new THREE.Vector3(0,1,0) );
}

function loadScene()
{
    const material = new THREE.MeshNormalMaterial( );

    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/

    const sueloGeo = new THREE.PlaneGeometry(10, 10);
    const sueloMat = new THREE.MeshNormalMaterial({ color: 0x888885, side: THREE.DoubleSide });
    suelo = new THREE.Mesh(sueloGeo, sueloMat);
    suelo.rotation.x = -Math.PI / 2; // Rotar para que quede en el plano XZ
    scene.add(suelo);


    /*******************
    * TO DO: Construir una escena con 5 figuras diferentes posicionadas
    * en los cinco vertices de un pentagono regular alredor del origen
    *******************/

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
    

    /*******************
    * TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    *******************/

    /*// Importar un modelo en json
    const loader = new THREE.ObjectLoader();

    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            scene.add(objeto);
            objeto.position.y = 0;
        }
    )*/

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


    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/

    const ejes = new THREE.AxesHelper(3);
    scene.add(ejes);
}


/*******************
* TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
* y del conjunto pentagonal sobre el objeto importado
*******************/

function update() {
    figuras.forEach(figura => {
        figura.rotation.y += 0.02; // Rotación individual
    });

    grupoPentagono.rotation.y += 0.01; // Rotación del conjunto
}
    


function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}