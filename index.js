require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
console.log('Loaded Token:', token);
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.login(token);

client.once('ready', () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
});

const app = express();
app.use(express.json());

app.post('/approve', async (req, res) => {
  console.log('Received POST body:', req.body);
  const { discordName, tier } = req.body;

  if (!discordName || !tier) {
    return res.status(400).json({ error: 'Missing discordName or tier' });
  }

  const guild = await client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();

  const targetName = discordName.trim().toLowerCase();
  const member = members.find(m =>
    m.user.username.toLowerCase() === targetName || 
    m.user.tag.toLowerCase() === targetName
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
    console.error('Role assignment failed:', err);
    res.status(500).json({ error: `Failed to assign role: ${err.message}` });
  }
});

app.get('/test', (req, res) => {
  res.send('🤖 DMT Role Syncer bot is online and listening for approvals!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Webhook listener running on port 3000');
});
