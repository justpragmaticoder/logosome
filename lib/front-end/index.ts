import * as express from 'express';
import * as httpModule from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
import * as ioClient from "socket.io-client";

const app: express.Application = express();
const http = httpModule.createServer(app);
const io: socketIo.Server = socketIo(http);
const port: string | number = process.env.PORT || 3000;

io.on("connection", socket => {
    const client = ioClient.connect("http://localhost:8000");

    client.on("message", msg => {
        console.info(msg.toString());
        socket.send(msg.toString());
    });
});

/* Serves static files */
app.use(express.static(path.join(path.join(__dirname, './public'))));

/* Default (homepage) route */
app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

/* Starts the HTTP server and listens to its port */
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});