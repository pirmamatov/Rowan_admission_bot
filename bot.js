const { Telegraf } = require('telegraf');
require('dotenv').config();
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);

const users = {};

// Ism formatini tekshirish funksiyasi
function isValidName(name) {
    return /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(name);
}

// Telefon raqam formatini tekshirish funksiyasi
function isValidPhone(phone) {
    return /^\+998\d{9}$/.test(phone);
}

// Foydalanuvchilar ma'lumotlarini saqlash
function saveUserData() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Start komandasi
bot.start((ctx) => {
    const userId = ctx.from.id;
    if (!users[userId] || users[userId].step !== 'completed') {
        users[userId] = { step: 'name' };
        ctx.reply("Salom! Ro‘yxatdan o‘tish uchun ism-familyangizni kiriting (Masalan: 'Ali Valiyev'):");
    } else {
        sendMainMenu(ctx);
    }
});

bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    if (!users[userId]) return;
    
    if (users[userId].step === 'name') {
        if (!isValidName(ctx.message.text)) {
            return ctx.reply("❌ Iltimos, ism-familiyangizni to‘g‘ri formatda kiriting! (Masalan: 'Ali Valiyev')");
        }
        users[userId].name = ctx.message.text;
        users[userId].step = 'phone';
        ctx.reply("Rahmat! Endi telefon raqamingizni kiriting yoki pastdagi tugmani bosing:", {
            reply_markup: {
                keyboard: [[{ text: "📞 Telefon raqamni yuborish", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (users[userId].step === 'phone') {
        if (!isValidPhone(ctx.message.text)) {
            return ctx.reply("❌ Iltimos, telefon raqamingizni +998 bilan boshlanadigan formatda kiriting! (Masalan: +998901234567)");
        }
        users[userId].phone = ctx.message.text;
        users[userId].step = 'completed';
        saveUserData();
        sendMainMenu(ctx);
    }
});

bot.on('contact', (ctx) => {
    const userId = ctx.from.id;
    if (users[userId]?.step === 'phone') {
        users[userId].phone = `+${ctx.message.contact.phone_number}`;
        users[userId].step = 'completed';
        saveUserData();
        sendMainMenu(ctx);
    }
});

function sendMainMenu(ctx) {
    ctx.reply("Rahmat! Endi quyidagi bo‘limlardan foydalanishingiz mumkin:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Qabul jarayoni", callback_data: "qabul" }],
                [{ text: "Fakultetlar", callback_data: "fakultetlar" }],
                [{ text: "Yo‘nalishlar", callback_data: "yonalishlar" }],
                [{ text: "Kerakli hujjatlar", callback_data: "hujjatlar" }],
                [{ text: "Admin bilan bog‘lanish", callback_data: "admin" }]
            ]
        }
    });
}

bot.on('callback_query', (ctx) => {
    const data = ctx.callbackQuery.data;
    handleCommand(ctx, data);
});

bot.command(['qabul', 'fakultetlar', 'yonalishlar', 'hujjatlar', 'admin'], (ctx) => {
    handleCommand(ctx, ctx.message.text.slice(1));
});

function handleCommand(ctx, command) {
    if (command === 'qabul') {
        ctx.reply("📌 Universitet qabuli davom etmoqda! Hujjat topshirish muddati: 1-avgustdan 30-avgustgacha.");
    } else if (command === 'fakultetlar') {
        ctx.reply("🎓 Bizning universitetimiz quyidagi fakultetlarga ega:\n\n1️⃣ Axborot texnologiyalari\n2️⃣ Xalqaro munosabatlar\n3️⃣ Iqtisodiyot\n4️⃣ Huquqshunoslik\n5️⃣ Muhandislik");
    } else if (command === 'yonalishlar') {
        ctx.reply("📚 Yo‘nalishlar haqida batafsil ma’lumot tez orada mavjud bo‘ladi!");
    } else if (command === 'hujjatlar') {
        ctx.reply("📄 Universitetga qabul uchun kerakli hujjatlar:\n✅ Attestat yoki diplom\n✅ Pasport yoki ID karta\n✅ 3x4 hajmli fotosuratlar (6 dona)");
    } else if (command === 'admin') {
        ctx.reply("☎️ Admin bilan bog‘lanish uchun: +998 90 123 45 67\n📧 Email: admissions@example.com\n📍 Manzil: Toshkent, Universitet ko‘chasi, 12-uy");
    }
}

// Botni ishga tushirish
bot.launch();
console.log("✅ Telegram bot ishga tushdi!");
