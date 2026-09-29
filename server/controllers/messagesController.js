
import { loadAnswers } from '../data/answers.js';
import { loadMessages, saveMessages } from '../data/messages.js';
import { loadTopicStats, saveTopicStats } from '../data/topic-stats.js';
import { findMostAskedTopic } from '../controllers/topicsController.js'


export async function getAllMessages(request, response) {
    const messages = await loadMessages()

    response.json(messages)
};


function sanitizeQuestion(input) {
    return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

export async function createMessage(request, response) {
    const messages = await loadMessages()
    const answers = await loadAnswers()
    // const question = request.body.question;
    const topicStats = await loadTopicStats();
    const rawQuestion = request.body.question;
    const question = sanitizeQuestion(rawQuestion).trim();

    if (!question) {
        response.status(400).json({ error: "Skriv et spørgsmål, før du sender" })
    }
    else {

        const message = { type: "question", text: escapeHtml(question), createdAt: new Date().toISOString() }
        messages.push(message)

        const result = findBestAnswer(question, answers)
        const answerMessage = { type: "answer", text: escapeHtml(result.answer), createdAt: new Date().toISOString() }
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

        response.status(201).json({ question: message, answers: answerMessage, topicStats, mostAskedTopic })
    }
};

export async function deleteMessages(request, response) {
    await saveMessages([])

    response.status(204).send()
};

function countMatches(keywords, normalizedQuestion) {
    const matches = keywords.filter((keyword) =>
        normalizedQuestion.includes(keyword)
    );

    return matches.length;
}

// function findAnswer(question) {
//     const normalizedQuestion = question.toLowerCase();

//     for (const answerGroup of answers) {

//         const randomIndex = Math.floor(Math.random() * answerGroup.answers.length);
//         const hasMatch = answerGroup.keywords.some((keyword) => normalizedQuestion.includes(keyword));

//         if (hasMatch) {
//             return answerGroup.answers[randomIndex];
//         }
//     }

//     return "Det kender jeg ikke svaret på endnu.";
// }

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


function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

