const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// rl.question('What do you think of Node.js? ', (answer) => {
//     console.log(`Thank you for your valuable feedback: ${answer}`);
//     rl.question('teste?', (answer) => {
//         console.log('answer: ', answer)
//     })
// });

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
        console.log(answer)
    }
})()
