# Recorrido Virtual Museo

## Live server

La carpeta de dist recibira constantemente el bundle de la aplicacion, pero no sera servida automaticamente, es recomendado usar live server y correr desde la carpeta dist si es posible, asi cada cambio a la aplicacion se reflejara automaticamente en tu navegador.

## Compilar bundle una sola vez

```
  npm run build
```

## Correr ambiente de desarollo observando campos

```
  npm run dev
```

## JSON de cuartos

  El json de cuartoss esta separado por secciones, que a su vez tienen un objeto llamado cuarto cada uno, el cual tiene los cuartos. A continuacion se intenta explicar la estructura del JSON. Tambien para ayudar hicimos un algoritmo que checa dicha estructura del JSON e imprime en la consola los errores que encontro(```JSONValidator.js```), no es perfecto pero de algo servira.

- Secciones en el JSON

  Las secciones en el JSON tienen que tener el mismo nombre que una de las carpetas de ```.\Resources\Backgrounds```, ya que el programa usa e nombre de la sección para obtener la imagen de fondo. Todas las secciones tienen un objeto llamado cuarto, es obligatorio por si quieren agregar otra sección.

- Cuartos en el JSON 

  Los cuartos deben de esatr dentro del objeto ```Cuarto```, deben de tener un nombre diferente a cada uno en su propia sección cada uno de los cuartos debe contar con 2 campos  obligatorios:
    - ```Fondo```: Aqui se debe de guardar el nombre de la imagen que se va a usar de fondo con ese cuarto, incluyendo la extensión.
    - ```Conexiones```: Este es un arreglo de los puntos que van a apararecer en el recorrido, es un arreglo de objetos y cada uno de estos tiene la siguiente info, la cual todos son obligatorios:
        - ```Nombre```: Este nombre debe de ser igual al nombre del cuarto al que va a dirigir, por ejemplo si al hacer click al punto tiene nombre de "Estacionamiento", debe de haber un cuarto llamado "Estacionamiento" (Las mayus importan).
        - ```Seccion```: Este debe llevar el nombre de la sección en la que se encuentra el cuarto que va a dirigir, por ejemplo en el caso de "Estacionamiento", este esta en la sección de "Entremedios", por lo tanto este es el nombre que debe de llevar.
        - ```Label```: Este es obligatorio ponerlo pero no es obligatorio que tenga algo, aqui se pone un breve mensaje que aparecera arriba del punto en el recorrido al poner el mouse en el punto, si no se quiere que ponga ningun mensaje solo dejelo con un string vacio ( "" ).
        - ```Posicion```: Este campo determina la posicion en la que aparecera el punto, para calcular la posicion en la que debe de estar, se tiene que imaginar una circunferencia de 16 u de radio, la cual sus puntos son los posibles lugares donde se pueden poner los puntos. Para saber el punto se puede ir a geogebra y calcularlo con ```eq1: x² + y² = 256```, se va a dibujar una circunferencia, de ahi puede ir a la sección de herramientas y elejir la que dice punto, lo ponen en la circunferencia y solito se pega en esta. Esto se hace para lograr una consistencia en el tamaño de las esferas. Hlablando del eje Y a diferencia no es notoria si cambian poco ese valor  
        
