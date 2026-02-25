import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('pc')
        .setDescription('Get PC Specs'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`My PC specs are at: https://uk.pcpartpicker.com/list/pJy2FP`);
    }
};