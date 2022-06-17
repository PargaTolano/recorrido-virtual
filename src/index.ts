import { Museo } from "./Museo";
import domIds from "./config/domIds";

const museo = Museo.Singleton();

function onWindowResize(e: UIEvent){
    museo.Resize(e);
}

function animate(){
    museo.Render();
    requestAnimationFrame(animate);
}

window.onload = ()=>{
    // get canvas
    const canvas =
        document.getElementById(domIds.canvasId) as HTMLCanvasElement;
    
    museo.Inicializar(canvas);
    window.addEventListener('resize', onWindowResize, false);
    animate();
};