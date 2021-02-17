const glua = require('glua');

module.exports = {
    name: 'lua',
    description: 'Compiles provided Lua, and provides output.',
    cooldown: 60,
    args: true,
    execute(message, args) {
        var src = args.join(' ');
        var output = [];

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
            }, src);
        } catch ( error ) {
            output.push(`ERR: ${error}`);
        }

        message.channel.send(`**Output**\n\n${output.join('\n')}`);
    }
}