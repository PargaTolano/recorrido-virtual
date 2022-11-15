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
  DoubleSide,
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
} = require("../const.json");

const Seccion = require("./Cuarto/Cuartos.json");

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
  private raycastec: Raycaster;
  private cuartoActual: CuartoBase;
  private waypointsArray: Array<any> = [];
  private waypointHoverIndex: any;
  private canvas: HTMLCanvasElement;
  private targetList: Array<any> = [];
  private isMouseOverWaypoint: Boolean = false;
  private waypointAnimationState: Boolean = false;

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

    //Prueba de como seria un punto de cambio de camara.
    const waypointMeshCenter = new SphereGeometry(WaypointCenterRadius, 6, 10);
    const waypointMeshExterior = new SphereGeometry(WaypointExteriorRadius, 6, 10);

    const waypointTextureCenter = new MeshBasicMaterial({
      color: WaypointCenterColor,
      transparent: true,
      opacity: WaypointCenterOpacity,
    });
    const waypointTextureExterior = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: WaypointExteriorOpacity,
    });

    //Agarramos las conexiones de solo este cuarto
    const Conexiones = Seccion.Entremedio.Cuarto.EntradaComeSanoFisica.Conexiones;

    //Instanciamos los puntos de ida de el cuarto
    for (let i = 0; i < Conexiones.length; i++) {
      //Creamos los meshes con la geometria y el material ya creados
      const waypointCenter = new Mesh(waypointMeshCenter, waypointTextureCenter);
      const waypointExterior = new Mesh(waypointMeshExterior, waypointTextureExterior);
      waypointExterior.name = "waypoint";
      waypointExterior.add(waypointCenter);

      const posicion = Conexiones[i].Posicion;
      waypointExterior.position.set(posicion.x, posicion.y, posicion.z);

      const tempV = new Vector3();
      waypointExterior.updateWorldMatrix(true, false);
      waypointExterior.getWorldPosition(tempV);
      tempV.project(this.camera);

      let x = (tempV.x * .5 + .5) * canvas.clientWidth;
      let y = (tempV.y * -.5 + .5) * canvas.clientHeight;

      let elem = document.createElement('div');
      elem.textContent = Conexiones[i].Label;
      document.querySelector('#labels').appendChild(elem);
      elem.style.transform = `translate(-50%, -170%) translate(${x}px,${y}px)`;
      elem.style.opacity = '0';
      const waypoint = {
        "Index": i,
        "Nombre": Conexiones[i].Nombre,
        "Label": Conexiones[i].Label,
        "Descripcion": Conexiones[i].Descripcion,
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
    }


    this.setSkydome();
    this.initControls();
  }

  private updateLabels() {
    const tempV = new Vector3();
    for (let i = 0; i < this.targetList.length; i++) {
      const { object, elem } = this.targetList[i];
      object.updateWorldMatrix(true, false);
      object.getWorldPosition(tempV);

      tempV.project(this.camera);

      const x = (tempV.x * .5 + .5) * this.canvas.clientWidth;
      const y = (tempV.y * -.5 + .5) * this.canvas.clientHeight;
      elem.style.transform = `translate(-50%, -200%) translate(${x}px,${y}px)`;
    }
  }

  private setSkydome() {
    const SkydomeMesh = new SphereGeometry(17, 32, 32);
    const SkydomeTexture = new TextureLoader().load("../Resources/Backgrounds/Entremedios/EntradaComeSanoFisica.jpg");
    SkydomeTexture.wrapS = RepeatWrapping;
    SkydomeTexture.repeat.x = - 1;
    const SkydomeMaterial = new MeshBasicMaterial({
      map: SkydomeTexture,
      side: DoubleSide
    });
    const skydome = new Mesh(SkydomeMesh, SkydomeMaterial);
    this.scene.add(skydome);

  }

  private showWaypointInfo() {

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
      /*console.log(
        `Colision con el objeto: ${intersects[i].object.name} en x:${this.mouse.x} y:${this.mouse.y}`
      );*/
      if (intersects[i].object.name === "waypoint") {
        this.isMouseOverWaypoint = true;
        this.waypointHoverIndex = intersects[i].object.userData.waypoint.Index;
        intersects[i].object.userData.waypoint.ElementoDom.style.opacity = '1';
        if (!this.waypointAnimationState)
          intersects[i].object.userData.waypoint.AnimationIn.start();
      }
    }
  }

  private resetWaypoint() {
    const index = this.waypointHoverIndex;
    if (!this.isMouseOverWaypoint && this.waypointAnimationState) {
      if (index !== null)
        this.waypointsArray[index].AnimationOut.start();
      this.waypointHoverIndex = null;
      for (let i = 0; i < this.waypointsArray.length; i++) {
        this.waypointsArray[i].ElementoDom.style.opacity = '0';
      }
    }
    this.isMouseOverWaypoint = false;

  }

  private initControls() {
    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.panSpeed = 0;
    controls.rotateSpeed = -0.2;
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

  private CambiarCuarto() { }

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
