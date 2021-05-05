const udp = require('dgram');
const readline = require('readline');
const fs = require('fs');

const SERVER_PORT = 41234;
const SERVER_ADDRESS = "127.0.0.1" //para adotar o broadcast, basta alterar o endereço para o endereço de broadcast da rede na qual o server estará.

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

function createUserDir(dirName){
    fs.mkdirSync("../../data/" + dirName)
}


(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')

        if (answer == 'img') {
            const imageBuffer = fs.readFileSync('../../img/zap.jpg')
            const obj = {
                data: imageBuffer,
                destinationClient: 'lucas'
            }

            const objBuffer = Buffer.from(JSON.stringify(obj))
            console.log(objBuffer)

            client.send(objBuffer, 0, objBuffer.length, SERVER_PORT, SERVER_ADDRESS)
            
        } else {
            client.send(answer, 0, answer.length, SERVER_PORT, SERVER_ADDRESS);
        }
    }
})()

client.on('message', function (data) {
    const message = data.toString()

    if (message.split(" ")[0] == '[registered]') {
        keepAlive()
        createUserDir(message.split(" ")[1])
    } else {
        console.log(`${message}`);
    }
});