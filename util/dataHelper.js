const userAccountModel = require('../db/models/userAccountModel');
let accountModel = require('../db/models/userAccountModel');

let loadedAccounts = [];
let offloadTime = [];
let tempBalance = [];
let lastUpdated = null;
let currency = require('./containers/currency');
let items = require('./containers/item');
let stats = require('./containers/stats');
const { getItem } = require('./helper');

/** Used to check if an account should be offloaded from memory. Interval: 5 seconds */
var offloadCheck = setInterval(checkOffload, 5000);

/** Autosave. Interval: 2 minutes */
var autosaveTimer = setInterval(autosave, 1000*60*2)

function checkOffload() {
    let currentMilli = new Date().getTime();

    for (var userId in loadedAccounts) {
        let offloadAt = offloadTime[userId];

        if (currentMilli >= offloadAt) {
            console.log(`Saving ${userId}`);
            saveUserAccount(userId);
            offloadUserAccount(userId);
        }
    }
}

function autosave() {
    for (var userId in loadedAccounts) {
        saveUserAccount(userId);
    }
}

function updateOffloadTime(userId) {
    let currentMilli = new Date().getTime();

    offloadTime[userId] = currentMilli + (1000*60*30);
}

async function saveUserAccount(userId) {
    console.log(`Saving ${userId}`);
    let account = loadedAccounts[userId];

    if (account) {
        await userAccountModel.updateOne({holderId: userId}, account);
    }
}

function updateAccount(userId, account) {
    loadedAccounts[userId] = account;
    updateOffloadTime(userId);
}

function offloadUserAccount(userId) {
    delete loadedAccounts[userId];
    delete offloadTime[userId];
}

module.exports = {
    SHOP_ID: -1,
    BEAR_ID: -2,
    /**
     * @param userId
     * @summary 
     * Will attempt to get a user's account, if no account exists then it will create one.
     * Checks if account is in `loadedAccounts`, if not will load from DB into `loadedAccounts`.
     * 
     * Method is `async`, must use as `await getUserAccount(userId)`
     */
    getAccount: async function(accountId) {
        if (loadedAccounts[accountId]) {
            return loadedAccounts[accountId];
        } else {
            let account = await accountModel.findOne({holderId: accountId});
            let created = false;

            if (!account) {
                let tix = this.getCurrency('tix');
                tix.amount = 500;

                account = new accountModel({
                    holderId: accountId,
                    wallet: {tix: tix},
                    inventory: items,
                    stats: stats
                })

                await account.save();
                created = true;
            }

            loadedAccounts[accountId] = account;
            updateOffloadTime(accountId);

            if (created && accountId > 0) {
                let shopAccount = this.getAccount(-1);
                
                this.updateBalanceForAccount(shopAccount, 'tix', shopAccount.wallet[0]['tix']['amount'] + 500);
            }

            return account;
        }
    },

    getItem: function(itemQuery) {
        for (var it in items) {
            let item = items[it];
            if (item.name === itemQuery || item.name.toLowerCase() === itemQuery.toLowerCase() ||
                item.id === parseInt(itemQuery) || 
                item.localized === itemQuery || item.localized.toLowerCase() === itemQuery.toLowerCase()) {
                return item;
            }
        }

        return null;
    },

    /**
     * 
     * @param name 
     * 
     * @summary Will return a currency by the name provided.
     */
    getCurrency: function(name) {
        return currency[name];
    },

    incrementStatForAccount: function(account, stat) {
        account.stats[0][stat]['amount'] = account.stats[0][stat]['amount'] + 1;
        updateAccount(account.holderId, account);
    },

    updateItemForAccount: function(account, item, newAmount) {
        account.inventory[0][item]['amount'] = newAmount;
        updateAccount(account.holderId, account);
    },

    updateBalanceForAccount: function(account, currency, newBalance) {
        account.wallet[0][currency]['amount'] = newBalance;
        updateAccount(account.holderId, account);
    },

    updateAccount: function(account) {
        loadedAccounts[account.holderId] = account;
    },

    getAllBalances: async function() {
        if (!tempBalance.length) {
            lastUpdated = new Date();
            let accounts = await userAccountModel.find({}).sort({'wallet.0.tix.amount': -1});

            for (var index in accounts) {
                let account = accounts[index];   
                let userId = account.holderId;
                let tix = 0;
                if (loadedAccounts[userId]) {
                    tix = loadedAccounts[userId].wallet[0]['tix']['amount'];
                } else {
                    tix = account.wallet[0]['tix']['amount'];
                }

                tempBalance[userId] = tix;
            }

            setTimeout(function() { tempBalance = []; }, 1000*60*2);
        }

        return {lastUpdated, tempBalance};
    },

    getCategories: function() {
        let list = [];
        for (var it in items) {
            let item = items[it];
            if (!list.includes(item.category)) {
                list.push(item.category);
            }
        }

        return list;
    }
}