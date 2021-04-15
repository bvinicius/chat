const udp = require('dgram');
const readline = require('readline');

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

(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')
        client.send(answer, 3000, '192.168.0.109')
    }
})()

client.on('message', function (data, info) {
    const message = data.toString()
    console.log(`${message}`);
});