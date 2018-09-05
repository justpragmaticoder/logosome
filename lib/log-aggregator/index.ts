import * as ioClient from "socket.io-client";
import * as ioServer from "socket.io";

const serverPort: number = 8001;
const server = ioServer.listen(serverPort);

server.on("connection", socket => {
    const client = ioClient.connect("http://localhost:8000");

    client.on("message", msg => {
        console.info(msg.toString());
        socket.send(msg.toString());
    });
});