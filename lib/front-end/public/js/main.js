$(function () {
    const socket = io();
    socket.on('message', (msg) => {
        $('#messages').append($('<li>').text(msg));
    });
});