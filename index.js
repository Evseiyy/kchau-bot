require('dotenv').config();

const farmCooldowns = {};
const fs = require('fs');
const voiceTimes = {};
const OWNER_ID = "962043905786908742";
function loadCoins() {
    if (!fs.existsSync('./coins.json')) {
        fs.writeFileSync('./coins.json', '{}');
    }

    return JSON.parse(
        fs.readFileSync('./coins.json', 'utf8')
    );
}

function getFarmXpRequired(level) {

    const xpTable = {
        0: 100,
        1: 200,
        2: 400,
        3: 800,
        4: 1600,
        5: 2000,
        6: 2500,
        7: 3000,
        8: 3500,
        9: 4000
    };

    return xpTable[level] || 4000;
}

function saveCoins(data) {
    fs.writeFileSync(
        './coins.json',
        JSON.stringify(data, null, 2)
    );
}

function loadWarnings() {
    if (!fs.existsSync('./warnings.json')) {
        fs.writeFileSync('./warnings.json', '{}');
    }

    return JSON.parse(
        fs.readFileSync('./warnings.json', 'utf8')
    );
}

function saveWarnings(data) {
    fs.writeFileSync(
        './warnings.json',
        JSON.stringify(data, null, 2)
    );
}

const {
    Client,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
]
});

// Роль для созыва
const ROLE_ID = "1521077406721507428";

// Админ + Модератор
const ALLOWED_ROLES = [
"1521089670706892901", // Админ
"1521077967588167841"  // Модератор
];

const SHOP_ROLES = {
    "ололо": { roleId: "1521087931106856992", price: 185 },
"превед": { roleId: "1521087848386924715", price: 370 },
"четкий": { roleId: "1521083334011125881", price: 370 },
"серега": { roleId: "1521081388416241764", price: 555 },
"подозрительный": { roleId: "1521081685507309678", price: 555 },
"сигма": { roleId: "1521082723106689074", price: 648 },
"гриб": { roleId: "1521087677938794627", price: 740 },
"толик": { roleId: "1521087770481786951", price: 740 },
"чилл": { roleId: "1521082610623713470", price: 925 },
"аура": { roleId: "1521082219324637215", price: 925 },
"лудоман": { roleId: "1521082073253941339", price: 1110 },
"боян": { roleId: "1521101509406883961", price: 1850 },
"карась": { roleId: "1521101588196753551", price: 2775 },
"тракторист": { roleId: "1521101653091029163", price: 4625 },
"легенда": { roleId: "1521101717842821233", price: 9250 },
"король": { roleId: "1521101781684191344", price: 18500 },

"пахан": {
    roleId: "1521449870483783690",
    price: 2000
},

"100500": {
    roleId: "1521449624777523241",
    price: 3000
}
};

client.once(Events.ClientReady, () => {
console.log(`Бот запущен как ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

   const adminCommands = [
    "созыв",
    "мут",
    "размут",
    "выговор"
];

if (adminCommands.includes(interaction.commandName)) {

    const hasAccess = ALLOWED_ROLES.some(roleId =>
        interaction.member.roles.cache.has(roleId)
    );

    if (!hasAccess) {
        return interaction.reply({
            content: "❌ У вас нет доступа к этой команде.",
            ephemeral: true
        });
    }

}

    // СОЗЫВ
    if (interaction.commandName === "созыв") {

        return interaction.reply({
            content: "🚨 СОЗЫВ!\n\n<@&" + ROLE_ID + ">\n\nПросьба зайти в голосовой канал.",
            allowedMentions: {
                roles: [ROLE_ID]
            }
        });

    }

    // МУТ
    if (interaction.commandName === "мут") {

        const target = interaction.options.getMember("пользователь");
        const minutes = interaction.options.getInteger("минуты");
        const reason = interaction.options.getString("причина");

        if (!target) {
            return interaction.reply({
                content: "❌ Пользователь не найден.",
                ephemeral: true
            });
        }

        await target.timeout(
            minutes * 60 * 1000,
            reason
        );

        return interaction.reply({
            content: "🔇 " + target + " получил мут на " + minutes + " мин.\nПричина: " + reason
        });

    }

    // РАЗМУТ
    if (interaction.commandName === "размут") {

        const target = interaction.options.getMember("пользователь");

        if (!target) {
            return interaction.reply({
                content: "❌ Пользователь не найден.",
                ephemeral: true
            });
        }

        await target.timeout(null);

        return interaction.reply({
            content: "🔓 " + target + " был размучен."
        });

    }

if (interaction.commandName === "выговор") {

    const target = interaction.options.getMember("нарушитель");
    const type = interaction.options.getString("тип");
    const reason = interaction.options.getString("причина");
    const days = interaction.options.getInteger("срок");

    const warnings = loadWarnings();

    if (!warnings.lastId) warnings.lastId = 0;
    if (!warnings.warnings) warnings.warnings = {};

    warnings.lastId++;

    const warnId =
        String(warnings.lastId).padStart(4, "0");

    let fine = 100;

    if (type === "строгий") {
        fine = 300;
    }

    warnings.warnings[warnId] = {
        userId: target.id,
        type: type,
        reason: reason,
        fine: fine,
        days: days,
        paid: false,
        date: Date.now()
    };

    saveWarnings(warnings);

    let oralCount = 0;
    let strictCount = 0;

    for (const id in warnings.warnings) {

        const warn = warnings.warnings[id];

        if (
            warn.userId === target.id &&
            !warn.paid
        ) {
            if (warn.type === "устный") oralCount++;
            if (warn.type === "строгий") strictCount++;
        }
    }

    // Роли устных
    const ORAL_1 = "1521120878996492509";
    const ORAL_2 = "1521120987783888937";
    const ORAL_3 = "1521121068730028063";

    // Роли строгих
    const STRICT_1 = "1521121179581288568";
    const STRICT_2 = "1521121280584192120";

    await target.roles.remove([
        ORAL_1,
        ORAL_2,
        ORAL_3,
        STRICT_1,
        STRICT_2
    ]).catch(() => {});

    if (oralCount === 1)
        await target.roles.add(ORAL_1).catch(() => {});

    if (oralCount === 2)
        await target.roles.add(ORAL_2).catch(() => {});

    if (oralCount >= 3)
        await target.roles.add(ORAL_3).catch(() => {});

    if (strictCount === 1)
        await target.roles.add(STRICT_1).catch(() => {});

    if (strictCount >= 2)
        await target.roles.add(STRICT_2).catch(() => {});

    return interaction.reply({
        content:
`🚨 ВЫГОВОР ВЫДАН

🆔 Номер: #${warnId}
👤 Нарушитель: ${target}

📄 Тип: ${type}
📋 Причина: ${reason}

💰 Штраф: ${fine} 🪙
⏳ Срок оплаты: ${days} дн.

⚠️ Устных: ${oralCount}/3
🚫 Строгих: ${strictCount}/2`
    });

}

if (interaction.commandName === "ферма") {

    if (
        farmCooldowns[userId] &&
        Date.now() - farmCooldowns[userId] < 3000
    ) {
        return interaction.reply({
            content: "⏳ Подождите 3 секунды.",
            ephemeral: true
        });
    }

    farmCooldowns[userId] = Date.now();

    const coins = loadCoins();

 if (!coins[userId]) {
    coins[userId] = {
        coins: 0,
        lastDaily: 0,
        farmXp: 0,
        farmLevel: 0
    };
}

if (coins[userId].farmXp === undefined)
    coins[userId].farmXp = 0;

if (coins[userId].farmLevel === undefined)
    coins[userId].farmLevel = 0;

    const level =
    coins[userId].farmLevel || 0;

const minReward =
    1 + level;

const maxReward =
    5 + level;

const reward =
    Math.floor(
        Math.random() *
        (maxReward - minReward + 1)
    ) + minReward;

    coins[userId].coins += reward;
coins[userId].farmXp += 1;

let levelUpMessage = "";

const requiredXp =
    getFarmXpRequired(
        coins[userId].farmLevel
    );

if (
    coins[userId].farmLevel < 10 &&
    coins[userId].farmXp >= requiredXp
) {

    coins[userId].farmLevel++;
    coins[userId].farmXp = 0;

    if (coins[userId].farmLevel === 10) {

        await interaction.member.roles.add("1521872300696404039");

        levelUpMessage =
`\n\n👑 Поздравляем!

Вы достигли максимального уровня фермы!

Получена роль:
👑 Король урожая`;

    } else {

        levelUpMessage =
`\n\n🎉 Новый уровень фермы!

🚜 Уровень:
${coins[userId].farmLevel}/10`;

    }
}

    saveCoins(coins);

    return interaction.reply({
    content:
`🌾 Урожай собран!

💰 Получено: ${reward} 🪙

🚜 Уровень:
${coins[userId].farmLevel}/10

⭐ Опыт:
${coins[userId].farmXp}/${getFarmXpRequired(coins[userId].farmLevel)}

💳 Баланс:
${coins[userId].coins} 🪙${levelUpMessage}`,
    ephemeral: true
});

}

if (interaction.commandName === "купить") {

    const menu = new StringSelectMenuBuilder()
        .setCustomId('buy_role')
        .setPlaceholder('Выберите роль')
        .addOptions([
            {
                label: '⚡ Ололо',
                description: '250 монет',
                value: 'ололо'
            },
            {
                label: '🤫 Подозрительный тип',
                description: '300 монет',
                value: 'подозрительный'
            },

            {
                label: '🐻 Превед Медвед',
                description: '350 монет',
                value: 'превед'
            },
            {
                label: '🤫 Сигма бой',
                description: '400 монет',
                value: 'сигма'
            },
            {
                label: '😎 Чёткий пацан',
                description: '500 монет',
                value: 'четкий'
            },

            {
                label: '🚜 Серёга на тракторе',
                description: '750 монет',
                value: 'серега'
            },
         
            {
                label: '🍄 Это мой гриб',
                description: '800 монет',
                value: 'гриб'
            },
            {
                label: '🚪 Толик, это подъезд',
                description: '1000 монет',
                value: 'толик'
            },
            {
                label: '🌴 Чилл гай',
                description: '1200 монет',
                value: 'чилл'
            },
            {
                label: '✨ Аура +1000',
                description: '2000 монет',
                value: 'аура'
            }
            ,
{
    label: '🎰 Лудоман',
    description: '3500 монет',
    value: 'лудоман'
},
{
    label: '🗿 Боян',
    description: '1000 монет',
    value: 'боян'
},
{
    label: '🐟 Карась дипломат',
    description: '2000 монет',
    value: 'карась'
},
{
    label: '🚜 Тракторист Всея КЧАУ',
    description: '2500 монет',
    value: 'тракторист'
},

{
    label: '🐺 Пахан',
    description: '3000 монет',
    value: 'пахан'
},
{
    label: '🚬 +100500',
    description: '100500 монет',
    value: '100500'
},

{
    label: '🏆 Легенда КЧАУ',
    description: '7000 монет',
    value: 'легенда'
},
{
    label: '👑 Король КЧАУ',
    description: '12000 монет',
    value: 'король'
}
        ]);

    const row = new ActionRowBuilder()
        .addComponents(menu);

    return interaction.reply({
        content: '🛍️ Выберите роль для покупки:',
        components: [row],
        ephemeral: true
    });

}
if (interaction.commandName === "магазин") {

    return interaction.reply({
        content:
`🛒 **МАГАЗИН КЧАУ**

🎭 **Обычные роли**

⚡ Ололо — 250 🪙
🐻 Превед Медвед — 350 🪙
😎 Чёткий пацан — 500 🪙
🚜 Серёга на тракторе — 750 🪙
🤫 Подозрительный тип — 300 🪙
🤫 Сигма бой — 400 🪙
🍄 Это мой гриб — 800 🪙
🚪 Толик, это подъезд — 1000 🪙
🌴 Чилл гай — 1200 🪙
✨ Аура +1000 — 2000 🪙
🎰 Лудоман — 3500 🪙

💎 **Редкие роли**

🗿 Боян — 1000 🪙
🐟 Карась дипломат — 2000 🪙
🚜 Тракторист Всея КЧАУ — 2500 🪙
🐺 Пахан — 3000 🪙
🚬 +100500 — 100500 🪙

👑 **ПРЕМИУМ РОЛИ**

🏆 Легенда КЧАУ — 7000 🪙
👑 Король КЧАУ — 12000 🪙

💡 Используйте /купить для покупки роли.`,
        ephemeral: true
    });

}

if (interaction.commandName === "очистить") {

    const amount =
        interaction.options.getInteger("количество");

if (!interaction.member.permissions.has("ManageMessages")) {
    return interaction.reply({
        content: "❌ У вас нет прав.",
        ephemeral: true
    });
}

    if (amount < 1 || amount > 100) {
        return interaction.reply({
            content: "❌ Можно удалить от 1 до 100 сообщений.",
            ephemeral: true
        });
    }

    await interaction.channel.bulkDelete(amount, true);

    return interaction.reply({
        content: `✅ Удалено ${amount} сообщений.`,
        ephemeral: true
    });
}

if (interaction.commandName === "рулетка") {

    const color =
        interaction.options.getString("цвет");

    const amount =
        interaction.options.getInteger("монеты");

    if (amount < 50) {
        return interaction.reply({
            content: "❌ Минимальная ставка — 50 🪙",
            ephemeral: true
        });
    }

    const coins = loadCoins();

    if (!coins[interaction.user.id]) {
        coins[interaction.user.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    if (coins[interaction.user.id].coins < amount) {
        return interaction.reply({
            content: "❌ Недостаточно монет.",
            ephemeral: true
        });
    }

    const roll = Math.random();

    let result;

    if (roll < 0.475) {
        result = "red";
    } else if (roll < 0.95) {
        result = "black";
    } else {
        result = "green";
    }

    coins[interaction.user.id].coins -= amount;

    let win = 0;

    if (color === result) {

        if (result === "green") {
            win = amount * 14;
        } else {
            win = amount * 2;
        }

        coins[interaction.user.id].coins += win;

        saveCoins(coins);

        return interaction.reply({
            content:
`🎰 РУЛЕТКА

Шарик остановился на:

${result === "red" ? "🔴 Красном" :
result === "black" ? "⚫ Черном" :
"🟢 Зеленом"}

🎉 Вы выиграли!

💰 Выигрыш: ${win} 🪙
💳 Баланс: ${coins[interaction.user.id].coins} 🪙`,
        });

    }

    saveCoins(coins);

    return interaction.reply({
        content:
`🎰 РУЛЕТКА

Шарик остановился на:

${result === "red" ? "🔴 Красном" :
result === "black" ? "⚫ Черном" :
"🟢 Зеленом"}

💥 Вы проиграли!

💸 Потеряно: ${amount} 🪙
💳 Баланс: ${coins[interaction.user.id].coins} 🪙`,
ephemeral: true
    });

}

if (interaction.commandName === "фермапрофиль") {

    const userId = interaction.user.id;

    const coins = loadCoins();

if (!coins[userId]) {
    coins[userId] = {
        coins: 0,
        lastDaily: 0,
        farmXp: 0,
        farmLevel: 0
    };
}

if (coins[userId].farmXp === undefined)
    coins[userId].farmXp = 0;

if (coins[userId].farmLevel === undefined)
    coins[userId].farmLevel = 0;

    return interaction.reply({
        content:
`🌾 ФЕРМЕРСКИЙ ПРОФИЛЬ

🚜 Уровень:
${coins[userId].farmLevel}/10

⭐ Опыт:
${coins[userId].farmXp}/${getFarmXpRequired(coins[userId].farmLevel)}

💰 Доход:
${1 + coins[userId].farmLevel}-${5 + coins[userId].farmLevel} 🪙`,
        ephemeral: true
    });
}

if (interaction.commandName === "баланс") {

    const coins = loadCoins();

    if (!coins[interaction.user.id]) {
        coins[interaction.user.id] = {
            coins: 0,
            lastDaily: 0
        };

        saveCoins(coins);
    }

    return interaction.reply({
    content: "💰 Ваш баланс: **" + coins[interaction.user.id].coins + " 🪙**",
    ephemeral: true
});

}

if (interaction.commandName === "топ") {

    const coins = loadCoins();

    const sorted = Object.entries(coins)
        .sort((a, b) => b[1].coins - a[1].coins)
        .slice(0, 10);

    let text = "🏆 Топ богачей КЧАУ\n\n";

    for (let i = 0; i < sorted.length; i++) {

        const userId = sorted[i][0];
        const balance = sorted[i][1].coins;

        let username = "Неизвестный";

        try {
            const user = await client.users.fetch(userId);
            username = user.username;
        } catch {}

        text += `${i + 1}. ${username} — ${balance} 🪙\n`;
    }

    return interaction.reply({
        content: text,
        ephemeral: true
    });
}

if (interaction.commandName === "ставка") {

    const amount =
        interaction.options.getInteger("монеты");

if (amount < 50) {
    return interaction.reply({
        content: "❌ Минимальная ставка — 50 🪙",
        ephemeral: true
    });
}

    const coins = loadCoins();

    if (!coins[interaction.user.id]) {
        coins[interaction.user.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    if (amount <= 0) {
        return interaction.reply({
            content: "❌ Укажите корректную сумму.",
            ephemeral: true
        });
    }

    if (coins[interaction.user.id].coins < amount) {
        return interaction.reply({
            content: "❌ Недостаточно монет.",
            ephemeral: true
        });
    }

    const chance = Math.random();

   coins[interaction.user.id].coins -= amount;

if (chance < 0.40) {

    coins[interaction.user.id].coins += amount * 2;

        saveCoins(coins);

        return interaction.reply({
            content:
`🎰 КАЗИНО

🎉 Вы выиграли!

💰 Ставка: ${amount} 🪙
🏆 Выигрыш: +${amount * 2} 🪙

Баланс: ${coins[interaction.user.id].coins} 🪙`,
            ephemeral: true
        });

    } else {

        coins[interaction.user.id].coins -= amount;

        saveCoins(coins);

        return interaction.reply({
            content:
`🎰 КАЗИНО

💥 Вы проиграли!

💸 Потеряно: ${amount} 🪙

Баланс: ${coins[interaction.user.id].coins} 🪙`,
            ephemeral: true
        });

    }

}

if (interaction.commandName === "выдать") {

    if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
            content: "❌ Только владелец может использовать эту команду.",
            ephemeral: true
        });
    }

    const user =
        interaction.options.getUser("пользователь");

    const amount =
        interaction.options.getInteger("монеты");

    const coins = loadCoins();

    if (!coins[user.id]) {
        coins[user.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    coins[user.id].coins += amount;

    saveCoins(coins);

    return interaction.reply({
        content:
            `✅ Выдано ${amount} 🪙 пользователю ${user}\n` +
            `Новый баланс: ${coins[user.id].coins} 🪙`,
        ephemeral: true
    });
}

if (interaction.commandName === "ежедневка") {

    const coins = loadCoins();

    if (!coins[interaction.user.id]) {
        coins[interaction.user.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (now - coins[interaction.user.id].lastDaily < cooldown) {

        const remaining =
            cooldown -
            (now - coins[interaction.user.id].lastDaily);

        const hours = Math.floor(
            remaining / 1000 / 60 / 60
        );

        return interaction.reply({
            content:
                "⏳ Ежедневку уже забрали.\nОсталось: " +
                hours +
                " ч.",
            ephemeral: true
        });
    }

    coins[interaction.user.id].coins += 30;
    coins[interaction.user.id].lastDaily = now;

    saveCoins(coins);

 return interaction.reply({
    content:
        "🎁 Вы получили **30 🪙**!\nБаланс: **" +
        coins[interaction.user.id].coins +
        " 🪙**",
    ephemeral: true
});

}


} catch (error) {

    console.error(error);

    if (!interaction.replied) {
        await interaction.reply({
            content: "❌ Произошла ошибка.",
            ephemeral: true
        });
    }

}

});

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId !== "buy_role") return;

    const roleData = SHOP_ROLES[interaction.values[0]];

    const coins = loadCoins();


    if (!coins[interaction.user.id]) {
        coins[interaction.user.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    if (coins[interaction.user.id].coins < roleData.price) {
        return interaction.reply({
            content: "❌ Недостаточно монет.",
            ephemeral: true
        });
    }

    const member = interaction.member;

    if (member.roles.cache.has(roleData.roleId)) {
        return interaction.reply({
            content: "❌ У вас уже есть эта роль.",
            ephemeral: true
        });
    }

    coins[interaction.user.id].coins -= roleData.price;

    saveCoins(coins);

    await member.roles.add(roleData.roleId);

    return interaction.reply({
        content:
            "✅ Роль куплена!\nОсталось: **" +
            coins[interaction.user.id].coins +
            " 🪙**",
        ephemeral: true
    });

});

client.on('messageCreate', message => {

    if (message.author.bot) return;

    const coins = loadCoins();

    if (!coins[message.author.id]) {
        coins[message.author.id] = {
            coins: 0,
            lastDaily: 0
        };
    }

    coins[message.author.id].coins += 3;

    saveCoins(coins);

});

client.on('voiceStateUpdate', (oldState, newState) => {

    const userId = newState.id;

    // Зашёл в войс
    if (!oldState.channelId && newState.channelId) {

        voiceTimes[userId] = setInterval(() => {

            const coins = loadCoins();

            if (!coins[userId]) {
                coins[userId] = {
                    coins: 0,
                    lastDaily: 0
                };
            }

            coins[userId].coins += 10;

            saveCoins(coins);

            console.log(
                `+10 монет за войс ${userId}`
            );

        }, 10 * 60 * 1000);

    }

    // Вышел из войса
    if (oldState.channelId && !newState.channelId) {

        if (voiceTimes[userId]) {
            clearInterval(voiceTimes[userId]);
            delete voiceTimes[userId];
        }

    }

});

client.login(process.env.TOKEN);
