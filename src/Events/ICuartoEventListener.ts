import { CuartoBase } from "../Cuarto/CuartoBase";

export type CuartoEventArguments = {
    origen:     CuartoBase,
    destino:    CuartoBase,
}

export type PausaMuseoEventArguments={
    cuarto: CuartoBase
}

export interface ICuartoEventListener {
    OnCuartoChange(e: CuartoEventArguments): void;
    OnMuseoPausa(e: PausaMuseoEventArguments): void;
    OnMuseoContinuar(e: PausaMuseoEventArguments): void;
}
