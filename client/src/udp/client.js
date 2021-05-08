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

let clientUsername = ''

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

function createUserDir(){
    try {
        fs.mkdirSync("../../data")
    } catch(err) {}

    fs.mkdirSync("../../data/" + clientUsername)
}

(async() => {
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')

        const isImgSend = answer.indexOf('/img') === 0
        if (isImgSend) {
            const [destination, imgPath] = answer.split(' ').slice(1)
            sendImage(destination, imgPath)
        } else {
            client.send(answer, 0, answer.length, SERVER_PORT, SERVER_ADDRESS);
        }
    }
})()

function sendImage(destination, imgPath) {
    const imageBuffer = fs.readFileSync(imgPath)
    const arrSend = [imageBuffer, destination]

    const strSend = JSON.stringify(arrSend)
    client.send(`/img ${strSend}`, SERVER_PORT, SERVER_ADDRESS)
}

client.on('message', function (data) {
    const message = data.toString()

    const infoRegex = /\[\w*\]/

    const initialWord = message.split(' ')[0]
    const isInfo = infoRegex.test(initialWord)

    if (isInfo) {
        const infos = {
            '[registered]': () => onRegister(message),
            '[img]': () => onImgReceive(message.split(' ')[1])
        }
        infos[initialWord]()
    } else {
        console.log(`${message}`);
    }
});

function onImgReceive(strData) {
    const objData = JSON.parse(strData)
    console.log(`${objData.from} sent an image.`)
    const now = new Date().getTime()
    const uIntData = new Uint8Array(objData.data)
    fs.writeFileSync(`../../data/${clientUsername}/${now}.jpg`, uIntData)
}

function onRegister(message) {
    keepAlive()
    clientUsername = message.split(" ")[1]
    createUserDir()
}