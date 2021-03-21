const { SlashCreator, GatewayServer } = require('slash-create');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const path = require('path');
const helper = require('./util/helper');
const { applicationID, publicKey, token, guildId, roleStaffId, testToken, channelRequestId, testPublicKey, testApplicationID, testGuildId, testChannelRequestId, testRoleStaffId, channelShowcaseId, channelRulesId, emojiYaysId } = require('./config.json');

var args = process.argv.slice(2);
var testing = false;
if (args[0]) {
  testing = true;
  console.log('Testing')
  helper.setToken(testToken);
  helper.setAppId(testApplicationID);
  helper.setKey(testPublicKey);
  helper.setGuild(testGuildId);
  helper.setFolder('slash-commands');
  helper.setRequestChannel(testChannelRequestId);
  helper.setStaffId(testRoleStaffId);
} else {
  console.log('Live')
  helper.setToken(token);
  helper.setAppId(applicationID);
  helper.setKey(publicKey);
  helper.setGuild(guildId);
  helper.setFolder('slash-commands');
  helper.setRequestChannel(channelRequestId);
  helper.setStaffId(roleStaffId);
}

const creator = new SlashCreator({
  applicationID: helper.useAppId(),
  publicKey: helper.useKey(),
  token: helper.useToken(),
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.ws.on('INTERACTION_CREATE', handler)
    )
  )
  .registerCommandsIn(path.join(__dirname, helper.folder()))
  .syncCommandsIn(helper.useGuild(), true);

if (testing) {
  creator.on('debug', m => console.log('slash-create debug:', m))
  creator.on('warn', m => console.log('slash-create warn:', m))
  creator.on('error', m => console.log('slash-create error:', m))
}

client.on('ready', () => {
    console.log('Ready');
    helper.setClient(client);
})

function shouldHandleReaction(messageId, checkMessageId, reactionId, checkReactionId) {
  if (reaction.message.id === channelRulesId) {
      if (reaction.emoji.id === emojiYaysId) {
          let guild = reaction.message.guild;
          let member = guild.members.resolve(user.id);
          return {guild, member}
      }
  }

  return null;
}

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
      try {
          await reaction.fetch();
      } catch (error) {
          console.error('Something went wrong when fetching the message: ', error);
          return;
      }

      let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

      if (handleReaction) {
          handleReaction[1].roles.add(handleReaction[0].roles.resolve(roleMemberId));
      }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.partial) {
      try {
          await reaction.fetch();
      } catch (error) {
          console.error('Something went wrong when fetching the message: ', error);
          return;
      }

      let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

      if (handleReaction) {
          handleReaction[1].roles.add(handleReaction[0].roles.resolve(roleMemberId));
      }
  }
})

client.on('message', message => {
  //Showcase check
  const content = message.content;
  const channel = message.channel;

  const deleted = false;

  if (channel.id == channelShowcaseId) {
      if (message.attachments.length == 0) {
          if (!content.includes(".com") || !content.includes(".net") || !content.includes("prnt.sc")) {
              message.delete();
              deleted = true;
          }
      }
  }

  if (deleted) return;
})

client.login(helper.useToken());