const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { prefix, token, testToken, channelShowcaseId, channelRulesId, emojiYaysId, roleMemberId, mongoUsername, mongoPassword, dbRSA, publicKeyTest } = require('./config.json');

const { DiscordInteractions } = require("slash-commands");

const interaction = new DiscordInteractions({
    applicationId: "782504308977303572",
    authToken: testToken,
    publicKey: publicKeyTest,
})

var mongoDB = `mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.oo0g2.mongodb.net/${dbRSA}?retryWrites=true&w=majority`
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;

const cooldowns = new Discord.Collection();

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], ws: { intents: ['GUILD_MEMBERS']} });
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.once('ready', () => {
    console.log('Ready!');

    console.log(client.user.id)
    // setupSlashCommands;

    client.api.applications(client.user.id).guilds('546033322401464320').commands.post({data: {
        name: 'test',
        description: 'test'
    }});

    client.api.applications(client.user.id).guilds('546033322401464320').commands.post({data: {
        name: 'test2',
        description: 'test2',
        callback: 'f',
    }});

    client.ws.on('INTERACTION_CREATE', async interaction => {
        console.log(interaction);
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              content: 'hello world!'
            }
        }})

        //new Discord.WebhookClient(client.user.id, interaction.token).send('hello world')
    })
});

function shouldHandleReaction(messageId, checkMessageId, reactionId, checkReactionId) {
    console.log(messageId, checkMessageId, reactionId, checkReactionId)
    if (messageId === checkMessageId) {
        if (reactionId === checkReactionId) {
            return true;
        }
    }

    return false;
}

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        await reaction.fetch();
    } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
        return;
    }

    let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

    console.log(handleReaction);

    if (handleReaction) {
        let guild = reaction.message.guild;
        let member = guild.members.resolve(user.id);
        
        member.roles.add(guild.roles.resolve(roleMemberId));
    }

    return;
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        await reaction.fetch();
    } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
        return;
    }

    let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

    console.log(handleReaction);

    if (handleReaction) {
        let guild = reaction.message.guild;
        let member = guild.members.resolve(user.id);
        
        member.roles.remove(guild.roles.resolve(roleMemberId));
    }

    return;
})

client.on('message', message => {
    //Showcase check
    const content = message.content;
    const channel = message.channel;

    var deleted = false;

    if (channel.id == channelShowcaseId) {
        console.log(message.attachments);
        console.log(message.attachments.array().length);
        if (!message.attachments.array().length || message.attachments.array().length == 0) {
            console.log('deleting');
            var toDelete = true;

            if (content.includes(".com") || content.includes(".net") || content.includes("prnt.sc")) {
                toDelete = false;
            }

            if (toDelete) {
                message.delete();
                deleted = true; 
            }
        }
    }

    if (deleted) return;

    //Command check
    if (!content.startsWith(prefix) || message.author.bot) return;

    const args = content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.owner && message.author.id != message.guild.ownerID) {
        return message.reply('You can not use owner exclusive commands.');
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('You can not do this!');
        }
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}`;
        
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

async function setupSlashCommands() {
    // Get Guild Commands
    await interaction.getApplicationCommands('546033322401464320').then(console.log).catch(console.error);

    // Create Commands
    const command = {
        name: "test",
        description: "testing",
        options: []
    }

    await interaction.createApplicationCommand('546033322401464320').then(console.log).catch(console.error);
}

var args = process.argv.slice(2);
if (args[0]) {
    client.login(testToken);
} else {
    client.login(token);
}