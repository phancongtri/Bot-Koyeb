require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = '7578384719:AAE7BWfKE5BQzQ1ExjFyHJ1zqespNccn-Jc';
const WEBHOOK_URL = 'https://supposed-turkey-phancongtri-db2ca112.koyeb.app';
const PORT = process.env.PORT || 8000;

const bot = new TelegramBot(TOKEN, { webHook: true });
const app = express();
app.use(express.json());

// Route kiểm tra server đang chạy
app.get("/", (req, res) => {
    res.send("✅ Server is running! Koyeb is OK!");
});

// Route webhook cho Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
    console.log("📩 Nhận request từ Telegram:", req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Lắng nghe cổng để bot không bị timeout
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên port ${PORT}`);
    bot.setWebHook(`${WEBHOOK_URL}/bot${TOKEN}`);
});
