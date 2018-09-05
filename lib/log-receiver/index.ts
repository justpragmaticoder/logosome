// Loads the TCP Library
import * as net from "net";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as io from "socket.io";
import {promisify} from "util";

const tcpPort: string | number = process.env.port || 514;
const socketPort: number = 8000;
const socketServer = io.listen(socketPort);
const mkdir = promisify(mkdirp);
let socketConnected;

socketServer.on("connection", socket => socketConnected = socket);

function runTCPServer(port: number | string): net.Server {
    return net.createServer(socket => {
        const userAddress: string = socket.remoteAddress.split(":")[3];
        const dirPath: string = getDirName(userAddress);

        turnLogsToFile(dirPath, userAddress, socket)
            .catch(error => console.error(error));
    }).listen(port, () => {
        console.log(`Listening on *:${port}`);
    });
}

async function turnLogsToFile(dirPath: string, userAddress: string, socket: net.Socket): Promise<void> {
    const fullFileName = dirPath + getFileName(userAddress);
    await mkdir(dirPath);
    const writeableStream = await fs.createWriteStream(fullFileName);

    socket.on("data", data => {
        writeableStream.write(data);
        if (socketConnected) {
            socketConnected.send(data);
        }
    });

    socket.on("end", () => {
        writeableStream.end();
    });

    socket.on("error", err => {
        console.log(err.stack);
        writeableStream.end();
    });
}

function getDirName(userAddress: string): string {
    return `${'../logs/'}/${userAddress}-${tcpPort}/${getCurrentDate()}/`;
}

function getFileName(userAddress: string): string {
    return `${userAddress}-${tcpPort}_${getCurrentDate()}`;
}

function getCurrentDate(): string {
    return new Date().toISOString().substr(0, 10);
}

runTCPServer(tcpPort);