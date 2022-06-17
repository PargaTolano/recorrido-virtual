import { ExposicionBase } from "../Exposicion/ExposicionBase";
import { ICuarto } from "./ICuarto";

export class CuartoBase implements ICuarto {
    
    private exposiciones: Array<ExposicionBase>;

    constructor(){
        this.exposiciones = new Array<ExposicionBase>();
    }

    Incializar(): void{
        throw new Error("Method not implemented.");
    }
    Finalizar(): void {
        throw new Error("Method not implemented.");
    }
    Actualizar(delta: number): void {
        throw new Error("Method not implemented.");
    }
    Renderizar(): void {
        throw new Error("Method not implemented.");
    }
       
}
