// Loads the TCP Library
import * as net from "net";
import * as fs from "fs";
// Creates directories
import * as mkdirp from "mkdirp";
import * as io from "socket.io";
// Converts a callback-based function to a promise-based one
import {promisify} from "util";

// Port for the tcp server
const tcpPort: string | number = process.env.port || 514;

// Port for the socket server
const socketPort: number = 8000;
const socketServer: io.Server = io.listen(socketPort);
// A promise-based function for making directories
const mkdir: Function = promisify(mkdirp);
// Keeps the connected client socket instance
let socketConnected: io.Socket;


socketServer.on("connection", socket => socketConnected = socket);
runTCPServer(tcpPort);

/**
 * Runs the tcp server that gets syslog logs through the 514th port.
 * Puts logs into files and transfers them via sockets to the log-aggregator(if it is connected).
 * @param port - syslog protocol port(514).
 */
function runTCPServer(port: number | string): net.Server {
    return net.createServer(socket => {
        const userAddress: string = socket.remoteAddress.split(":")[3];
        const dirPath: string = getDirPath(userAddress);

        turnLogsToFile(dirPath, userAddress, socket)
            .catch(error => console.error(error));
    }).listen(port, () => {
        console.log(`Listening on *:${port}`);
    });
}

/**
 * Creates directories and event listeners for the tcp server in order to turn log streams into the right files.
 * @param dirPath - path for the directory with collected logs.
 * @param userAddress - user's(syslog client) ip address (needed for directory path and file name).
 * @param socket - tcp socket instance for handling logs from syslog client.
 * */
async function turnLogsToFile(dirPath: string, userAddress: string, socket: net.Socket): Promise<void> {
    const fullFileName = dirPath + getFileName(userAddress);
    // Creates a directory for the log file
    await mkdir(dirPath);
    // Creates a file for logs in the specified directory and a stream to write logs
    const writeableStream = await fs.createWriteStream(fullFileName);

    socket.on("data", data => {
        writeableStream.write(data + '\n');
        // Sends logs to the client connected via socket (if it is present)
        if (socketConnected) {
            socketConnected.send(data);
        }
    });

    socket.on("end", () => {
        writeableStream.end();
    });

    socket.on("error", err => {
        console.error(err.stack);
        writeableStream.end();
    });
}

/**
 * Creates directory path for logs of the connected syslog client.
 *  @param userAddress - user's(syslog client) ip address (needed for directory path and file name).
 *  @return ready-made path for making a chain of directories.
 * */
function getDirPath(userAddress: string): string {
    return `${'../../logs'}/${userAddress}-${tcpPort}/${getCurrentDate()}/`;
}

/**
 * Creates a file name for logs of the connected syslog client.
 * @param userAddress - user's(syslog client) ip address (needed for directory path and file name).
 * @return ready-made file name for the file that will keep user's logs.
 * */
function getFileName(userAddress: string): string {
    return `${userAddress}-${tcpPort}_${getCurrentDate()}`;
}

/**
 * Gets current date in the following format "yyyy-mm-dd" for making a chain of directories.
 * @return ready-made date in the needed format.
 * */
function getCurrentDate(): string {
    return new Date().toISOString().substr(0, 10);
}