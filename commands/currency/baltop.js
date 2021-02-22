const Discord = require('discord.js')
const userEco = require('../../db/models/userEcoModel');
const helper = require('../../util/helper')

module.exports = {
    name: 'baltop',
    description: 'Get the top money holders',
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        const leaderboard = new Discord.MessageEmbed()
            .setColor('#373737')
            .setTitle(`${helper.getMoneyEmoji(message)} board`)
            .setDescription(`Top 10 ${helper.getMoneyEmoji(message)} holders`);

        let accounts = await userEco.find().sort({balance: -1}).limit(10).exec({
            function(err, accounts) {
                console.log(err);
            }
        })

        console.log(accounts);

        for (var account in accounts) {
            console.log(account);
            console.log(accounts[account]);
            console.log(accounts[account].userId);
            console.log(accounts[account].balance);
            console.log(await message.guild.members.fetch( { user: accounts[account].userId, force: true }));

            leaderboard.addField(`${message.guild.members.resolve(accounts[account].userId).displayName}`, `${accounts[account].balance} ${helper.getMoneyEmoji(message)}`, false);
        }

        message.channel.send(leaderboard);
    }
}