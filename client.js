const udp = require('dgram');

const client = udp.createSocket('udp4');
const data = "bom dia grupo"

client.send(data, 3000, '127.0.0.1', function (error) {
    if (error) {
        console.log(error)
        client.close();
    } else {
        console.log('Mensagem enviada ao servidor.\n');
    }
});

client.on('message', function (data, info) {
    const message = data.toString()
    console.log(` > Servidor diz: ${message}`);
});