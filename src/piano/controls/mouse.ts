import { piano } from './../active-piano-handler';
import { Raycaster, Vector2 } from "three";
import { camera } from "../../core/camera";
import { PianoKey } from '../piano-key';
import { scene } from "../../scene/scene";
import { pressKey, releaseKey } from './controller';

const raycaster = new Raycaster();
const pointer = new Vector2();

let selected: PianoKey | undefined = undefined;
let isMouseDown = false;

const handleMove = (e: MouseEvent) => {
    if (!isMouseDown) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        let intersected = intersects[0].object
        const keyBeingHovered = piano.keys.find(k => k.uuid === intersected.uuid);
        if (selected !== keyBeingHovered) releaseKey(selected);
        pressKey(keyBeingHovered);
        selected = keyBeingHovered
    } else {
        releaseKey(selected)
        selected = undefined
    }
}

const handleMouseDown = (e: MouseEvent) => {
    isMouseDown = true;
    handleMove(e); // Trigger event again
}

const handleMouseUp = () => {
    isMouseDown = false;
    releaseKey(selected)
    selected = undefined
}

window.addEventListener('mousemove', handleMove);
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
