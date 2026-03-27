import { Client, EmbedBuilder } from 'discord.js';

/**
 * Notification Utility
 * Sends DMs to specified users when front changes occur
 */

/** User IDs to notify about front changes */
const NOTIFY_USER_IDS = [
    '1125844710511104030', // @doughmination.systems
    '1474568910736199825',
];

/**
 * Send a notification about a front change
 */
export async function notifyFrontChange(
    client: Client,
    action: 'add' | 'remove',
    memberName: string,
    currentFronters: any[],
    triggeredBy: { id: string; tag: string }
): Promise<void> {
    const frontersList = currentFronters.length > 0
        ? currentFronters.map((f: any) => `• ${f.display_name || f.name}`).join('\n')
        : 'None';

    const embed = new EmbedBuilder()
        .setColor(action === 'add' ? 0x57F287 : 0xFEE75C) // Green for add, Yellow for remove
        .setTitle(action === 'add' ? '✅ Member Added to Front' : '➖ Member Removed from Front')
        .setDescription(
            action === 'add'
                ? `**${memberName}** has been added to the front.`
                : `**${memberName}** has been removed from the front.`
        )
        .addFields({
            name: 'Current Fronters',
            value: frontersList
        })
        .setFooter({ text: `Triggered by ${triggeredBy.tag}` })
        .setTimestamp();

    // Send DM to each user in the notify list
    for (const userId of NOTIFY_USER_IDS) {
        // Skip sending to the person who triggered the change
        if (userId === triggeredBy.id) {
            continue;
        }

        try {
            const user = await client.users.fetch(userId);
            await user.send({ embeds: [embed] });
            console.log(`✓ Sent front change notification to ${user.tag}`);
        } catch (error) {
            console.error(`Failed to send notification to user ${userId}:`, error);
            // Continue to next user even if one fails
        }
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
