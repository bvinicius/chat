const udp = require('dgram');

const server = udp.createSocket('udp4');

console.log(server.ref())

server.on('message', function (data) {
    const message = data.toString()
    console.log(` > Cliente diz: ${message}`);
});

server.on('listening', function () {
    const { port, address } = server.address();

    console.log(`Servidor escutando na porta ${port}`);
    console.log(`IP do servidor: ${address}`);
});

server.on('close', function () {
    console.log('Chat encerrado.');
});

server.on('error', function (error) {
    console.log('Error: ' + error);
    server.close();
});

server.bind(3000);