module.exports = {
    name: 'shutdown',
    description: 'Tells the bot to shutdown',
    owner: true,
    execute(message, args) {
        process.exit();
    }
}