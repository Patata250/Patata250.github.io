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
let chessBoard;
let pieces = [];
let turn = 'white';
let whitePieces = 16;
let blackPieces = 16;
let selectedObject = undefined; 
let audio, listener;



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
    cameraControls = new OrbitControls(camera, renderer.domElement);
    camera.lookAt(0, 0, 0);

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

    window.addEventListener('resize', updateAspectRatio);
    renderer.domElement.addEventListener('click', click);
}



function loadScene() {
    const glloader = new GLTFLoader();
    let cont = 0;

    //Musica
    listener = new THREE.AudioListener();
    scene.add(listener);

    audio = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    audioLoader.load('../images/musicapokemon.mp3', function(buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.5);
        audio.play();
    });
    
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
    chessBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 0.1, 1), boardMaterial);
    chessBoard.rotation.x = -Math.PI / 2;
    chessBoard.receiveShadow = true;
    chessBoard.position.set(0, -0.15, 0);
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
            piece.name = modelPath + cont;
            pieces.push(piece);
            scene.add(piece);
            cont ++;
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
    const gui = new GUI();
    
    const controls = {
        pauseMusic: () => {
            if (audio && audio.isPlaying) {
                audio.pause();
            }
        },
        playMusic: () => {
            if (audio && !audio.isPlaying) {
                audio.play();
            }
        },
        volume:0.5
    };

    gui.add(controls, 'pauseMusic').name('Pausar música');
    gui.add(controls, 'playMusic').name('Reproducir música');
    gui.add(controls, 'volume', 0, 1).name('Volumen').onChange(value => {
        if (audio) {
            audio.setVolume(value);
        }
    });
}

function click(event) {
    let x = event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = - ( y / window.innerHeight ) * 2 + 1;

    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = ray.intersectObjects(pieces, true);
    const intersectsTablero = ray.intersectObject(chessBoard);

    if (selectedObject == undefined) {
        if (intersects.length > 0) {
            selectedObject = intersects[0].object;
            while (selectedObject.parent && selectedObject.name.substring(0,17) !== '../models/pokemon') {
                selectedObject = selectedObject.parent;
            }  

            //selectedObject = selectedObject.parent;
            const pkm = scene.getObjectByName(selectedObject.name);
            new TWEEN.Tween(pkm.position)
            .to({ y: pkm.position.y + 1 }, 1000 )
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }
    } 
    else {
        let secondObject;
        if (intersects.length > 0) {
            secondObject = intersects[0].object;
            const pkm = scene.getObjectByName(selectedObject.name);
            while (secondObject.parent && secondObject.name.substring(0,17) !== '../models/pokemon') {
                secondObject = secondObject.parent;
            }  

            let newx = secondObject.position.x;
            let newz = secondObject.position.z;

            new TWEEN.Tween(pkm.position)
            .to({x:[newx, newx], y:[0.1, 0], z:[newz, newz]}, 1000 )
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

            new TWEEN.Tween(secondObject.position)
            .to({x:[newx, newx], y:[-5, -5], z:[newz,newz]}, 1000 )
            .interpolation(TWEEN.Interpolation.Bezier)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .delay(600)
            .start();

            selectedObject = undefined;

        } 
        else {
            if (intersectsTablero.length > 0) {
                let point = intersectsTablero[0].point;
                let newx = point.x;
                let newz = point.z;
                
                const pkm = scene.getObjectByName(selectedObject.name);
                new TWEEN.Tween(pkm.position)
                .to({x:[newx, newx], y:[0, 0], z:[newz, newz]}, 1000 )
                .interpolation(TWEEN.Interpolation.CatmullRom)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                selectedObject = undefined;
            }
        }
    }
}


function updateAspectRatio() {
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
}