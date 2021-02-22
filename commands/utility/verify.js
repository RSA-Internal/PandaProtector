const { verify } = require('crypto');
const https = require('https');
const rbxAccount = require('../db/models/rbxAccountModel');

/* To track those in process of verifying. */
/* stored as track[author] = {robloxId, blurb} */
const verifying = [];

const words = ['builderman', 'guest', 'robux', 'tix', 'script', 'studio', 'sword', 'simulator', 'obby', 'johndoe', 'devex', 'dued1', 'adoptme'];

function generateBlurb() {
    let blurb = [];
    for (let i=0; i<10; i++) {
        blurb.push(words[Math.floor(Math.random() * words.length)]);
    }
    return blurb.join(' ');
}

function getUserdata(id) {
    return null;
}

async function bindAccount(authorId, robloxName, robloxId) {
    let rbxAccountBinding = new rbxAccount({
        authorId: authorId,
        robloxUsername: robloxName,
        robloxId: robloxId
    })

    await rbxAccountBinding.save();
}

module.exports = {
    name: 'verify',
    description: 'Link Roblox Account',
    async execute(message, args) {
        var channel = message.channel;
        var author = message.author;

        const robloxId = args[0];
        let boundAccount = await rbxAccount.findOne({
            authorId: author.id
        });

        if (boundAccount) {
            author.send(`Your account is already linked to an account [${boundAccount.robloxUsername}]. Relinking accounts is not currently implemented, please try again later.`)
            return;
        };

        if (args.length == 0) {
            if (!verifying[author]) {
                message.reply('Please provide a userId to begin the verification process.');
                return;
            }
        }
        
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
                        bindAccount(author.id, name, id);
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