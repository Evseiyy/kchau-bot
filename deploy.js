require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const commands = [

    new SlashCommandBuilder()
        .setName('созыв')
        .setDescription('Созыв участников'),

    new SlashCommandBuilder()
        .setName('мут')
        .setDescription('Выдать тайм-аут')
        .addUserOption(option =>
            option
                .setName('пользователь')
                .setDescription('Кого замутить')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('минуты')
                .setDescription('Время мута в минутах')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('причина')
                .setDescription('Причина мута')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('размут')
        .setDescription('Снять тайм-аут')
        .addUserOption(option =>
            option
                .setName('пользователь')
                .setDescription('Кого размутить')
                .setRequired(true)),

new SlashCommandBuilder()
    .setName('баланс')
    .setDescription('Посмотреть баланс'),

new SlashCommandBuilder()
    .setName('ежедневка')
    .setDescription('Получить ежедневную награду'),

new SlashCommandBuilder()
    .setName('магазин')
    .setDescription('Открыть магазин ролей'),

new SlashCommandBuilder()
    .setName('купить')
    .setDescription('Купить роль'),

new SlashCommandBuilder()
    .setName('инфо')
    .setDescription('Информация об экономике'),
new SlashCommandBuilder()
    .setName('топ')
    .setDescription('Топ по монетам'),

new SlashCommandBuilder()
    .setName('выговор')
    .setDescription('Выдать выговор')
    .addUserOption(option =>
        option
            .setName('нарушитель')
            .setDescription('Кому выдать')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('тип')
            .setDescription('Тип выговора')
            .setRequired(true)
            .addChoices(
                { name: 'Устный', value: 'устный' },
                { name: 'Строгий', value: 'строгий' }
            ))
    .addStringOption(option =>
        option
            .setName('причина')
            .setDescription('Причина')
            .setRequired(true))
    .addIntegerOption(option =>
        option
            .setName('срок')
            .setDescription('Срок оплаты в днях')
            .setRequired(true)),

new SlashCommandBuilder()
    .setName('оплатить')
    .setDescription('Оплатить выговор')
    .addStringOption(option =>
        option
            .setName('номер')
            .setDescription('Номер выговора, например 0001')
            .setRequired(true)),
new SlashCommandBuilder()
    .setName('ставка')
    .setDescription('Сделать ставку')
    .addIntegerOption(option =>
        option
            .setName('монеты')
            .setDescription('Сколько поставить')
            .setRequired(true)),
new SlashCommandBuilder()
    .setName('рулетка')
    .setDescription('Сыграть в рулетку')
    .addStringOption(option =>
        option
            .setName('цвет')
            .setDescription('Выберите цвет')
            .setRequired(true)
            .addChoices(
                { name: '🔴 Красное', value: 'red' },
                { name: '⚫ Черное', value: 'black' },
                { name: '🟢 Зеленое', value: 'green' }
            ))
    .addIntegerOption(option =>
        option
            .setName('монеты')
            .setDescription('Сколько поставить')
            .setRequired(true)),
new SlashCommandBuilder()
    .setName('выдать')
    .setDescription('Выдать монеты')
    .addUserOption(option =>
        option
            .setName('пользователь')
            .setDescription('Кому выдать')
            .setRequired(true))
    .addIntegerOption(option =>
        option
            .setName('монеты')
            .setDescription('Количество')
            .setRequired(true)),
new SlashCommandBuilder()
    .setName('очистить')
    .setDescription('Удалить сообщения')
    .addIntegerOption(option =>
        option
            .setName('количество')
            .setDescription('Сколько сообщений удалить')
            .setRequired(true)),
new SlashCommandBuilder()
    .setName('ферма')
    .setDescription('Собрать урожай')


].map(command => command.toJSON());

const rest = new REST({ version: '10' })
    .setToken(process.env.TOKEN);

(async () => {

    try {

        console.log('Регистрация команд...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Команды зарегистрированы!');

    } catch (error) {
        console.error(error);
    }

})();
