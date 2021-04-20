const udp = require("dgram");
const Group = require("../group/Group");

const PORT = 41848;
const server = udp.createSocket("udp4");
const group = new Group();

server.bind(PORT, () => {
    checkUpdates();
});

server.on("listening", function () {
    const { address } = server.address();

    console.log(`Chat iniciado.`);
    console.log(`IP do servidor: ${address}`);
});

server.on("error", function (error) {
    console.log("Error: " + error);
    server.close();
});

server.on("close", function () {
    console.log("Chat encerrado.");
});

server.on("message", function (data, info) {
    const message = data.toString().trim();

    const isCommand = message.indexOf("/") === 0;
    if (isCommand) {
        const command = message.split(" ")[0].slice(1);
        const args = message.split(" ").slice(1);

        const commands = {
            register: () => registerClient(args[0], info.port, info.address),
            dm: () => directMessage(info.port, args[0], args[1]),
            ka: () => keepAlive(info.port),
        };
        commands[command]();
    } else {
        groupMessage(info.port, message)
    }
});

function registerClient(username, port, address) {
    group.addClient(username, port, address);
    server.send(`Usuário registrado: ${username}`, port, address);
}

function directMessage(originPort, destinationUsername, message) {
    const clients = group.clients;
    const originClient = clients[originPort];
    const destinationClient = Object.values(clients).filter(e => e.username == destinationUsername)[0];

    const fullMessage = `${originClient.username}: ${message}`;
    server.send(fullMessage, destinationClient.port, destinationClient.address);
}

function keepAlive(clientPort) {
    group.keepAlive(clientPort);
}

function groupMessage(originPort, message) {
    const client = group.clients[originPort];
    const fullMessage = `${client.username}: ${message}`;

    Object.values(group.clients)
        .filter(client => client.port != originPort)
        .forEach(client => {
            server.send(fullMessage, client.port, client.address);
        })
}

function checkUpdates() {
    setInterval(() => {
        const now = new Date().getTime()
        Object.values(group.clients).forEach((client) => {
            const duration = now - client.lastUpdate
            if (duration > 20000) {
                const removedClient = group.removeClient(client.port);
                console.log(`${removedClient.username} foi desconectado por inatividade.`);
            }
        });
    }, 1000);
}