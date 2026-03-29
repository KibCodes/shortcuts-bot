import { Client, EmbedBuilder, TextChannel } from 'discord.js';

/**
 * Notification Utility
 * Sends DMs to specified users when front changes occur
 * Also sends a notification to a designated channel
 */

/** User IDs to notify about front changes */
const NOTIFY_USER_IDS = [
    '1125844710511104030', // @doughmination.systems
    '1474568910736199825',
];

/** Channel notification config */
const NOTIFY_GUILD_ID = '1487301312830898419';
const NOTIFY_CHANNEL_ID = '1487529097998368952';

/**
 * Send a notification about a front change
 * triggeredBy is optional — omit for auto-detected (polled) changes
 */
export async function notifyFrontChange(
    client: Client,
    action: 'add' | 'remove',
    memberName: string,
    currentFronters: any[],
    triggeredBy?: { id: string; tag: string }
): Promise<void> {
    const frontersList = currentFronters.length > 0
        ? currentFronters.map((f: any) => `• ${f.display_name || f.name}`).join('\n')
        : 'None';

    const isAuto = !triggeredBy;
    const footerText = isAuto
        ? 'Auto-detected change'
        : `Triggered by ${triggeredBy!.tag}`;

    // --- DM embed ---
    const dmEmbed = new EmbedBuilder()
        .setColor(action === 'add' ? 0x57F287 : 0xFEE75C)
        .setTitle(action === 'add' ? '✅ Member Added to Front' : '➖ Member Removed from Front')
        .setDescription(
            action === 'add'
                ? `**${memberName}** has been added to the front.`
                : `**${memberName}** has been removed from the front.`
        )
        .addFields({ name: 'Current Fronters', value: frontersList })
        .setFooter({ text: footerText })
        .setTimestamp();

    // --- Public channel embed ---
    const channelEmbedBuilder = new EmbedBuilder()
        .setColor(action === 'add' ? 0x57F287 : 0xFEE75C)
        .setTitle(action === 'add' ? '👋 Front Updated — Member Added' : '👋 Front Updated — Member Removed')
        .setDescription(
            action === 'add'
                ? `**${memberName}** joined the front.`
                : `**${memberName}** left the front.`
        )
        .addFields({ name: 'Current Fronters', value: frontersList });

    if (isAuto) {
        channelEmbedBuilder.addFields({ name: 'Source', value: '🤖 Auto-detected change', inline: true });
    } else {
        channelEmbedBuilder.addFields({ name: 'Triggered by', value: `<@${triggeredBy!.id}>`, inline: true });
    }

    channelEmbedBuilder.setTimestamp();

    const channelEmbed = channelEmbedBuilder;

    // Send DMs
    for (const userId of NOTIFY_USER_IDS) {
        if (triggeredBy && userId === triggeredBy.id) {
            continue;
        }

        try {
            const user = await client.users.fetch(userId);
            await user.send({ embeds: [dmEmbed] });
            console.log(`✓ Sent front change notification to ${user.tag}`);
        } catch (error) {
            console.error(`Failed to send notification to user ${userId}:`, error);
        }
    }

    // Send to channel
    try {
        const guild = await client.guilds.fetch(NOTIFY_GUILD_ID);
        const channel = await guild.channels.fetch(NOTIFY_CHANNEL_ID);

        if (channel && channel.isTextBased()) {
            await (channel as TextChannel).send({ embeds: [channelEmbed] });
            console.log(`✓ Sent front change notification to channel #${channel.name}`);
        } else {
            console.error(`Notification channel ${NOTIFY_CHANNEL_ID} not found or is not a text channel`);
        }
    } catch (error) {
        console.error(`Failed to send notification to channel ${NOTIFY_CHANNEL_ID}:`, error);
    }
}

/**
 * Add a user to the notification list
 */
export function addNotifyUser(userId: string): boolean {
    if (!NOTIFY_USER_IDS.includes(userId)) {
        NOTIFY_USER_IDS.push(userId);
        return true;
    }
    return false;
}

/**
 * Remove a user from the notification list
 */
export function removeNotifyUser(userId: string): boolean {
    const index = NOTIFY_USER_IDS.indexOf(userId);
    if (index > -1) {
        NOTIFY_USER_IDS.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get the list of users being notified
 */
export function getNotifyUsers(): string[] {
    return [...NOTIFY_USER_IDS];
}