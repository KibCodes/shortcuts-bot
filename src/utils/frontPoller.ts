import { Client } from 'discord.js';
import { doughAPI } from './doughAPI';
import { notifyFrontChange } from './notifUtil';

const POLL_INTERVAL_MS = 60_000; // 1 minute

/**
 * Tracks the last known set of fronter IDs so we can diff against new results.
 * null means we haven't done an initial fetch yet.
 */
let lastFronterIds: Set<string> | null = null;
let pollTimer: NodeJS.Timeout | null = null;

/**
 * Start the front poller. Call this once after the bot is ready.
 */
export function startFrontPoller(client: Client): void {
    if (pollTimer) {
        console.warn('Front poller is already running.');
        return;
    }

    console.log(`✓ Front poller started (interval: ${POLL_INTERVAL_MS / 1000}s)`);

    // Do an initial silent fetch to seed the known state
    // so the first poll doesn't fire false-positive notifications on startup
    seedInitialState();

    pollTimer = setInterval(() => pollFront(client), POLL_INTERVAL_MS);
}

/**
 * Stop the front poller.
 */
export function stopFrontPoller(): void {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        console.log('Front poller stopped.');
    }
}

/**
 * Silently fetch and store the current fronters on startup.
 */
async function seedInitialState(): Promise<void> {
    try {
        const data = await doughAPI.getFronters();
        const members: any[] = data.members || [];
        lastFronterIds = new Set(members.map((m: any) => m.id));
        console.log(`✓ Front poller seeded with ${lastFronterIds.size} fronter(s)`);
    } catch (error) {
        console.error('Front poller: failed to seed initial state:', error);
        // Leave lastFronterIds as null — first poll will seed it instead
    }
}

/**
 * Poll the API, diff against the last known state, and notify on changes.
 */
async function pollFront(client: Client): Promise<void> {
    let currentMembers: any[];

    try {
        const data = await doughAPI.getFronters();
        currentMembers = data.members || [];
    } catch (error) {
        console.error('Front poller: failed to fetch fronters:', error);
        return;
    }

    const currentIds = new Set(currentMembers.map((m: any) => m.id));

    // First successful fetch after a failed seed — just store and move on
    if (lastFronterIds === null) {
        lastFronterIds = currentIds;
        console.log(`Front poller: initial state set (${currentIds.size} fronter(s))`);
        return;
    }

    // Diff: find added and removed members
    const addedIds = [...currentIds].filter(id => !lastFronterIds!.has(id));
    const removedIds = [...lastFronterIds].filter(id => !currentIds.has(id));

    if (addedIds.length === 0 && removedIds.length === 0) {
        // No change — do nothing
        return;
    }

    console.log(`Front poller: detected change — +${addedIds.length} / -${removedIds.length}`);

    // Build a quick id→member lookup from the current snapshot
    const memberById = new Map(currentMembers.map((m: any) => [m.id, m]));

    // We also need the previous snapshot to look up removed members' names
    // Re-fetch all members list for name resolution of removed members
    let allMembers: any[] = [];
    try {
        allMembers = await doughAPI.getMembers();
    } catch {
        // If this fails, we'll fall back to the ID string for removed members
    }
    const allMemberById = new Map(allMembers.map((m: any) => [m.id, m]));

    // Fire notifications for each added member
    for (const id of addedIds) {
        const member = memberById.get(id) || allMemberById.get(id);
        const name = member ? (member.display_name || member.name) : id;
        try {
            await notifyFrontChange(client, 'add', name, currentMembers);
        } catch (error) {
            console.error(`Front poller: failed to notify for add of ${name}:`, error);
        }
    }

    // Fire notifications for each removed member
    for (const id of removedIds) {
        const member = allMemberById.get(id);
        const name = member ? (member.display_name || member.name) : id;
        try {
            await notifyFrontChange(client, 'remove', name, currentMembers);
        } catch (error) {
            console.error(`Front poller: failed to notify for remove of ${name}:`, error);
        }
    }

    // Update last known state
    lastFronterIds = currentIds;
}