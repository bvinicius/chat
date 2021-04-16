const udp = require('dgram');
const readline = require('readline');

const client = udp.createSocket('udp4');
const multicastAddress = "230.1.2.3";
const multicastInterface = "127.0.0.1"
const multicastPort = 5554;

client.bind(multicastPort, multicastAddress, () => {
    client.addMembership(multicastAddress, multicastInterface)
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer)
        })
    })
}

(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')
        client.send(answer, 5554, multicastAddress)
    }
})()

client.on('message', function (data, info) {
    const message = data.toString()
    console.log(`${message}`);
});