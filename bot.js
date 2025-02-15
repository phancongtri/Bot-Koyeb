const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = '7578384719:AAE7BWfKE5BQzQ1ExjFyHJ1zqespNccn-Jc';
const WEBHOOK_URL = 'https://supposed-turkey-phancongtri-db2ca112.koyeb.app';
const PORT = process.env.PORT || 8000;

const bot = new TelegramBot(TOKEN, { webHook: true });
const app = express();
app.use(express.json());

// Healthcheck để Koyeb xác nhận bot đang chạy
app.get("/", (req, res) => {
    res.send("✅ OK - Server is running!");
});
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

// Xử lý webhook từ Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
    console.log("📩 Nhận request từ Telegram:", req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Lắng nghe cổng để server không bị đóng
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên port ${PORT}`);
    bot.setWebHook(`${WEBHOOK_URL}/bot${TOKEN}`);
});
