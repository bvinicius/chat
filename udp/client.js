const udp = require('dgram');
const readline = require('readline');

const client = udp.createSocket('udp4');
const SERVER_PORT = 41848;
const SERVER_ADDRESS = "127.0.0.1"

client.bind(() => {
    keepAlive()
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

function keepAlive(){
    setInterval(() =>{
        client.send("/ka", SERVER_PORT, SERVER_ADDRESS)
    }, 10000)
}


(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')
        client.send(answer, SERVER_PORT, SERVER_ADDRESS);
    }
})()

client.on('message', function (data, info) {
    const message = data.toString()
    console.log(`${message}`);
});