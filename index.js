const { SlashCreator, GatewayServer } = require('slash-create');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], ws: ['GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });
const path = require('path');
const helper = require('./util/helper');
const { applicationID, publicKey, token, guildId, roleStaffId, testToken, channelRequestId, testPublicKey, testApplicationID, testGuildId, testChannelRequestId, testRoleStaffId, channelShowcaseId, channelRulesId, emojiYaysId, roleMemberId } = require('./config.json');

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
  console.log(messageId, checkMessageId, reactionId, checkReactionId)
  if (messageId === checkMessageId) {
      if (reactionId === checkReactionId) {
          return true;
      }
  }

  return false;
}

client.on('messageReactionAdd', async (reaction, user) => {
  try {
      await reaction.fetch();
  } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
  }

  let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

  console.log(handleReaction);

  if (handleReaction) {
      let guild = reaction.message.guild;
      let member = guild.members.resolve(user.id);

      member.roles.add(guild.roles.resolve(roleMemberId));
  }

  return;
});

client.on('messageReactionRemove', async (reaction, user) => {
  try {
      await reaction.fetch();
  } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
  }

  let handleReaction = shouldHandleReaction(reaction.message.id, channelRulesId, reaction.emoji.id, emojiYaysId);

  console.log(handleReaction);

  if (handleReaction) {
      let guild = reaction.message.guild;
      let member = guild.members.resolve(user.id);

      member.roles.remove(guild.roles.resolve(roleMemberId));
  }

  return;
})

client.on('message', message => {
  //Showcase check
  const content = message.content;
  const channel = message.channel;

  var deleted = false;

  if (channel.id == channelShowcaseId) {
      console.log(message.attachments);
      console.log(message.attachments.array().length);
      if (!message.attachments.array().length || message.attachments.array().length == 0) {
          console.log('deleting');
          var toDelete = true;

          if (content.includes(".com") || content.includes(".net") || content.includes("prnt.sc")) {
              toDelete = false;
          }

          if (toDelete) {
              message.delete();
              deleted = true; 
          }
      }
  }

  if (deleted) return;
})

client.login(helper.useToken());