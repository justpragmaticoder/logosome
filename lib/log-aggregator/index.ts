// Makes a client connection to the socket.io server
import * as socketClient from "socket.io-client";
import * as io from "socket.io";

// Port for the socket server
const serverPort: number = 8001;
const server: io.Server = io.listen(serverPort);
// Log-receiver service address for sockets connection
const logReceiver: string = "http://localhost:8000";

server.on("connection", socket => {
    // Connects to the log-receiver service and gets ready to receive logs
    const client: socketClient.Client = socketClient.connect(logReceiver);

    client.on("message", msg => {
        console.info(msg.toString());
        //Sends received logs from log-receiver service to the front-end
        socket.send(msg.toString());
    });
});