module.exports = class Group {
    
    constructor(name, clients) {
        this.clients = clients;
        this.name = name;
    }

    // get clients() {
    //     return this.clients;
    // }

    // get name() {
    //     return this.name;
    // }

    // set name(name) {
    //     this.name = name;
    // }

    addClient(username, port, address) {
        const activeClients = Object.values(this.clients)
        if (!activeClients.includes(username)) {
            const lastUpdate = new Date().getTime();
            this.clients[port] = {username, port, address, lastUpdate};
            return true;
        } else {
            return false;
        }
    }

    removeClient(port) {
        const client = this.clients[port];
        delete this.clients[port];
        return client;
    }

    keepAlive(port) {
        this.clients[port].lastUpdate = new Date().getTime();
    }
}