const { Events } = require('discord.js');
const config = require('./config.json');

module.exports = (client) => {
  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      const generalChat = await member.guild.channels.fetch('1065734894967328813');

      // Post in #general-chat
      await generalChat.send(`👋 Welcome <@${member.id}>! Check your DMs and the pinned post here to get started.`);

      // Wait 2 seconds before checking roles
      setTimeout(async () => {
        try {
          // Refetch the member to get updated roles
          const refreshedMember = await member.guild.members.fetch(member.id);
          const roles = refreshedMember.roles.cache;

          const isElite = roles.has(config.roleIds.Elite);
          const isPro = roles.has(config.roleIds.Pro);
          const isFree = roles.has(config.roleIds.Freebie);

          let dmText = '';

          if (isElite || isPro) {
            dmText = `🎉 Welcome aboard! You’re tagged as **Pro/Elite**, which unlocks private chats, the full course, Zoom calls, and scorecards. Check the pinned post in #general-chat to access everything!`;
          } else if (isFree) {
            dmText = `👋 Welcome to Delta Mudline Trading! You’re in **Free mode** — you get Logger access and general chat. Check the pinned post in #general-chat to learn how to upgrade anytime!`;
          } else {
            dmText = `👋 Welcome! You’ve joined the Delta Mudline Trading Discord. Check #general-chat and the pinned message to get started.`;
          }

          // Send the DM
          await refreshedMember.send(dmText);
        } catch (roleErr) {
          console.error(`❌ Error after role delay:`, roleErr);
        }
      }, 2000); // 2 second delay
    } catch (err) {
      console.error(`❌ Error welcoming new member:`, err);
    }
  });
};
