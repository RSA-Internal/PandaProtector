import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: (state, message) => {
        const devs = [
            "169208961533345792", 
            "142090816150568960", 
            "114479781797429256"
        ];

        return devs.includes(message.author.id);
    },
	parseArguments: () => [],
	handler: (state) => {
		state.client.destroy();
        process.exit();
	},
};

export default command;
