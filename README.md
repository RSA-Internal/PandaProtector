# PandaProtector
[![ci](https://github.com/RSA-Bots/PandaProtector/actions/workflows/ci.yml/badge.svg)](https://github.com/RSA-Bots/PandaProtector/actions/workflows/ci.yml)

# Instructions
1. `npm run build` to build the bot.
2. `npm start [configFile] [tokenEnv]` to start the bot with the specified config.
	- If the config file is not specified, `config.json` will be used.
	- If the environmental variable name is not specified, `TOKEN` will be used.
	- For testing, `npm test` is equivalent to `npm start config-dev.json TOKEN_DEV`.
