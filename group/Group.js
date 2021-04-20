class Group {
    clients = {};

    get clients() {
        return this.clients;
    }

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

module.exports = Group