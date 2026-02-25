import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const PC_URL = 'https://uk.pcpartpicker.com/list/pJy2FP';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('pc')
        .setDescription('Get my PC Part Picker URL')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
            await interaction.reply(PC_URL);
        }
    }
};