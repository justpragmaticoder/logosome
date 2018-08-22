// Load the TCP Library
import * as net from "net";

const port: number = 514;

let client: net.Socket = new net.Socket();
client.connect(port, '127.0.0.1', () => {
    console.log('Connected');
    client.write('Hello, Yeahhh!');
    client.write('\nIt\'s me, your Client.');
    client.write('\nHave a good coding time!)');
    client.destroy();
});