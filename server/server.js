
import express from "express";
// import { answers } from "./data/answers.js";
import fs from "node:fs/promises"

const app = express();
const port = 3000;

app.use(express.json())

async function loadMessages() {
    const data = await fs.readFile("./data/messages.json", "utf-8");
    const messages = JSON.parse(data);

    for (const message of messages) {
        message.createdAt = new Date(message.createdAt);
    }

    return messages;
}

async function saveMessages(messages) {
    const json = JSON.stringify(messages, null, 2);
    await fs.writeFile("./data/messages.json", json);
}

async function loadTopicStats() {
    const data = await fs.readFile("./data/topic-stats.json", "utf-8");
    return JSON.parse(data);
}

async function saveTopicStats(topicStats) {
    const json = JSON.stringify(topicStats, null, 2);
    await fs.writeFile("./data/topic-stats.json", json);
}

async function loadAnswers() {
    const data = await fs.readFile("./data/answers.json", "utf-8")
    return JSON.parse(data)
}

async function saveAnswers(answers) {
    const json = JSON.stringify(answers, null, 2)
    await fs.writeFile("./data/answers.json", json)
}

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

// app.get("/", async (request, response) => {
//     const messages = await loadMessages();
//     const topicStats = await loadTopicStats();
//     const mostAskedTopic = findMostAskedTopic(topicStats);

//     response.render("index", { messages, error: "", topicStats, mostAskedTopic });
// });

app.get("/debug", (request, response) => {
    console.log(request.query);
    response.send(request.query);
});

app.get("/debug/:name", (request, response) => {
    console.log(request.params);
    response.send(request.params);
});

// app.post("/ask", async (request, response) => {

//     const messages = await loadMessages();
//     const topicStats = await loadTopicStats();
//     const question = request.body.question.trim();
//     // const rawQuestion = request.body.question;
//     // const question = sanitizeQuestion(rawQuestion).trim();
//     let error = "";

//     if (!question) {
//         error = "Skriv et spørgsmål, før du sender.";
//     }
//     else if (question.length > 280) {
//         error = "Spørgsmålet må højst være 280 tegn.";
//     }
//     else {
//         messages.push({ type: "question", text: question, createdAt: new Date() });
//         const result = findBestAnswer(question);
//         messages.push({ type: "answer", text: result.answer, createdAt: new Date() });

//         if (result.category) {
//             topicStats[result.category] = topicStats[result.category] + 1;
//         }
//         else {
//             topicStats.ukendt = topicStats.ukendt + 1;
//         }
//     }

//     await saveTopicStats(topicStats);
//     await saveMessages(messages);
//     const mostAskedTopic = findMostAskedTopic(topicStats);

//     response.render("index", { messages, error, topicStats, mostAskedTopic });
// });

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

// app.post("/clear-messages", async (request, response) => {
//     await saveMessages([]);
//     response.redirect("/");
// });

// app.post("/clear-stats", async (request, response) => {
//     const topicStats = await loadTopicStats();

//     for (const category of Object.keys(topicStats)) {
//         topicStats[category] = 0;
//     }

//     await saveTopicStats(topicStats);

//     response.redirect("/");
// });

app.get("/messages", async (request, response) => {
    const messages = await loadMessages()

    response.json(messages)
});

app.post("/messages", async (request, response) => {
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
});

app.delete("/messages", async (request, response) => {
    await saveMessages([])

    response.send()
});

app.get("/answers", async (request, response) => {
    const answers = await loadAnswers()

    response.json(answers)
})

app.get("/answers/:category", async (request, response) => {
    const answers = await loadAnswers()
    let answerRule = answers.filter((answer) => answer.category === request.params.category)

    //     if (Array.isArray(answer)) {
    //     const randomIndex = Math.floor(Math.random() * answer.length);
    //     answer = answer[randomIndex];
    //   }

    response.json(answerRule)
})

app.post("/answers", async (request, response) => {
    const answers = await loadAnswers()

    const newAnswerRule = {
        category: request.body.category,
        keywords: request.body.keywords,
        answers: request.body.answers
    }

    answers.push(newAnswerRule)

    await saveAnswers(answers)

    response.json(newAnswerRule)
})

app.put("/answers/:category", async (request, response) => {
    const answers = await loadAnswers()
    const answerRule = answers.find((answer) => answer.category === request.params.category)

    answerRule.keywords = request.body.keywords
    answerRule.answers = request.body.answers

    await saveAnswers(answers)

    response.json(answerRule)
})

app.delete("/answers/:category", async (request, response) => {
    const answers = await loadAnswers()
    const updatedAnswers = answers.filter((answer) => answer.category !== request.params.category)

    await saveAnswers(updatedAnswers)
    
    response.send()
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});