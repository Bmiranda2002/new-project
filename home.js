import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { USDZLoader } from "three/addons/loaders/USDZLoader.js";

const counterElement = document.querySelector("#counter");
const visitCount = Number(localStorage.getItem("visitCount") || "0") + 1;
localStorage.setItem("visitCount", String(visitCount));
if (counterElement) counterElement.textContent = String(visitCount).padStart(6, "0");

const container = document.querySelector("#mord-3d-view");
const status = document.querySelector("#model-status");
const socialButtons = document.querySelectorAll(".social-icon");

socialButtons.forEach((button) => {
  const img = button.querySelector("img");
  if (!img) return;

  const defaultSrc = img.dataset.default;
  const pressedSrc = img.dataset.pressed;
  if (!defaultSrc || !pressedSrc) return;

  const setDefault = () => {
    img.src = defaultSrc;
  };

  const setPressed = () => {
    img.src = pressedSrc;
  };

  button.addEventListener("pointerdown", setPressed);
  button.addEventListener("pointerup", () => {
    setTimeout(setDefault, 120);
  });
  button.addEventListener("pointercancel", setDefault);
  button.addEventListener("pointerleave", setDefault);
});

if (!container) {
  if (status) status.textContent = "3D container missing on this page.";
} else {
  try {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.3, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2.5, 5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x89b8ff, 0.8);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.7;
    controls.minDistance = 2.2;
    controls.maxDistance = 14;

    const fitAndAddModel = (model) => {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const largest = Math.max(size.x, size.y, size.z) || 1;

      model.position.sub(center);
      model.scale.setScalar(1.25 / largest);
      scene.add(model);
    };

    const loadUsdzFallback = () => {
      const usdzLoader = new USDZLoader();
      usdzLoader.load(
        "images/mordi-3d.usdz",
        (usdzModel) => {
          fitAndAddModel(usdzModel);
          if (status) status.textContent = "mordi-3d.usdz loaded. Drag to rotate.";
        },
        undefined,
        () => {
          if (status) {
            status.innerHTML =
              "Could not render 3D model in this browser. Open <a href='mordi-3d.usdz'>mordi-3d.usdz</a>.";
          }
        }
      );
    };

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "mordi-3d.glb",
      (gltf) => {
        const model = gltf.scene;
        fitAndAddModel(model);
        if (status) status.textContent = "mordi-3d.glb loaded. Drag to rotate.";
      },
      undefined,
      () => {
        if (status) status.textContent = "GLB load failed, trying USDZ fallback...";
        loadUsdzFallback();
      }
    );

    function onResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("resize", onResize);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  } catch (error) {
    if (status) {
      status.innerHTML = "3D initialization failed in Chrome. Open <a href='mordi-3d.usdz'>mordi-3d.usdz</a> directly.";
    }
    console.error(error);
  }
}
