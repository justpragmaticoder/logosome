import * as express from 'express';
import * as httpModule from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
// Makes a client connection to the socket.io server
import * as ioClient from "socket.io-client";

const app: express.Application = express();
const http = httpModule.createServer(app);
const io: socketIo.Server = socketIo(http);
// Port for the http server
const port: string | number = process.env.PORT || 3000;
// Log-aggregator service address for sockets connection
const logAggregator: string = "http://localhost:8001";

io.on("connection", socket => {
    // Connects to the log-aggregator service and gets ready to receive logs
    const client: ioClient.Client = ioClient.connect(logAggregator);

    client.on("message", msg => {
        console.info(msg.toString());
        //Sends received logs from log-aggregator service to the web-page
        socket.send(msg.toString());
    });
});

// Serves static files
app.use(express.static(path.join(path.join(__dirname, '../../public'))));

// Default (homepage) route
app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../../public/', '.index.html'));
});

// Starts the HTTP server and listens to its port
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});