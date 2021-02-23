const Discord = require('discord.js')
const userEco = require('../../db/models/userEcoModel');
const helper = require('../../util/helper')

module.exports = {
    name: 'baltop',
    description: 'Get the top money holders',
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        let money = helper.getMoneyEmoji(message);
        const leaderboard = new Discord.MessageEmbed()
            .setColor('#373737')
            .setTitle(`${money} board`)
            .setDescription(`Top 10 ${money} holders`);

        let accounts = await userEco.find().sort({balance: -1}).limit(10).exec({
            function(err, accounts) {
                console.log(err);
            }
        })

        for (var account in accounts) {
            let display = '[Server]';

            if (accounts[account].userId != '-1') {
                await message.guild.members.fetch( { user: accounts[account].userId, force: true })
                display = message.guild.members.resolve(accounts[account].userId).displayName
            }
            
            leaderboard.addField(`${display}`, `${accounts[account].balance} ${money}`, false);
        }

        message.channel.send(leaderboard);
    }
}