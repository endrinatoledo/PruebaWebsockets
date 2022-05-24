// importamos las librerías requeridas
const path = require("path");
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;

// Creamos el servidor de sockets y lo incorporamos al servidor de la aplicación
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// Especificamos el puerto en una varibale port, incorporamos cors, express 
// y la ruta a los archivo estáticos (la carpeta public)
app.set("port", 3000);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

function originIsAllowed(origin) {
    // Para evitar cualquier conexión no permitida, validamos que 
    // provenga de el cliente adecuado, en este caso del mismo servidor.
    if(origin === "http://localhost:3000"){
        return true;
    }
    return false;
}

let conn = null

// Cuando llega un request por sockets validamos el origen
// En caso de origen permitido, recibimos el mensaje y lo mandamos
// de regreso al cliente

wsServer.on("request", (request) =>{
    if (!originIsAllowed(request.origin)) {
        // Sólo se aceptan request de origenes permitidos
        request.reject();
        console.log((new Date()) + ' Conexión del origen ' + request.origin + ' rechazada.');
        return;
      }
    const connection = request.accept(null, request.origin);

    conn = connection
    connection.on("message", (message) => {
        console.log("Mensaje recibido: " + message.utf8Data);
        connection.sendUTF("Recibido: " + message.utf8Data);
    });
    connection.on("close", (reasonCode, description) => {
        console.log("El cliente se desconecto");
    });
});
let i = 1
setInterval(()=>{
    if(conn != null && conn.connected){
        conn.sendUTF("mensaje " + i + " del servidor")
        i++;
    }
},5000)

// Iniciamos el servidor en el puerto establecido por la variable port (3000)
server.listen(app.get('port'), () =>{
    console.log('Servidor iniciado en el puerto: ' + app.get('port'));
})