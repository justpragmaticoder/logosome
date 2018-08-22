// Loads the TCP Library
import * as net from "net";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as shortid from "shortid";

const port: string | number = process.env.port || 514;

function runTCPServer(port: number | string): net.Server {
    return net.createServer(socket => {
        const userAddress: string = socket.remoteAddress.split(":")[3];
        const userID: string = shortid.generate();
        const dirPath: string = getDirName(userID, userAddress);
        mkdirp(dirPath, (err) => {
            if (err) return console.error(err);
            turnLogsToFile(dirPath + getFileName(userID, userAddress), socket);
        });
    }).listen(port, () => {
        console.log(`Listening on *:${port}`);
    });
}

function turnLogsToFile(fullFileName: string, socket: net.Socket): void {
    const writeableStream = fs.createWriteStream(fullFileName);
    socket.on("data", (data) => {
        writeableStream.write(data);
    });
    socket.on("end", () => {
        writeableStream.end();
        console.log("> left");
    });
    socket.on("error", (err) => {
        console.log(err.stack);
        writeableStream.end();
    });
}

function getDirName(userId: string, userAddress: string): string {
    return `${'../logs/'}${userId}/${userAddress}/${getCurrentDate()}/`;
}

function getFileName(userId: string, userAddress: string): string {
    return `${userId}-${userAddress}_${getCurrentDate()}`;
}

function getCurrentDate(): string {
    return new Date().toISOString().substr(0, 10);
}

runTCPServer(port);