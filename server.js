
import express from "express";
import { answers } from "./data/answers.js";
import fs from "node:fs/promises"

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

async function loadMessages() {
    const data = await fs.readFile("./data/messages.json", "utf-8");
    const messages = JSON.parse(data);

    for(const message of messages) {
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

function findBestAnswer(question) {
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

  return {
    answer: bestAnswer,
    category: bestCategory
  };
}

function sanitizeQuestion(input) {
    return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

app.get("/", async (request, response) => {
    const messages = await loadMessages();
    const topicStats = await loadTopicStats();

    response.render("index", { messages, error: "", topicStats });
});

app.get("/debug", (request, response) => {
    console.log(request.query);
    response.send(request.query);
});

app.get("/debug/:name", (request, response) => {
    console.log(request.params);
    response.send(request.params);
});

app.post("/ask", async (request, response) => {

    const messages = await loadMessages();
    const topicStats = await loadTopicStats();
    const question = request.body.question.trim();
    // const rawQuestion = request.body.question;
    // const question = sanitizeQuestion(rawQuestion).trim();
    let error = "";

    if (!question) {
        error = "Skriv et spørgsmål, før du sender.";
    }
    else if (question.length > 280) {
        error = "Spørgsmålet må højst være 280 tegn.";
    }
    else {
        messages.push({ type: "question", text: question, createdAt: new Date() });
        const result = findBestAnswer(question);
        messages.push({ type: "answer", text: result.answer, createdAt: new Date() });
        
        if (result.category) {
            topicStats[result.category] = topicStats[result.category] + 1;
        }
    }

    await saveTopicStats(topicStats);
    await saveMessages(messages);

    response.render("index", { messages, error, topicStats });
});

app.post("/clear-messages", async (request, response) => {
    await saveMessages([]);
    response.redirect("/");
});

app.post("/clear-stats", async (request, response) => {
    const topicStats = await loadTopicStats();

    for (const category of Object.keys(topicStats)) {
        topicStats[category] = 0;
    }

    await saveTopicStats(topicStats);

    response.redirect("/");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});