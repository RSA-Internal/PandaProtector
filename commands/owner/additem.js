let helper = require('../../util/helper');
let dataHelper = require('../../util/dataHelper');

module.exports = {
    name: 'additem',
    description: 'Allows injection of item out of thin air',
    ownerOnly: true,
    async execute(message, args) {
        console.log('injecting item');
        let target = await helper.queryMember(message, args);
        
        if (target) {
            let account = await dataHelper.getAccount(target.id);
            let itemQuery = args.slice(1).join(' ');

            let item = dataHelper.getItem(itemQuery);
            if (item) {
                let userCount = account.inventory[0][item.localized]['amount'] + 1 || 1;
                await dataHelper.updateItemForAccount(account, item.localized, userCount);
                return message.channel.send(`Successfully added ${item.name} to ${target.displayName}'s inventory.`);
            } else {
                return message.channel.send('Invalid item');
            }
        } else {
            return message.channel.send('Invalid target');
        }
    }
}