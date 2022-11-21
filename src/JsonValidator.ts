const Cuartos = require("./Cuarto/Cuartos.json");
import { TextureLoader } from "three";
/*Este archivo checa varias cosas:
    1.- Si los nombres que estan en las conexiones existen en los cuartos
    2.- Si las conexiones tienen nombre
    3.- Si las conexiones tienen posicion, sus coordenadas esten en minusculas con las letras correctas(x, y, z) y que no se repitan
    4.- Que los cuartos tengan almenos una conexión 
    5.- Que los fondos existan en la carpeta de Resources
    6.- Que las secciones que esten en las conexiones existan el el JSON
*/
export function JsonValidator() {

    try {
        console.log(`---------------------CUARTOS JSON DEBUG START---------------------`)
        console.time('CUARTOS JSON DEBUG TIME');

        let Nombres: Array<String> = [];
        let Secciones: Array<String> = [];

        //LLenamos el array de arriba con los nombres de cada cuarto
        Object.entries(Cuartos).forEach(([Seccion, valueSeccion], index) => {
            Secciones.push(Seccion);
            //@ts-ignore
            Object.entries(valueSeccion.Cuarto).forEach(([Cuarto, valueCuarto], index) => {
                Nombres.push(Cuarto);
            })
        });

        console.log(Secciones);
        Object.entries(Cuartos).forEach(([Seccion, valueSeccion], index) => {
            //@ts-ignore
            Object.entries(valueSeccion.Cuarto).forEach(([Cuarto, valueCuarto], index) => {
                //@ts-ignore
                const backgroundCheck = new TextureLoader().load(`../Resources/Backgrounds/${Seccion}/${valueCuarto.Fondo}`);
                let tieneConexiones: Boolean = true;
                //validamos si el cuarto tiene al menos una conexión
                //@ts-ignore
                if (valueCuarto.Conexiones === undefined || valueCuarto.Conexiones.length === 0 || Object.keys(valueCuarto.Conexiones[0]).length === 0 )
                    tieneConexiones = false;
                if (tieneConexiones) {
                    //@ts-ignore
                    for (let i = 0; i < valueCuarto.Conexiones.length; i++) {
                        //@ts-ignore
                        let ConexionActual = valueCuarto.Conexiones[i];
                        let isValidName: Boolean = false;
                        let isValidSeccion: Boolean = false;
                        let isPositionValid: Boolean = true;
                        let nameExists: Boolean = true;
                        let positionExists: Boolean = true;
                        //Se verifica si tienen el atributo "Nombre" o si esta vacio
                        if (ConexionActual.Nombre === undefined || ConexionActual.Nombre === '')
                            nameExists = false;
                        else {
                            //Verificamos que los nombres que aparecene en "Conexiones" sean los mismos
                            for (let j = 0; j < Nombres.length; j++) {
                                if (ConexionActual.Nombre === Nombres[j])
                                    isValidName = true;
                            }
                            if(isValidName){
                                for (let j = 0; j < Secciones.length; j++) {
                                    if (ConexionActual.Seccion === Secciones[j])
                                    isValidSeccion = true;
                                }
                            }
                        }
                        //Verificamos que la posicion de la conexión exista
                        const positionKeys = Object.keys(ConexionActual.Posicion);
                        if (ConexionActual.Posicion === undefined || positionKeys.length === 0) {
                            positionExists = false;
                        } else {
                            //Verificamos que la posicion de la conexión sea valida

                            let x, y, z;
                            x = y = z = 0;
                            for (let j = 0; j < positionKeys.length; j++) {
                                if (positionKeys[j] === "x")
                                    x++;
                                else if (positionKeys[j] === "y")
                                    y++;
                                else if (positionKeys[j] === "z")
                                    z++;
                            }
                            if (
                                positionKeys.length != 3
                                || x != 1 || y != 1 || z != 1 ||
                                !(ConexionActual.Posicion.x <= 16 && ConexionActual.Posicion.x >= -16) ||
                                !(ConexionActual.Posicion.y <= 16 && ConexionActual.Posicion.y >= -16) ||
                                !(ConexionActual.Posicion.z <= 16 && ConexionActual.Posicion.z >= -16)
                            )
                                isPositionValid = false;

                        }

                        if(!isValidSeccion){
                            console.error(`No se encontro la seccion de "${ConexionActual.Seccion}", instanciado en la seccion "${Seccion}" en el cuarto "${Cuarto}".`);

                        } else if (!nameExists) {
                            console.error(`En la seccion "${Seccion}" en el cuarto "${Cuarto}" hay una conexión que no tiene nombre.`);
                        } else if (!isValidName) {
                            console.error(`No se encontro el cuarto "${ConexionActual.Nombre}", instanciado en la seccion "${Seccion}" en el cuarto "${Cuarto}".`)
                        } else if (!positionExists) {
                            console.error(`En la seccion "${Seccion}" en el cuarto "${Cuarto}" la conexión "${ConexionActual.Nombre}" no tiene una posicion`)
                        } else if (!isPositionValid) {
                            console.error(`En la seccion "${Seccion}" en el cuarto "${Cuarto}", la conexión "${ConexionActual.Nombre}" tiene una posicion invalida`)
                        }
                    }
                } else {
                    console.error(`En la seccion "${Seccion}" en el cuarto "${Cuarto}" debe de haber por lo menos una conexión`);
                }

            })
        });
    } catch (err) {
        console.error(err);
    }
    console.timeEnd('CUARTOS JSON DEBUG TIME');
    console.log(`---------------------CUARTOS JSON DEBUG END---------------------`)
}