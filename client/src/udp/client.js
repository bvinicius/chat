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
    } catch(_) {}

    try {
        fs.mkdirSync("../../data/" + clientUsername)
    } catch(_) {
    }
}

(async() => {
    greet()
    let answer = ''
    while(answer != 'quit') {
        answer = await question('> ')

        const splitAnswer = answer.split(' ')
        const cmd = splitAnswer[0].slice(1)
        const preCommands = {
            img: () => sendImage(splitAnswer.slice(1)[0], splitAnswer.slice(1)[1]),
            help: () => showHelp()
        }

        cmd in preCommands ?
            preCommands[cmd]() :
            client.send(answer, 0, answer.length, SERVER_PORT, SERVER_ADDRESS);
    }
})()

function greet() {
    console.log('Hello!\n')
    console.log('For more information about how to use this chat, type "/help"')
}

function showHelp() {
    console.log('\nAvailable commands: \n')
    console.log('- /register: Register yourself with your username\n\n\tExample: /register joaozinho\n')
    console.log('- /msg: Send a message to everyone, a group or just one person\n\tTo message everyone: /msg * <message>\n\tTo message a group: /msg $<group> <message>\n\tTo message someone directly: /msg @<username> <message>\n\n\tExamples:\n\t/msg * Hello everyone!\n\t/msg $group1 Hello group1 members!\n\t/msg @joaozinho Hello joaozinho!\n')
    console.log('- /group: Create a new group\n\n\tExample: /group workGroup\n')
    console.log('- /join: Join an existent group. You only receive group messages from groups you joined.\n\n\tExample: /join workGroup\n')
    console.log('- /listGroups: Lists the existent groups\n\n\tExample: /listGroups\n')
    console.log('- /img: Send a JPG (only!) image to everyone, a group or just one person\n\tTo send to everyone: /img * <img_path>\n\tTo send to a group: /img $<group> <img_path>\n\tTo send to someone directly: /img @<username> <img_path>\n\n\tExamples:\n\t/img * ../../image.jpg\n\t/img $group1 ../../image.jpg\n\t/img @joaozinho ../../image.jpg\n')
}

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