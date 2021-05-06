const udp = require("dgram");
const Group = require("../Group");
const GroupManager = require('../GroupManager');
const fs = require('fs');

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
    console.log('data: ', data)
    const message = data.toString();

    const command = message.split(" ")[0].slice(1);
    const args = message.split(" ").slice(1);

    const commands = {
        register: () => registerClient(args[0], info.port, info.address),
        msg: () => sendMessage(info.port, args[0], args.slice(1).join(" ")),
        group: () => createGroup(info.port, args[0]),
        join: () => joinGroup(info.port, args[0]),
        img: () => sendImage(info.port, args[0]),
        ka: () => keepAlive(info.port)
    };

    const isKnownCommand = Object.keys(commands).includes(command)
    isKnownCommand ?
        commands[command]() :
        server.send(`${command}: command not found.`, info.port, info.address)
});

function registerClient(username, port, address) {
    rootGroup.addClient(username, port, address);
    server.send(`[registered] ${username}`, port, address);
}

function directMessage(originPort, destinationUsername, message) {
    const clients = rootGroup.clients;
    const originClient = clients[originPort];
    const destinationClient = Object.values(clients).filter(e => e.username == destinationUsername)[0];

    let fullMessage = ''
    try {
        JSON.parse(message)
        fullMessage = message
    } catch {
        console.log('CAIU NO CATCH')
        fullMessage = `${originClient.username} [Privado]: ${message}`;
    }

    console.log('CONTINUOU')
        // const fullMessage = `${originClient.username} [Privado]: ${message}`;
    server.send(fullMessage, destinationClient.port, destinationClient.address);
}

function keepAlive(clientPort) {
    rootGroup.keepAlive(clientPort);
}

function sendMessage(originPort, destination, message) {
    const msgType = destination.charAt(0)

    const msgTypes = {
        '@': () => directMessage(originPort, destination.slice(1), message),
        '$': () => groupMessage(originPort, destination.slice(1), message),
        '*': () => messageAll(originPort, message)
    }
    msgTypes[msgType]()
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

function sendImage(originPort, strData) {
    const objMessage = JSON.parse(strData)
    const destination = objMessage.destination
    const imgFromClient = objMessage.data
    const uIntData = new Uint8Array(imgFromClient.data)

    const client = rootGroup.clients[originPort]

    const objData = {
        from: client.username,
        data: uIntData
    }
    const strSendData = JSON.stringify(objData)

    const msgType = destination.charAt(0)
    const msgTypes = {
        '@': () => directMessage(originPort, destination.slice(1), strSendData),
        // '$': () => sendGroupImage(originPort, destination.slice(1), strSendData),
        // '*': () => sendImageToAll(originPort, strSendData)
    }
    msgTypes[msgType]()
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