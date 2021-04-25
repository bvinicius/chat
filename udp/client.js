const udp = require('dgram');
const readline = require('readline');

const SERVER_PORT = 41234;
const SERVER_ADDRESS = "192.168.0.255"

const client = udp.createSocket('udp4');
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

function keepAlive(){
    setInterval(() =>{
        const message = '/ka'
        client.send(message, 0, message.length, SERVER_PORT, SERVER_ADDRESS)
    }, 10000)
}


(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')
        client.send(answer, 0, answer.length, SERVER_PORT, SERVER_ADDRESS);
        console.log(`sent '${answer}' to ${SERVER_ADDRESS}:${SERVER_PORT}`)
    }
})()

client.on('message', function (data) {
    const message = data.toString()

    if (message == '[registered]') {
        keepAlive()
    } else {
        console.log(`${message}`);
    }
});