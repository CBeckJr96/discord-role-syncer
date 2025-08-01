const fs = require('fs');
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
  try {
    const { discordName, tier } = req.body;
    const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
    const roleId = config.roleIds[tier];

    if (!roleId) {
      return res.status(400).send(`Tier "${tier}" not recognized.`);
    }

    const member = await findMemberByName(discordName); // Make sure this function exists and works

    if (!member) {
      return res.status(404).send(`User "${discordName}" not found in the server.`);
    }

    await member.roles.add(roleId);
    console.log(`✅ Role ${tier} added to ${discordName}`);
    res.send(`✅ Role ${tier} added to ${discordName}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Internal error occurred while approving user.');
  }
});

app.get('/test', (req, res) => {
  res.send('🤖 DMT Role Syncer bot is online and listening for approvals!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Webhook listener running on port 3000');
});
