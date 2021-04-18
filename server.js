const udp = require("dgram");

var PORT = 41848;
var MCAST_ADDR = "230.185.192.108"; //not your IP and should be a Class D address, see http://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
const multicastPort = 5554;

const server = udp.createSocket("udp4");
const clients = {};

server.bind(PORT, function() {
    server.setBroadcast(true);
    server.setMulticastTTL(128);
    server.addMembership(MCAST_ADDR);
});

function addClient(username, port, address) {
  console.log("Adress: ", address)
  console.log("Port: ", port)
  clients[username] = { address, port };
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

    const destinationClient = clients[destinationUser];
    server.send(msg, destinationClient.port, destinationClient.address);
  } else {

    //VALIDAR O FOR
    Object.values(clients)
      .filter(destinationClient => destinationClient.port != info.port)
      .forEach(destinationClient => {
      server.send(message, destinationClient.port, destinationClient.address);
    });

  }
});

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
