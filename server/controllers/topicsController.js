
import { loadTopicStats, saveTopicStats } from '../data/topic-stats.js';

export function findMostAskedTopic(stats) {
    let highestCount = 0;
    let mostAskedTopic = "";

    for (const stat of Object.entries(stats)) {
        const category = stat[0];
        const count = stat[1];

        if (count > highestCount) {
            highestCount = count;
            mostAskedTopic = category;
        }
    }

    return mostAskedTopic;
}

export async function deleteTopicStats(request, response) {
    let topicsStats = await loadTopicStats()

    for (const topic of topicsStats) {
        topic[1] = 0
    }

    await saveTopicStats()

    response.send()
};