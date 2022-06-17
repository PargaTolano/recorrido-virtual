import { CuartoBase } from "../Cuarto/CuartoBase";
import { CuartoEventArguments, ICuartoEventListener, PausaMuseoEventArguments } from "./ICuartoEventListener";

export class CuartoEventSystem{
    //Singleton
    static instance: CuartoEventSystem;

    static Singleton() : CuartoEventSystem {
        this.instance = this.instance || new CuartoEventSystem();
        return this.instance;
    }

    private constructor(){
        this.listeners = new Array<ICuartoEventListener>();
    }

    // attributes
    private listeners: Array<ICuartoEventListener>;

    public AddListener(listener: ICuartoEventListener){
        this.listeners.push(listener);
    }

    public SendCuartoCambioEvent(origen:CuartoBase, destino:CuartoBase){
        const e : CuartoEventArguments = { origen, destino};
        for(const listener of this.listeners){
            listener.OnCuartoChange(e);
        }
    }

    public SendCuartoPausaEvent(cuarto: CuartoBase){
        const e : PausaMuseoEventArguments = {cuarto};
        for(const listener of this.listeners)
            listener.OnMuseoPausa(e);
    }

    public SendCuartoResumirEvent(cuarto: CuartoBase){
        const e : PausaMuseoEventArguments = {cuarto};
        for(const listener of this.listeners)
            listener.OnMuseoContinuar(e);
    }
}
