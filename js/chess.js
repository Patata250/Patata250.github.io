/**
 * Chess.js
 * 
 * Implementación de un juego de ajedrez en Three.js con interacción básica.
 * 
 * @autor 
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera, mesa;
let cameraControls, effectController;
let chessBoard, selectedPiece = null;
let pieces = [];
let turn = 'white';
let whitePieces = 16;
let blackPieces = 16;

// Acciones
init();
loadScene();
setupGUI();
animate();

function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
    cameraControls = new OrbitControls(camera, renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff,2.5);
    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight2.position.set(0, 10, -10);
    directionalLight2.castShadow = true;
    scene.add(directionalLight2);
    //scene.add(new THREE.CameraHelper(directionalLight2.shadow.camera));
}

function loadScene() {
    const glloader = new GLTFLoader();
    
    //Mesa
    glloader.load('../models/pokemon/table/scene.gltf', function (gltf) {
        mesa = gltf.scene;
        mesa.position.set(0, -19.4, 0);

        mesa.scale.set(6, 6, 6);
        mesa.castShadow = true;
        mesa.receiveShadow = true;
        scene.add(mesa);
    }, undefined, function (error) {
        console.error(error);
    });

    // Tablero de ajedrez
    const boardTexture = new THREE.TextureLoader().load('../images/chess2.png'); // Reemplaza con la ruta de la textura del tablero
    const boardMaterial = new THREE.MeshPhongMaterial({ map: boardTexture, side: THREE.DoubleSide });
    const boardGeometry = new THREE.PlaneGeometry(16, 16);
    chessBoard = new THREE.Mesh(boardGeometry, boardMaterial);
    chessBoard.rotation.x = -Math.PI / 2;
    chessBoard.receiveShadow = true;
    scene.add(chessBoard);
    
    // Cargar modelos 
    

    // Función para cargar el fondo
    
        glloader.load('../models/pokemon/fondo/scene.gltf', function (gltf) {
            const fondo = gltf.scene;
            fondo.position.set(0, 0, 0);

            fondo.scale.set(1, 1, 1);
            fondo.castShadow = true;
            fondo.receiveShadow = true;
            scene.add(fondo);
        }, undefined, function (error) {
            console.error(error);
        });

    // Cargar modelos de piezas de ajedrez

    // Función para cargar una pieza
    function loadPiece(modelPath, position, color, scale, rotation) {
        glloader.load(modelPath, function (gltf) {
            const piece = gltf.scene;
            piece.position.set(position.x, position.y, position.z);
            //piece.userData = { color: color };
            piece.scale.set(scale.x, scale.y, scale.z);
            piece.rotateY(-rotation);
            piece.castShadow = true;
            piece.receiveShadow = true;

            pieces.push(piece);
            scene.add(piece);
        }, undefined, function (error) {
            console.error(error);
        });
    }

    // Posiciones iniciales de las piezas
    const initialPositions = [
        // Blancas
        { model: '../models/pokemon/snorlax/scene.gltf', position: { x: -7, y: 0, z: -6.1 }, color: 'white', scale:{x:0.5, y:0.5, z:0.5}, rotation: 0},
        { model: '../models/pokemon/ponyta/scene.gltf', position: { x: -5, y: 0, z: -7 }, color: 'white', scale:{x:0.008, y:0.008, z:0.008}, rotation: 0 },
        { model: '../models/pokemon/meowth/scene.gltf', position: { x: -3, y: 0, z: -7 }, color: 'white', scale:{x:0.5, y:0.5, z:0.5}, rotation: 0 },
        { model: '../models/pokemon/jynx/scene.gltf', position: { x: -1, y: 0, z: -7 }, color: 'white', scale:{x:0.5, y:0.5, z:0.5}, rotation: 0 },
        { model: '../models/pokemon/slowking/scene.gltf', position: { x: 1, y: 0, z: -7 }, color: 'white', scale:{x:1, y:1, z:1}, rotation: 0 },
        { model: '../models/pokemon/meowth/scene.gltf', position: { x: 3, y: 0, z: -7 }, color: 'white', scale:{x:0.5, y:0.5, z:0.5}, rotation: 0 },
        { model: '../models/pokemon/ponyta/scene.gltf', position: { x: 5, y: 0, z: -7 }, color: 'white', scale:{x:0.008, y:0.008, z:0.008}, rotation: 0 },
        { model: '../models/pokemon/snorlax/scene.gltf', position: { x: 7, y: 0, z: -6.1 }, color: 'white', scale:{x:0.5, y:0.5, z:0.5}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -7, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -5, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -3, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -1, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 1, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 3, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 5, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 7, y: 0.5, z: -5 }, color: 'white', scale:{x:0.1, y:0.1, z:0.1}, rotation: 0 },
        // Negras
        { model: '../models/pokemon/snorlax/scene.gltf', position: { x: -7, y: 0, z: 6.1 }, color: 'black', scale:{x:0.5, y:0.5, z:0.5}, rotation: Math.PI },
        { model: '../models/pokemon/ponyta/scene.gltf', position: { x: -5, y: 0, z: 7 }, color: 'black', scale:{x:0.008, y:0.008, z:0.008}, rotation: Math.PI },
        { model: '../models/pokemon/meowth/scene.gltf', position: { x: -3, y: 0, z: 7 }, color: 'black', scale:{x:0.5, y:0.5, z:0.5}, rotation: Math.PI },
        { model: '../models/pokemon/jynx/scene.gltf', position: { x: -1, y: 0, z: 7 }, color: 'black', scale:{x:0.5, y:0.5, z:0.5}, rotation: Math.PI },
        { model: '../models/pokemon/slowking/scene.gltf', position: { x: 1, y: 0, z: 7 }, color: 'black', scale:{x:1, y:1, z:1}, rotation: Math.PI },
        { model: '../models/pokemon/meowth/scene.gltf', position: { x: 3, y: 0, z: 7 }, color: 'black', scale:{x:0.5, y:0.5, z:0.5}, rotation: Math.PI },
        { model: '../models/pokemon/ponyta/scene.gltf', position: { x: 5, y: 0, z: 7 }, color: 'black', scale:{x:0.008, y:0.008, z:0.008}, rotation: Math.PI },
        { model: '../models/pokemon/snorlax/scene.gltf', position: { x: 7, y: 0, z: 6.1 }, color: 'black', scale:{x:0.5, y:0.5, z:0.5}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -7, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -5, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -3, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: -1, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 1, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 3, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 5, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI },
        { model: '../models/pokemon/magikarp/scene.gltf', position: { x: 7, y: 0.5, z: 5 }, color: 'black', scale:{x:0.1, y:0.1, z:0.1}, rotation: Math.PI }
    ];

    // Cargar todas las piezas
    initialPositions.forEach(pos => loadPiece(pos.model, pos.position, pos.color, pos.scale, pos.rotation));
}

function setupGUI() {
    // Definicion de los controles
    effectController = {
        turno: turn,
        blancasRestantes: whitePieces,
        negrasRestantes: blackPieces
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Estado del Juego");
    h.add(effectController, "turno").name("Turno");
    h.add(effectController, "blancasRestantes").name("Blancas Restantes");
    h.add(effectController, "negrasRestantes").name("Negras Restantes");
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Buscar colisión con piezas y tablero
    //const intersects = raycaster.intersectObjects(pieces.concat(chessBoard), true);
    const intersects = raycaster.intersectObjects(pieces, true);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        const selectedModel = intersected.parent; // Asegura que seleccionas toda la pieza

        if (selectedPiece) {
            // Si ya hay una pieza seleccionada, moverla al punto clicado en el tablero
            const newPosition = intersects[0].point;  // Obtener la nueva posición del clic
            newPosition.y = 0;  // Asegúrate de que la pieza se coloca sobre el tablero (y=0)

            // Animación con TWEEN para mover la pieza
            new TWEEN.Tween(selectedPiece.position)
                .to({ x: newPosition.x, y: 0, z: newPosition.z }, 500) // Movimiento suave
                .easing(TWEEN.Easing.Quadratic.InOut)  // Animación suave
                .onComplete(() => {
                    selectedPiece = null; // Restablece la pieza seleccionada
                    turn = (turn === 'white') ? 'black' : 'white';
                    effectController.turno = turn;
                })
                .start();
        }
    } else {
        // Si no hay pieza seleccionada, seleccionar esta pieza
        if (intersects.length > 0 && pieces.includes(selectedModel)) {
            selectedPiece = selectedModel;
            // Animación para levantar la pieza al seleccionarla
            new TWEEN.Tween(selectedPiece.position)
                .to({ y: 1 }, 500)  // Eleva la pieza
                .easing(TWEEN.Easing.Quadratic.InOut)  // Animación suave
                .start();
        }
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}