const udp = require("dgram");
const { disconnect } = require("process");

var PORT = 41848;
// var MCAST_ADDR = "230.185.192.108"; //not your IP and should be a Class D address, see http://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
// const multicastPort = 5554;

const server = udp.createSocket("udp4");
const clients = {};

server.bind(PORT, function() {
    checkUpdates()
    // server.setBroadcast(true);
    // server.setMulticastTTL(128);
    // server.addMembership(MCAST_ADDR);
});

function addClient(username, port, address) {
  //NÃO PERMITIR USERNAME REPETIDO
  console.log("Adress: ", address)
  console.log("Port: ", port)
  const lastUpdate = process.hrtime();
  clients[port] = { address, port, username, lastUpdate };
}

server.on("message", function(data, info) {
  const message = data.toString().trim();

  if (message.indexOf("/register") === 0) {
    // register command
    const username = message.split(" ")[1];

    addClient(username, info.port, info.address);
    server.send(
      `[server] Successfully registered ${username}.`,
      info.port,
      info.address
    );
  } else if (message.indexOf("/dm") === 0) {
    // direct message to specific user
    const data = message.split(" ");
    const destinationUser = data[1];
    const msg = data.slice(2).join(" ") || "[empty message]";

    const destinationClient = Object.values(clients).filter(client => client.username == destinationUser)[0]

    server.send(destinationClient.username + ": " + msg, destinationClient.port, destinationClient.address);
  
  } else if(message == "[KA]"){
    clients[info.port].lastUpdate = process.hrtime()
  } else {

    Object.values(clients)
      .filter(destinationClient => destinationClient.port != info.port)
      .forEach(destinationClient => {
      server.send(message, destinationClient.port, destinationClient.address);
    });

  }
});

function checkUpdates(){
  setInterval(() => {

    Object.values(clients)
    .forEach((client, idx) =>{
      const duration = process.hrtime(client.lastUpdate)
      if(duration[0] > 20){
        server.send("Você foi desconectado por inatividade", client.port, client.address);
        console.log(`${username} foi desconectado. Não recebemos [KA]`)
        delete clients[client.port]
      }
    })
  }, 1000)
}

server.on("listening", function() {
  const { port, address } = server.address();

  console.log(`Servidor escutando na porta ${port}`);
  console.log(`IP do servidor: ${address}`);
});

server.on("error", function(error) {
  console.log("Error: " + error);
  server.close();
});

server.on("close", function() {
  console.log("Chat encerrado.");
});
