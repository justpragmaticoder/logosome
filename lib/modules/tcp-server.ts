// Load the TCP Library
import * as net from "net";

function runTCPServer(port: number | string, listeners: object) {
    return net.createServer(socket => {
        for (const key in listeners) {
            socket.on(key, listeners[key]);
        }
    }).listen(port, () => {
        console.log(`Listening on *:${port}`);
    });
}

function makeListener(data: object) {
    const err: object = {
        error: err => {
            console.log(err.stack);
        }
    };
    return Object.assign(err, data);
}

export {runTCPServer, makeListener};