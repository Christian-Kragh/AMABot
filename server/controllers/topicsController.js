
import { loadTopicStats, saveTopicStats } from '../data/topic-stats.js';


export async function getTopicsStats(request, response) {
    const topicStats = await loadTopicStats()
    const mostAskedTopic = findMostAskedTopic(topicStats)

    response.json({
        topicStats,
        mostAskedTopic
    })
}

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
    const topicStats = await loadTopicStats()

    for (const topic of Object.keys(topicStats)) {
        topicStats[topic] = 0
    }

    await saveTopicStats(topicStats)

    response.send()
};