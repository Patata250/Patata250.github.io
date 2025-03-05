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
let renderer, scene, camera;
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
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraControls = new OrbitControls(camera, renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function loadScene() {
    // Tablero de ajedrez
    const boardTexture = new THREE.TextureLoader().load('../images/chess2.png'); // Reemplaza con la ruta de la textura del tablero
    const boardMaterial = new THREE.MeshBasicMaterial({ map: boardTexture });
    const boardGeometry = new THREE.PlaneGeometry(16, 16);
    chessBoard = new THREE.Mesh(boardGeometry, boardMaterial);
    chessBoard.rotation.x = -Math.PI / 2;
    scene.add(chessBoard);

    // Cargar modelos de piezas de ajedrez
    const glloader = new GLTFLoader();

    // Función para cargar una pieza
    function loadPiece(modelPath, position, color, scale, rotation) {
        glloader.load(modelPath, function (gltf) {
            const piece = gltf.scene;
            piece.position.set(position.x, position.y, position.z);
            piece.userData = { color: color };
            piece.scale.set(scale.x, scale.y, scale.z);
            piece.rotateY(-rotation);

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

    const intersects = raycaster.intersectObjects(pieces, true);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;

        if (selectedPiece) {
            // Mover la pieza seleccionada
            selectedPiece.position.set(intersected.position.x, intersected.position.y, intersected.position.z);
            selectedPiece = null;
            turn = (turn === 'white') ? 'black' : 'white';
            effectController.turno = turn;
        } else {
            // Seleccionar una pieza
            selectedPiece = intersected;
            selectedPiece.position.y += 1; // Elevar la pieza seleccionada
        }
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}