const udp = require("dgram");
const Group = require("../group/Group");
const GroupManager = require('../group/GroupManager');

const PORT = 41234;
const server = udp.createSocket("udp4");
const groupManager = new GroupManager();

const rootGroup = new Group('root', {});

server.bind(PORT, () => {
    server.setBroadcast(true)
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
            dm: () => directMessage(info.port, args[0], args.slice(1).join(" ")),
            ka: () => keepAlive(info.port),
            'create-group': () => createGroup(info.port, args[0]),
            group: () => groupMessage(info.port, args[0], args.slice(1).join(" ")),
            join: () => joinGroup(info.port, args[0])
        };
        commands[command]();
    } else {
        messageAll(info.port, message)
    }
});

function registerClient(username, port, address) {
    rootGroup.addClient(username, port, address);
    server.send(`Usuário registrado: ${username}`, port, address);
}

function directMessage(originPort, destinationUsername, message) {
    const clients = rootGroup.clients;
    const originClient = clients[originPort];
    const destinationClient = Object.values(clients).filter(e => e.username == destinationUsername)[0];

    const fullMessage = `${originClient.username} [Privado]: ${message}`;
    server.send(fullMessage, destinationClient.port, destinationClient.address);
}

function keepAlive(clientPort) {
    rootGroup.keepAlive(clientPort);
}

function messageAll(originPort, message) {
    const client = rootGroup.clients[originPort];
    const fullMessage = `${client.username} [Geral]: ${message}`;

    Object.values(rootGroup.clients)
        .filter(client => client.port != originPort)
        .forEach(client => {
            server.send(fullMessage, client.port, client.address);
        })
}

function createGroup(clientPort, groupName) {
    const client = rootGroup.clients[clientPort]
    const clients = {
        [client.port]: client
    }
    const group = new Group(groupName, clients)
    groupManager.addGroup(group)

    server.send(`You created the group ${group.name}.`, client.port, client.address)
}

function groupMessage(originPort, groupName, message) {
    const group = groupManager.getGroupByName(groupName)
    const client = rootGroup.clients[originPort];
    const fullMessage = `${client.username} [${groupName}]: ${message}`;

    Object.values(group.clients)
        .filter(client => client.port != originPort)
        .forEach(client => {
            server.send(fullMessage, client.port, client.address);
        })
}

function joinGroup(clientPort, groupName) {
    const group = groupManager.getGroupByName(groupName)
    if (group) {
        const client = rootGroup.clients[clientPort]
        group.addClient(client.username, client.port, client.address)
        server.send(`You joined the group ${group.name}.`, client.port, client.address)
    }
}

function checkUpdates() {
    setInterval(() => {
        const now = new Date().getTime()
        Object.values(rootGroup.clients).forEach((client) => {
            const duration = now - client.lastUpdate
            if (duration > 20000) {
                const removedClient = rootGroup.removeClient(client.port);
                console.log(`${removedClient.username} foi desconectado por inatividade.`);
            }
        });
    }, 1000);
}