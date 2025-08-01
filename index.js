const fs = require('fs');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const port = process.env.PORT || 3000;

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember]
});

client.login(token);

client.once('ready', () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
});

const app = express();
app.use(express.json());

// 🔎 Helper function to find member by username#discriminator
async function findMemberByName(discordName) {
  const guild = await client.guilds.fetch(config.guildId);
  console.log('✅ Guild fetched:', guild.name);

  const members = await guild.members.fetch();
  console.log(`✅ Fetched ${members.size} members`);

  const member = members.find(m =>
    m.user.tag.toLowerCase() === discordName.toLowerCase()
  );

  if (!member) {
    console.warn(`❌ Could not find member with tag "${discordName}"`);
  } else {
    console.log(`✅ Found member: ${member.user.tag}`);
  }

  return member;
}

// ✅ Approve endpoint
app.post('/approve', async (req, res) => {
  try {
    console.log('[POST /approve] Request body:', req.body);

    const { discordName, tier } = req.body;
    if (!discordName || !tier) {
      return res.status(400).send('Missing "discordName" or "tier" in body.');
    }

    const roleId = config.roleIds[tier];
    if (!roleId) {
      return res.status(400).send(`Tier "${tier}" not recognized.`);
    }

    const member = await findMemberByName(discordName);
    if (!member) {
      return res.status(404).send(`User "${discordName}" not found in the server.`);
    }

    await member.roles.add(roleId);
    console.log(`✅ Role "${tier}" added to ${discordName}`);
    res.send(`✅ Role "${tier}" added to ${discordName}`);
  } catch (err) {
    console.error('❌ Error in /approve:', err);
    res.status(500).send('❌ Internal error occurred while approving user.');
  }
});

// 🧪 Simple test route
app.get('/test', (req, res) => {
  res.send('🤖 DMT Role Syncer bot is online and listening for approvals!');
});

app.listen(port, () => {
  console.log(`🌐 Webhook listener running on port ${port}`);
});
