const Discord = require('discord.js');
const glua = require('glua');

module.exports = {
    name: 'lua',
    description: 'Compiles provided Lua, and provides output.',
    cooldown: 60,
    args: true,
    execute(message, args) {
        var src = args.join(' ');
        var output = [];
        var errors = [];

        try {
            glua.runWithGlobals({
                print: function () {
                    for (v of arguments) {
                        output.push(v);
                    }
                },
                io: `nil`,
                os: `nil`,
                debug: `nil`
                //Can leave room for future implementation of other classes such as Vector2, Vector3, etc
            }, src);
        } catch ( error ) {
            errors.push(error);
        }

        const resultEmbed = new Discord.MessageEmbed()
            .setColor('#0cc218')
            .setTitle('Result of Code')
            .setAuthor(`${message.guild.members.resolve(message.author.id).displayName}`)
            .setDescription('Lua Code')
            .addFields(
                { name: 'Source Preview', value: src.slice(0, 100)},
                { name: 'Output', value: output.join('\n')},
            )
            .setTimestamp();

        if (errors.length) {
            resultEmbed.setColor('#e32214');
            resultEmbed.addField('Error(s)', errors.join('\n'));
        }

        message.channel.send(resultEmbed);
    }
}