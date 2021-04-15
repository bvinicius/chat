const udp = require('dgram');

const server = udp.createSocket('udp4');
const clients = {}

server.bind(3000, '192.168.0.109', () => {
    server.addMembership('230.185.192.108')
});

function addClient(username, port, address) {
    clients[username] = { address, port }
}

server.on('message', function (data, info) {
    const message = data.toString()

    if (message.indexOf('/register') === 0) {
        const username = message.split(' ')[1]

        addClient(username, info.port, info.address)
        server.send(`[server] Successfully registered ${username}.`, info.port, info.address)
    }
});

server.on('listening', function () {
    const { port, address } = server.address();

    console.log(`Servidor escutando na porta ${port}`);
    console.log(`IP do servidor: ${address}`);
});

server.on('error', function (error) {
    console.log('Error: ' + error);
    server.close();
});

server.on('close', function () {
    console.log('Chat encerrado.');
});