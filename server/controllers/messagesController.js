
import { loadAnswers } from '../data/answers.js';
import { loadMessages, saveMessages } from '../data/messages.js';
import { loadTopicStats, saveTopicStats } from '../data/topic-stats.js';


export async function getAllMessages(request, response) {
    const messages = await loadMessages()

    response.json(messages)
};

export async function createMessage(request, response) {
    const messages = await loadMessages()
    const answers = await loadAnswers()
    const question = request.body.question.trim();
    const topicStats = await loadTopicStats();
    // const rawQuestion = request.body.question;
    // const question = sanitizeQuestion(rawQuestion).trim();
    let error = "";

    if (!question) {
        response.json({ error: "Skriv et spørgsmål, før du sender" })
        return
    }

    const message = { type: "question", text: question, createdAt: new Date().toISOString() }
    messages.push(message)

    const result = findBestAnswer(question, answers)
    const answerMessage = { type: "answer", text: result.answer, createdAt: new Date().toISOString() }
    messages.push(answerMessage)


    if (result.category) {
        topicStats[result.category] = topicStats[result.category] + 1;
    }
    else {
        topicStats.ukendt = topicStats.ukendt + 1;
    }

    await saveTopicStats(topicStats);
    await saveMessages(messages)
    const mostAskedTopic = findMostAskedTopic(topicStats);


    response.json({ question: message, answers: answerMessage, topicStats, mostAskedTopic })
};

export async function deleteMessages(request, response) {
    await saveMessages([])

    response.send()
};

function countMatches(keywords, normalizedQuestion) {
    const matches = keywords.filter((keyword) =>
        normalizedQuestion.includes(keyword)
    );

    return matches.length;
}

function findAnswer(question) {
    const normalizedQuestion = question.toLowerCase();

    for (const answerGroup of answers) {

        const randomIndex = Math.floor(Math.random() * answerGroup.answers.length);
        const hasMatch = answerGroup.keywords.some((keyword) => normalizedQuestion.includes(keyword));

        if (hasMatch) {
            return answerGroup.answers[randomIndex];
        }
    }

    return "Det kender jeg ikke svaret på endnu.";
}

function findBestAnswer(question, answers) {
    const normalizedQuestion = question.toLowerCase();
    let bestScore = 0;
    let bestAnswer = "Det kender jeg ikke svaret på endnu.";
    let bestCategory = "";

    for (const answerGroup of answers) {

        const score = countMatches(answerGroup.keywords, normalizedQuestion);

        if (score > bestScore) {
            bestScore = score;
            bestAnswer = answerGroup.answers;
            bestCategory = answerGroup.category;
        }
    }

    if (Array.isArray(bestAnswer)) {
        const randomIndex = Math.floor(Math.random() * bestAnswer.length);
        bestAnswer = bestAnswer[randomIndex];
    }

    return {
        answer: bestAnswer,
        category: bestCategory
    };
}

function sanitizeQuestion(input) {
    return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

//Måske denne kan flyttes til sin egen controller?
function findMostAskedTopic(stats) {
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