const Discord = require('discord.js');
var runWandbox = require('wandbox-api-updated');

module.exports = {
    name: 'lua',
    description: 'Compiles provided Lua, and provides output.',
    args: true,
    async execute(message, args) {
        var src = args.join(' ');

        if (src.includes('```lua')) {
            src = src.replace('```lua', '');
        }

        if (src.includes('```')) {
            src = src.replace('```', '');
        }

        var output = [];
        var errors = [];

        await runWandbox.fromString(`os=nil; io=nil; debug=nil;\n\n` + src, {'compiler': 'lua-5.3.0'}, function clbk( error, results) {
            let resultsParse = '';
            console.log(results);
            try {
                resultsParse = JSON.parse(results);

                if (resultsParse.program_error) {
                    errors.push(resultsParse.program_error);
                }
    
                if (resultsParse.program_output) {
                    output.push(resultsParse.program_output);
                }

                console.log(resultsParse);
            } catch (a) {
                errors.push(a);
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