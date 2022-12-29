//import * as THREE from 'https://unpkg.com/three@0.113.2/build/three.module.js';

const width = window.innerWidth;
const height = window.innerHeight;
const $button = document.getElementById('startButton');

(async()=>{
    const isArSupported = navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    
    $button.disabled = !isArSupported;
    
    $button.addEventListener('click',onEnterAR);

    async function onEnterAR(){
        $button.style.display = 'none';
        
        const xrSession = await navigator.xr.requestSession('immersive-ar');
        
        const renderer = new THREE.WebGLRenderer({canvas: xrCanvas});
        renderer.autoClear = false;
        renderer.setSize(width,height);

        const gl = renderer.getContext();
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();

        scene.add(new THREE.GridHelper(100,100));

        const box = new THREE.Mesh(
            new THREE.BoxBufferGeometry(.2,.2,.2),
            new THREE.MeshNormalMaterial()
        );
        scene.add(box);
        
        const xrWebGLLayer = new XRWebGLLayer(xrSession, gl);
        xrSession.updateRenderState({baseLayer: xrWebGLLayer});

        const referenceSpace = await xrSession.requestReferenceSpace('local');

        xrSession.requestAnimationFrame(onDrawFrame);

        function onDrawFrame(timestamp, xrFrame){
            xrSession.requestAnimationFrame(onDrawFrame);
            const pose = xrFrame.getViewerPose(referenceSpace);

            gl.bindFramebuffer(gl.FRAMEBUFFER, xrWebGLLayer.framebuffer);
            if (!pose) return;

            pose.views.forEach((view)=>{
                const viewport = xrWebGLLayer.getViewport(view);
                renderer.setSize(viewport.width, viewport.height);

                camera.matrix.fromArray(view.transform.matrix);
                camera.projectionMatrix.fromArray(view.projectionMatrix);
                camera.updateMatrixWorld(true);

                renderer.clearDepth();
                renderer.render(scene, camera);
            });
        }
    }
})();