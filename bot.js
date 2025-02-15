require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = '7578384719:AAE7BWfKE5BQzQ1ExjFyHJ1zqespNccn-Jc';
const WEBHOOK_URL = 'https://supposed-turkey-phancongtri-db2ca112.koyeb.app';
const PORT = process.env.PORT || 8000;

const bot = new TelegramBot(TOKEN);
const app = express();
app.use(express.json());

// Kiểm tra server có đang chạy không
app.get("/", (req, res) => {
    res.send("OK - Bot is running!");
});

// Lắng nghe request từ Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
    console.log("📩 Nhận request từ Telegram:", req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Chạy server
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên port ${PORT}`);
});

// Đặt webhook
bot.setWebHook(`${WEBHOOK_URL}/bot${TOKEN}`);

const reminders = {}; // Lưu nhắc nhở theo chatId

// Menu tùy chọn
const menuKeyboard = {
    reply_markup: {
        keyboard: [
            [{ text: "/add" }, { text: "/reply" }],
            [{ text: "/all" }, { text: "/remove" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

// Lệnh /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Chào mừng bạn đến với bot nhắc nhở! Hãy sử dụng các lệnh sau:", menuKeyboard);
});

// Lệnh /add
bot.onText(/\/add (.+) (\d{2}:\d{2})? (\d{1,2})?/, (msg, match) => {
    const chatId = msg.chat.id;
    const content = match[1];
    const time = match[2] || "08:00";
    const day = match[3] ? parseInt(match[3]) : new Date().getDate();
    
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), day, time.split(':')[0], time.split(':')[1]);
    if (targetDate < now) targetDate.setMonth(targetDate.getMonth() + 1);

    if (!reminders[chatId]) reminders[chatId] = [];
    reminders[chatId].push({ content, time, day, date: targetDate });
    
    bot.sendMessage(chatId, `✅ Nhắc nhở: ${content} vào ${time} ngày ${day}`);
    setTimeout(() => bot.sendMessage(chatId, `🔔 Nhắc nhở: ${content}`), targetDate - now);
});

// Lệnh /reply
bot.onText(/\/reply (.+) (\d{1,2})/, (msg, match) => {
    const chatId = msg.chat.id;
    const content = match[1];
    const day = parseInt(match[2]);
    
    if (!reminders[chatId]) reminders[chatId] = [];
    reminders[chatId].push({ content, type: "monthly", day });
    
    bot.sendMessage(chatId, `✅ Nhắc nhở hàng tháng: ${content} vào ngày ${day}`);
    setInterval(() => {
        if (new Date().getDate() === day) bot.sendMessage(chatId, `🔔 Nhắc nhở: ${content}`);
    }, 86400000);
});

// Lệnh /all
bot.onText(/\/all/, (msg) => {
    const chatId = msg.chat.id;
    if (!reminders[chatId] || reminders[chatId].length === 0) {
        bot.sendMessage(chatId, "📋 Không có nhắc nhở nào.");
        return;
    }
    
    let text = "📋 Danh sách nhắc nhở:\n";
    reminders[chatId].forEach((r, i) => {
        text += `${i + 1}. ${r.content} - ${r.time || "08:00"} (Ngày ${r.day})\n`;
    });
    bot.sendMessage(chatId, text);
});

// Lệnh /remove
bot.onText(/\/remove (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const index = parseInt(match[1]) - 1;
    if (!reminders[chatId] || !reminders[chatId][index]) {
        bot.sendMessage(chatId, "❌ Không tìm thấy nhắc nhở này.");
        return;
    }
    const removed = reminders[chatId].splice(index, 1);
    bot.sendMessage(chatId, `✅ Đã xóa nhắc nhở: ${removed[0].content}`);
});
