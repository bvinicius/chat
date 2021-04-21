const udp = require('dgram');
const readline = require('readline');

const SERVER_PORT = 41234;
const SERVER_ADDRESS = "192.168.0.255"

const client = udp.createSocket('udp4');
client.setBroadcast(true)

const message = 'teste'
client.send(message, 0, message.length, SERVER_ADDRESS)

// client.bind(() => {
//     console.log(`client bound at ${SERVER_PORT}`)
// })

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
        client.send("/ka", SERVER_PORT, SERVER_ADDRESS)
    }, 10000)
}


(async() => {
    let answer = ''
    // while(answer != 'quit') {
        // answer = await question('> ')
        // client.send(answer, SERVER_PORT, SERVER_ADDRESS);
    // }
})()

client.on('message', function (data, info) {
    const message = data.toString()
    console.log(`${message}`);
});