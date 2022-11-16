
import { Museo } from "./Museo";
import domIds from "./config/domIds";
import {JsonValidator} from "./JsonValidator";
const museo = Museo.Singleton();

function onWindowResize(e: UIEvent) {
  museo.Resize(e);
}

function onMouseMove(e: MouseEvent) {
  museo.onMouseMove(e);
}

const animate = () => {
  museo.Render();
  requestAnimationFrame(animate);
}

window.onload = () => {
  // get canvas
  const canvas = document.getElementById(domIds.canvasId) as HTMLCanvasElement;


  JsonValidator();
  museo.Inicializar(canvas);
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("mousemove", onMouseMove, false);
  
  animate();
};
