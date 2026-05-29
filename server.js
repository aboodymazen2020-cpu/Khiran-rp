const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ===== الإعدادات ===== */
const BOT_TOKEN = "MTM1MzU2MzA2Njg3MjM2NTEzNw.GlvFaS.ElYYLwZbi5jGjhyo-p-aaWZqjB10CjQIETSS1E";
const PASSWORD = "112";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.login(BOT_TOKEN);

client.once("ready", () => {
  console.log(`🔥 Bot Ready | Servers: ${client.guilds.cache.size}`);
});

/* ===== جلب السيرفرات ===== */
app.get("/guilds", (req, res) => {
  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name
  }));
  res.json(guilds);
});

/* ===== إرسال برودكاست ===== */
app.post("/broadcast", async (req, res) => {
  const { password, guildId, title, description, color } = req.body;

  if (password !== PASSWORD)
    return res.status(401).json({ error: "كلمة المرور خطأ" });

  try {
    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();

    let sent = 0;
    let failed = 0;

    for (const member of guild.members.cache.values()) {
      if (member.user.bot) continue;

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color || "#ff0000")
        .setFooter({ text: `🔥 WAR BROADCAST | ${guild.name}` })
        .setTimestamp();

      try {
        await member.send({ embeds: [embed] });
        sent++;
        await new Promise(r => setTimeout(r, 1200));
      } catch {
        failed++;
      }
    }

    res.json({ success: true, sent, failed });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("🌐 Broadcast API Running");
});
