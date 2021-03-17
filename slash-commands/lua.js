const Discord = require('discord.js');
const { SlashCommand } = require('slash-create');
const helper = require('../util/helper');
const runWandbox = require('wandbox-api-updated');

module.exports = class LuaCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            "name": "lua",
            "description": "Execute lua stuff",
            "options": [
              {
                "type": 3,
                "name": "src",
                "description": "Lua source",
                "default": false,
                "required": true
              }
            ],
            guildIDs: helper.useGuild()
        });
        this.filePath = __filename;
        console.log(`Loaded ${this.commandName}`);
    }

    async run(ctx) {
        let Client = helper.getClient();
        let src = ctx.options.src;

        if (src.includes('```lua')) { src = src.replace('```lua', ''); }
        if (src.includes('```')) { src = src.replace('```', ''); }

        var output = [];
        var errors = [];

        await runWandbox.fromString(`debug.sethook(function() error("Exhausted script") end, "", 200); os=nil; io=nil; debug=nil;\n\n` + src, {'compiler': 'lua-5.3.0'}, function clbk( error, results) {
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
                //errors.push(a);
                errors.push('Unexpected end of JSON string');
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

            let channelID = ctx.channelID;

            if (helper.shouldBeEphemeral(channelID)) {
                var errorDisplay = "";

                if (errors.length) {
                    errorDisplay = `_Errors_\n${errors.join('\n').slice(0, 750)}`;
                }

                ctx.send(`**Result of Code**\n\n_Source Preview_\n\`\`\`lua\n${src.slice(0, 100)}\n\`\`\`\n\n_Output_\n\`\`\`\n${output.join('\n').slice(0, 750)}\n\`\`\`\n\n${errorDisplay}`, {
                    ephemeral: true,
                })
            } else {
                ctx.acknowledge(true);
                const resultEmbed = new Discord.MessageEmbed()
                .setColor('#0cc218')
                .setTitle('Result of Code')
                .setAuthor(`${Client.guilds.resolve(helper.useGuild()).members.resolve(ctx.member.id).displayName}`)
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

                
                
                let channel = Client.channels.resolve(channelID);

                channel.send(resultEmbed);
            }
        });
    }
}