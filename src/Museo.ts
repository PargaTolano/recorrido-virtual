import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  RepeatWrapping,
  Vector2,
  Raycaster,
  Vector3,
  Object3D,
  BackSide,
} from "three";
import { Tween, update, Easing } from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CuartoBase } from "./Cuarto/CuartoBase";
import { CuartoEventSystem } from "./Events/CuartoEventSystem";
import {
  CuartoEventArguments,
  ICuartoEventListener,
  PausaMuseoEventArguments,
} from "./Events/ICuartoEventListener";
const {
  WaypointExteriorRadius,
  WaypointCenterRadius,
  WaypointCenterOpacity,
  WaypointExteriorOpacity,
  WaypointCenterColor,
  WaypointExteriorColor,
  ExpositionWaypointCenterColor,
  ExpositionWaypointExteriorColor
} = require("../const.json");
const Secciones = require("./Cuarto/Cuartos.json");

export class Museo implements ICuartoEventListener {
  // Singleton Stuff
  private static instance: Museo;

  static Singleton() {
    Museo.instance = Museo.instance || new Museo();
    return Museo.instance;
  }

  private constructor() {
    this.cuartos = new Array<CuartoBase>();
    CuartoEventSystem.Singleton().AddListener(this);
  }

  // atributos
  private cuartos: Array<CuartoBase>;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private mouse: Vector2;
  private fondoActual: MeshBasicMaterial;
  private raycastec: Raycaster;
  private waypointsArray: Array<any> = [];
  private waypointHoverIndex: any;
  private canvas: HTMLCanvasElement;
  private targetList: Array<any> = [];
  private isMouseOverWaypoint: Boolean = false;
  private waypointAnimationState: Boolean = false;

  private skydome: Mesh;
  private waypointMeshCenter: SphereGeometry;
  private waypointMeshExterior: SphereGeometry;
  private waypointTextureCenter: MeshBasicMaterial;
  private expositionWaypointTextureCenter: MeshBasicMaterial;
  private waypointTextureExterior: MeshBasicMaterial;
  private expositionWaypointTextureExterior: MeshBasicMaterial;


  //metodos
  public Inicializar(canvas: HTMLCanvasElement) {

    this.canvas = canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.renderer = new WebGLRenderer({ canvas });
    this.renderer.setClearColor(0x333333);
    this.renderer.clear();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.z = 0.00001;
    this.mouse = new Vector2();
    this.raycastec = new Raycaster();

    //Intanciamos la geometria que vamos a usar
    const SkydomeMesh = new SphereGeometry(17, 32, 32);
    this.fondoActual = new MeshBasicMaterial({
      color: 0xffffff,
      side: BackSide
    });

    this.waypointMeshCenter = new SphereGeometry(WaypointCenterRadius, 10, 10);
    this.waypointMeshExterior = new SphereGeometry(WaypointExteriorRadius, 10, 10);
    this.waypointTextureCenter = new MeshBasicMaterial({
      color: WaypointCenterColor,
      transparent: true,
      opacity: WaypointCenterOpacity,
    });
    this.waypointTextureExterior = new MeshBasicMaterial({
      color: WaypointExteriorColor,
      transparent: true,
      opacity: WaypointExteriorOpacity,
    });

    this.expositionWaypointTextureCenter = new MeshBasicMaterial({
      color: ExpositionWaypointCenterColor,
      transparent: true,
      opacity: WaypointCenterOpacity,
    });
    this.expositionWaypointTextureExterior = new MeshBasicMaterial({
      color: ExpositionWaypointExteriorColor,
      transparent: true,
      opacity: WaypointExteriorOpacity,
    });


    this.skydome = new Mesh(SkydomeMesh, this.fondoActual);
    this.scene.add(this.skydome);

    //Le pasamos la seccion y el cuarto que vamos a instanciar
    this.setScene("FisicaYAstronomia", "FisicaYAStronomiaZonaOptica2");

    //Inicio de controladores
    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.panSpeed = 0;
    controls.rotateSpeed = -0.2;

  }

  private updateLabels() {
    const tempV = new Vector3();
    for (let i = 0; i < this.targetList.length; i++) {

      const { object, elem } = this.targetList[i];
      if (elem !== undefined) {
        object.updateWorldMatrix(true, false);
        object.getWorldPosition(tempV);
  
        tempV.project(this.camera);
  
        const x = (tempV.x * .5 + .5) * this.canvas.clientWidth;
        const y = (tempV.y * -.5 + .5) * this.canvas.clientHeight;
        elem.style.transform = `translate(-50%, -200%) translate(${x}px,${y}px)`;
      }

      
    }
  }

  private setScene(Seccion: any, Cuarto: any) {

    //Eliminamos los anteriores Waypoints y Meshes de la escena
    for (let i = 0; i < this.targetList.length; i++) {
      this.scene.remove(this.targetList[i].object);
      if (this.targetList[i].elem !== undefined) {
        this.targetList[i].elem.remove();
      }
    }

    //Vaciamos los arrays
    this.targetList = [];
    this.waypointsArray = [];

    //Agarramos el cuarto del JSON y sacamos sus conexiones con otros cuartos, exposiciones y el fondo. 
    const CuartoActual = Secciones[Seccion].Cuarto[Cuarto]
    const Conexiones = CuartoActual.Conexiones;
    const Exposiciones = CuartoActual.Exposiciones;
    const Fondo = CuartoActual.Fondo;
    let globalIndex = 0;

    //Instanciamos los puntos de ida de el cuarto
    for (let i = 0; i < Conexiones.length; i++) {

      //Creamos los meshes con la geometria y el material ya creados
      const waypointCenter = new Mesh(this.waypointMeshCenter, this.waypointTextureCenter);
      const waypointExterior = new Mesh(this.waypointMeshExterior, this.waypointTextureExterior);

      //Hacemos que su nombre sea waypoint      
      waypointExterior.name = "waypoint";

      //Hacemos waypoint exerior padre de waypoint center
      waypointExterior.add(waypointCenter);

      //Lo ponemos en la posicion 
      const posicion = Conexiones[i].Posicion;
      waypointExterior.position.set(posicion.x, posicion.y, posicion.z);

      //Si tiene label se calcula su posicion en la pantalla
      const tempV = new Vector3();
      waypointExterior.updateWorldMatrix(true, false);
      waypointExterior.getWorldPosition(tempV);
      tempV.project(this.camera);
      let x = (tempV.x * .5 + .5) * this.canvas.clientWidth;
      let y = (tempV.y * -.5 + .5) * this.canvas.clientHeight;

      //Y le hacemos su elemento div con su label
      let elem: any;
      if (Conexiones[i].Label != "") {
        elem = document.createElement('div');
        elem.textContent = Conexiones[i].Label;
        document.querySelector('#labels').appendChild(elem);
        elem.style.transform = `translate(-50%, -170%) translate(${x}px,${y}px)`;
        elem.style.opacity = '0';
      }

      //Guardamos info en un objeto waypoint
      const waypoint = {
        "Index": i,
        "Seccion": Conexiones[i].Seccion,
        "Nombre": Conexiones[i].Nombre,
        "Label": Conexiones[i].Label,
        "ElementoDom": elem,
        "AnimationIn": new Tween({ Ex: 1, Ey: 1, Ez: 1, Cx: 1, Cy: 1, Cz: 1, })
          .to({ Ex: 1.1, Ey: 1.1, Ez: 1.1, Cx: 0.7, Cy: 0.7, Cz: 0.7 }, 320)
          .onUpdate((anim) => {
            waypointExterior.scale.set(anim.Ex, anim.Ey, anim.Ez);
            waypointCenter.scale.set(anim.Cx, anim.Cy, anim.Cz);
          })
          .repeat(0)
          .easing(Easing.Exponential.Out)
          .onStart(() => {
            this.waypointAnimationState = true;
          }),
        "AnimationOut": new Tween({ Ex: 1.1, Ey: 1.1, Ez: 1.1, Cx: 0.7, Cy: 0.7, Cz: 0.7, })
          .to({ Ex: 1, Ey: 1, Ez: 1, Cx: 1, Cy: 1, Cz: 1, }, 320)
          .onUpdate((anim) => {
            waypointExterior.scale.set(anim.Ex, anim.Ey, anim.Ez);
            waypointCenter.scale.set(anim.Cx, anim.Cy, anim.Cz);
          })
          .repeat(0)
          .easing(Easing.Exponential.Out)
          .onStart(() => {
            this.waypointAnimationState = false;
          })
      }

      //y lo guardamos en el mesh
      waypointExterior.userData.waypoint = waypoint;
      const waypointInfo = {
        "object": waypointExterior,
        "elem": elem
      }

      //los agregamos a los arreglos
      this.targetList.push(waypointInfo);
      this.waypointsArray.push(waypoint);
      this.scene.add(waypointExterior);
      globalIndex = i;

    }
    globalIndex++;
    if (Exposiciones !== undefined && Exposiciones.length != 0) {
      for (let i = 0; i < Exposiciones.length; i++) {

        const waypointCenter = new Mesh(this.waypointMeshCenter, this.expositionWaypointTextureCenter);
        const waypointExterior = new Mesh(this.waypointMeshExterior, this.expositionWaypointTextureExterior);

        //Hacemos que su nombre sea waypoint      
        waypointExterior.name = "exposition";

        //Hacemos waypoint exerior padre de waypoint center
        waypointExterior.add(waypointCenter);
        const posicion = Exposiciones[i].Posicion;
        waypointExterior.position.set(posicion.x, posicion.y, posicion.z);

        //Si tiene label se calcula su posicion en la pantalla
        const tempV = new Vector3();
        waypointExterior.updateWorldMatrix(true, false);
        waypointExterior.getWorldPosition(tempV);
        tempV.project(this.camera);
        let x = (tempV.x * .5 + .5) * this.canvas.clientWidth;
        let y = (tempV.y * -.5 + .5) * this.canvas.clientHeight;

        //Y le hacemos su elemento div con su label
        let elem: any;
        if (Exposiciones[i].Label != "") {
          elem = document.createElement('div');
          elem.textContent = Exposiciones[i].Label;
          document.querySelector('#labels').appendChild(elem);
          elem.style.transform = `translate(-50%, -170%) translate(${x}px,${y}px)`;
          elem.style.opacity = '0';
        }


        const waypoint = {
          "Index": globalIndex,
          "Nombre": Exposiciones[i].Nombre,
          "Label": Exposiciones[i].Label,
          "ElementoDom": elem,
          "AnimationIn": new Tween({ Ex: 1, Ey: 1, Ez: 1, Cx: 1, Cy: 1, Cz: 1, })
            .to({ Ex: 1.1, Ey: 1.1, Ez: 1.1, Cx: 0.7, Cy: 0.7, Cz: 0.7 }, 320)
            .onUpdate((anim) => {
              waypointExterior.scale.set(anim.Ex, anim.Ey, anim.Ez);
              waypointCenter.scale.set(anim.Cx, anim.Cy, anim.Cz);
            })
            .repeat(0)
            .easing(Easing.Exponential.Out)
            .onStart(() => {
              this.waypointAnimationState = true;
            }),
          "AnimationOut": new Tween({ Ex: 1.1, Ey: 1.1, Ez: 1.1, Cx: 0.7, Cy: 0.7, Cz: 0.7, })
            .to({ Ex: 1, Ey: 1, Ez: 1, Cx: 1, Cy: 1, Cz: 1, }, 320)
            .onUpdate((anim) => {
              waypointExterior.scale.set(anim.Ex, anim.Ey, anim.Ez);
              waypointCenter.scale.set(anim.Cx, anim.Cy, anim.Cz);
            })
            .repeat(0)
            .easing(Easing.Exponential.Out)
            .onStart(() => {
              this.waypointAnimationState = false;
            })
        }

        waypointExterior.userData.waypoint = waypoint;
        const waypointInfo = {
          "object": waypointExterior,
          "elem": elem
        }

        this.targetList.push(waypointInfo);
        this.waypointsArray.push(waypoint);
        this.scene.add(waypointExterior);
        globalIndex++;

      }
    }

    //Ponemos el fondo
    const SkydomeTexture = new TextureLoader().load(`../Resources/Backgrounds/${Seccion}/${Fondo}`);
    SkydomeTexture.wrapS = RepeatWrapping;
    SkydomeTexture.repeat.x = - 1;
    this.fondoActual.map = SkydomeTexture;
  }


  public onMouseClick(e: MouseEvent) {
    this.raycastec.setFromCamera(this.mouse, this.camera);
    const intersects: any = this.raycastec.intersectObjects(this.scene.children);
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === "waypoint") {
        this.CambiarCuarto(intersects[i].object);
      }
    }
  }

  public onMouseMove(e: MouseEvent) {
    //Los calculos dependen del tamaño del canvas, en este caso es del tamaño de toda la ventana interior
    this.mouse.setX((e.clientX / window.innerWidth) * 2 - 1);
    this.mouse.setY(-(e.clientY / window.innerHeight) * 2 + 1);
  }

  private waypointCollision() {
    this.raycastec.setFromCamera(this.mouse, this.camera);
    const intersects: any = this.raycastec.intersectObjects(
      this.scene.children
    );
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === "waypoint" || intersects[i].object.name === "exposition") {
        this.isMouseOverWaypoint = true;
        this.waypointHoverIndex = intersects[i].object.userData.waypoint.Index;
        if (intersects[i].object.userData.waypoint.ElementoDom != undefined)
          intersects[i].object.userData.waypoint.ElementoDom.style.opacity = '1';
        if (!this.waypointAnimationState)
          intersects[i].object.userData.waypoint.AnimationIn.start();
      }
    }
  }

  private resetWaypoint() {
    const index = this.waypointHoverIndex;
    if (!this.isMouseOverWaypoint && this.waypointAnimationState) {
      if (index !== null && this.waypointsArray[index]) {
        this.waypointsArray[index].AnimationOut.start();
      }
      this.waypointHoverIndex = null;
      for (let i = 0; i < this.waypointsArray.length; i++) {
        if (this.waypointsArray[i].ElementoDom !== undefined){
          this.waypointsArray[i].ElementoDom.style.opacity = '0';
        }        
      }
    }
    this.isMouseOverWaypoint = false;
  }

  public Finalizar() { }

  public Resize(e: UIEvent) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.Render();
  }

  public Render() {
    this.updateLabels();
    this.waypointCollision();
    this.resetWaypoint();
    update();
    this.renderer.render(this.scene, this.camera);
  }

  private Actualizar() {
    for (const cuarto of this.cuartos) cuarto.Actualizar(0.01);
  }

  private CambiarCuarto(object: Object3D) {
    var Seccion = object.userData.waypoint.Seccion;
    const Cuarto = object.userData.waypoint.Nombre;
    this.setScene(Seccion, Cuarto);
  }

  // ICuartoEventListener
  OnCuartoChange(e: CuartoEventArguments): void {
    throw new Error("Method not implemented.");
  }

  OnMuseoPausa(e: PausaMuseoEventArguments): void {
    throw new Error("Method not implemented.");
  }

  OnMuseoContinuar(e: PausaMuseoEventArguments): void {
    throw new Error("Method not implemented.");
  }
}
