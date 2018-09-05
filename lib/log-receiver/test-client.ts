// Loads TCP Library
import * as net from "net";
// Port for the tcp client connection
const port: number = 514;

// Set of syslog logs examples
const messages: string[] = [
    '<34>1 2018-09-05T22:14:15.003Z mymachine.example.com su - ID47 - BOM\'su root\' failed for lonvick on /dev/pts/8',
    '<30>1 2018-09-05T22:14:16.003Z mymachine.example.com su - ID48 - BOM\'su root\' error on /dev/pts/10',
    '<30>1 2018-09-05T22:14:17.003Z mymachine.example.com su - ID49 - BOM\'su root\' root error on /dev/pts/11',
    '<28>1 2018-09-05T22:14:18.003Z mymachine.example.com su - ID50 - BOM\'su root\' failed for lonvick on /dev/pts/8',
    '<17>1 2018-09-05T22:14:19.003Z mymachine.example.com su - ID51 - BOM\'su root\' failed on /dev/pts/7',
    '<15>1 2018-09-05T22:14:20.003Z mymachine.example.com su - ID52 - BOM\'su root\' error on /dev/pts/2'
];

// Syslog client instance for connection establishment
const client: net.Socket = new net.Socket();

client.connect(port, '127.0.0.1', () => {
    console.log('Connected');
    // Simple syslog forwarding imitation
    let counter: number = 0;

    const timer = setInterval(function () {
        client.write(messages[counter]);
        counter++;
        if (counter === messages.length) {
            clearInterval(timer);
            client.destroy();
        }
    }, 1000);
});