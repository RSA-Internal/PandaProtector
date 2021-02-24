const userEco = require('../../db/models/userEcoModel');
const helper = require('../../util/helper')

module.exports = {
    name: 'pay',
    description: 'Pay a user from your balance',
    guildOnly: true,
    args: true,
    cooldown: 15,
    async execute(message, args) {
        let money = helper.getMoneyEmoji(message);

        if (args.length < 2) { return message.channel.send('Not enough arguments provided.'); }

        let payer = message.author;
        let payee = await helper.queryUser(message, args);
        let amount = parseInt(args[1]);

        if (!payee) { return message.channel.send('The was no valid target to send money to.'); }
        if (payer.id === payee.id) { return message.channel.send(`It is pointless to exchange money with yourself.`); }
        if (isNaN(amount)) { return message.channel.send(`We send ${money}, not malformed numbers.`); }
        if (amount < 0) { return message.channel.send('Can not send negative money.'); }
        if (amount == 0) { return message.channel.send('No money to send'); }

        let payerAccount = await helper.getUserEcoAccount(payer.id);
        let payeeAccount = await helper.getUserEcoAccount(payee.id);

        if (payerAccount.balance < amount) { return message.channel.send(`You need ${amount-payerAccount.balance} more ${money}.`); }

        await helper.updateBalance(payer, -amount);
        await helper.updateBalance(payee, amount);

        return message.channel.send(`Successfully sent ${amount} ${helper.getMoneyEmoji(message)} to ${payee}`);
    }
}