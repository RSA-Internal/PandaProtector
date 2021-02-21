const { verify } = require('crypto');
const https = require('https')

/* To track those in process of verifying. */
/* stored as track[author] = {robloxId, blurb} */
const verifying = [];
const bindings = [];

const words = ['builderman', 'guest', 'robux', 'tix', 'script', 'studio', 'sword', 'simulator', 'obby', 'johndoe', 'devex', 'dued1', 'adoptme'];

function generateBlurb() {
    let blurb = [];
    for (let i=0; i<10; i++) {
        blurb.push(words[Math.floor(Math.random() * words.length)]);
    }
    return blurb.join(' ');
}

module.exports = {
    name: 'verify',
    description: 'Link Roblox Account',
    execute(message, args) {
        var channel = message.channel;
        var author = message.author;

        if (args.length == 0) {
            if (!verifying[author]) {
                message.reply('Please provide a userId to begin the verification process.');
                return;
            }
        }

        const robloxId = args[0];

        if (bindings[author.id]) {
            let binding = bindings[author.id];

            author.send(`Your account is already linked to an account [${binding['name']}]. Relinking accounts is not currently implemented, please try again later.`)
            return;
        };
        
        if (verifying[author]) {
            var data = verifying[author];

            const options = new URL(`https://users.roblox.com/v1/users/${data[0]}`)
            console.log(options);

            const req = https.get(options, res => {
                res.setEncoding('utf-8');
                
                res.on('data', function(chunk) {
                    let body = JSON.parse(chunk);

                    let desc = body['description'];
                    let name = body['name'];
                    let id = body['id'];

                    if (desc === data[1]) {
                        author.send(`Successfully verified account ${name}!`);
                        bindings[author.id] = {['name']: name, ['id']: id};
                        delete verifying[author];
                    } else {
                        author.send('The description does not seem to have been set. Please ensure you have changed the desciption of your account, and try again.');
                    }
                });
            });

            req.on('error', error => {
                console.error(error);
            })
        } else {
            var data = [];
            data[0] = robloxId;
            data[1] = generateBlurb();

            author.send(`Please set the following blurb as your description, then run \`;verify\` again!\n\nBlurb: \`${data[1]}\``);

            verifying[author] = data;
        }
    }
}