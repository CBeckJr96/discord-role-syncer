require('dotenv').config();
const token = process.env.discord_token;
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
});

const app = express();
app.use(express.json());

app.post('/approve', async (req, res) => {
  const { discordName, tier } = req.body;

  if (!discordName || !tier) {
    return res.status(400).json({ error: 'Missing discordName or tier' });
  }

  const guild = await client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();

  const member = members.find(m =>
    m.user.username === discordName || m.user.tag === discordName
  );

  if (!member) {
    return res.status(404).json({ error: `User ${discordName} not found.` });
  }

  const roleId = config.roleIds[tier];
  if (!roleId) {
    return res.status(400).json({ error: `Invalid tier: ${tier}` });
  }

  try {
    await member.roles.add(roleId);
    res.json({ success: true, message: `Assigned ${tier} role to ${discordName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to assign role: ${err.message}` });
  }
});

app.get('/', (req, res) => {
  res.send('🤖 DMT Role Syncer bot is online and listening for approvals!');
});

app.listen(3000, () => {
  console.log('🌐 Webhook listener running on port 3000');
});

client.login(config.token);
