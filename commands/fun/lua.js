const Discord = require('discord.js');
var runWandbox = require('wandbox-api-updated');

module.exports = {
    name: 'lua',
    description: 'Compiles provided Lua, and provides output.',
    args: true,
    async execute(message, args) {
        var src = args.join(' ');

        var output = [];
        var errors = [];

        await runWandbox.fromString(src, {'compiler': 'lua-5.3.0'}, function clbk( error, results) {
            if (results.program_error) {
                errors.push(results.program_error);
            }

            if (results.program_output) {
                output.push(results.program_output);
            }

            if (error) {
                errors.push(error);
            }

            if (!src.length) {
                src = "No source?";
            }
    
            if (!output.length) {
                output.push('No output.');
            }
    
            const resultEmbed = new Discord.MessageEmbed()
                .setColor('#0cc218')
                .setTitle('Result of Code')
                .setAuthor(`${message.guild.members.resolve(message.author.id).displayName}`)
                .setDescription('Lua Code')
                .addFields(
                    { name: 'Source Preview', value: src.slice(0, 100)},
                    { name: 'Output', value: output.join('\n').slice(0, 1024)},
                )
                .setTimestamp();
    
            if (errors.length) {
                resultEmbed.setColor('#e32214');
                resultEmbed.addField('Error(s)', errors.join('\n'));
            }
    
            message.channel.send(resultEmbed);
        });
    }
}