import { 
    PerspectiveCamera, 
    Scene, 
    WebGLRenderer 
} from "three";
import { CuartoBase } from "./Cuarto/CuartoBase";
import { CuartoEventSystem } from "./Events/CuartoEventSystem";
import { 
    CuartoEventArguments, 
    ICuartoEventListener, 
    PausaMuseoEventArguments 
} from "./Events/ICuartoEventListener";

export class Museo implements ICuartoEventListener{

    // Singleton Stuff
    private static instance : Museo;

    static Singleton(){
        Museo.instance = Museo.instance || new Museo();
        return Museo.instance;
    }

    private constructor(){
        this.cuartos= new Array<CuartoBase>();
        CuartoEventSystem.Singleton().AddListener(this);
    }
    
    // atributos  
    private cuartos: Array<CuartoBase>;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;

    //metodos
    public Inicializar(canvas: HTMLCanvasElement){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.renderer = new WebGLRenderer({canvas});
        this.renderer.setClearColor(0x333333);
        this.renderer.clear();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
    }

    public Finalizar(){}

    public Resize(e: UIEvent){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.Render();
    }

    public Render(){
        this.renderer
            .render(this.scene, this.camera);
    }

    private Actualizar(){
        for(const cuarto of this.cuartos)
            cuarto.Actualizar(0.01);
    }

    private CambiarCuarto(){}

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
