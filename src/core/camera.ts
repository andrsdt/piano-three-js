import { OrthographicCamera, PerspectiveCamera } from "three";
import { piano } from "../piano/piano";

const VERTICAL_FIELD_OF_VIEW = 45; // Normal

export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const aspectRatio = sizes.width / sizes.height;

const perspectiveCameraTop = new PerspectiveCamera(
    VERTICAL_FIELD_OF_VIEW,
    aspectRatio
)
perspectiveCameraTop.position.set(0, 90, 60)
perspectiveCameraTop.lookAt(piano.getCenterPosition());
perspectiveCameraTop.rotateZ(Math.PI / 2)

const perspectiveCameraTilted = new PerspectiveCamera(
    VERTICAL_FIELD_OF_VIEW,
    aspectRatio
)
perspectiveCameraTilted.position.set(-95, 80, 100)
perspectiveCameraTilted.rotation.set(-Math.PI / 2, -.9, -Math.PI / 2)

const viewSize = 100;
const ortographicCamera = new OrthographicCamera(
    -aspectRatio * viewSize / 2,
    aspectRatio * viewSize / 2,
    viewSize / 2,
    -viewSize / 2,
)
ortographicCamera.position.set(0, 220, 40)
ortographicCamera.lookAt(piano.getCenterPosition());
ortographicCamera.rotateZ(Math.PI / 2)

const cameras = { perspectiveCameraTop, perspectiveCameraTilted, ortographicCamera }
export const camera = cameras.perspectiveCameraTilted

window.addEventListener('resize', () => {
    // camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
})
