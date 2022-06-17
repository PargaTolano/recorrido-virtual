import { IExposicion } from "./IExposicion";

export abstract class ExposicionBase implements IExposicion{
    // atributos
    private abierto: Boolean;
    
    // metodos
    constructor(){
        this.abierto = false;
    }
    
    Abrir(): void {
        throw new Error("Method not implemented.");
    }
    Cerrar(): void {
        throw new Error("Method not implemented.");
    }
    Completar(): void {
        throw new Error("Method not implemented.");
    }
    HTML(): String {
        throw new Error("Method not implemented.");
    }
}