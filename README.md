# PandaProtector
[![ci](https://github.com/RSA-Bots/PandaProtector/actions/workflows/ci.yml/badge.svg)](https://github.com/RSA-Bots/PandaProtector/actions/workflows/ci.yml)

# Instructions
1. `npm run build` to build the bot.
2. `npm start [configFile] [envFile]` to start the bot with the specified config.
	- If the config file is not specified, `config.json` will be used.
	- If the environment file is not specified, `.env` will be used.
	- For testing, `npm test` is equivalent to `npm start config-test.json .env.test`.
