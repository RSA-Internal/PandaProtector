const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, testToken, channelShowcaseId, channelRulesId, emojiYaysId, roleMemberId } = require('./config.json');

const cooldowns = new Discord.Collection();

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
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
});

function shouldHandleReaction(messageId, checkMessageId, reactionId, checkReactionId) {
    if (reaction.message.id === channelRulesId) {
        if (reaction.emoji.id === emojiYaysId) {
            let guild = reaction.message.guild;
            let member = guild.members.resolve(user.id);
            return {guild, member}
        }
    }

    return null;
}

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
        }

        let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

        if (handleReaction) {
            handleReaction[1].roles.add(handleReaction[0].roles.resolve(roleMemberId));
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
        }

        let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

        if (handleReaction) {
            handleReaction[1].roles.add(handleReaction[0].roles.resolve(roleMemberId));
        }
    }
})

client.on('message', message => {
    //Showcase check
    const content = message.content;
    const channel = message.channel;

    const deleted = false;

    if (channel.id == channelShowcaseId) {
        if (message.attachments.length == 0) {
            if (!content.includes(".com") || !content.includes(".net") || !content.includes("prnt.sc")) {
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

    if (!client.commands.has(commandName)) return;

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

var args = process.argv.slice(2);
if (args[0]) {
    client.login(testToken);
} else {
    client.login(token);
}