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

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


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
    const sueloMat = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
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
        new THREE.CylinderGeometry(0.5, 1, 32), // Cilindro
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

    const loader = new GLTFLoader();
    loader.load('ruta/del/modelo.glb', function (gltf) {
        modeloImportado = gltf.scene;
        modeloImportado.position.set(0, 0, 0);
        scene.add(modeloImportado);
    }, undefined, function (error) {
        console.error('Error al cargar el modelo:', error);
    });


    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/

    const ejes = new THREE.AxesHelper(3);
    scene.add(ejes);
}

function update()
{
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
    
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}