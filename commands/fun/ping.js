module.exports = {
    name: 'ping',
    description: 'Gets the bot ping.',
    cooldown: 60,
    execute(message, args) {
        message.channel.send('Pinging...').then(sent => {
            sent.edit(`Websocket heartbeat: ${message.client.ws.ping}ms\nRoundtrip Latency: ${sent.createdTimestamp - message.createdTimestamp}ms`);
        });      
    }
};