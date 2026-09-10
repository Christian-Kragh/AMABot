
import express from "express";
import { answers } from "./data/answers.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const messages = []

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

const topicStats = {
    navn: 0,
    bosted: 0,
    fritid: 0,
    kæledyr: 0
};

app.get("/", (request, response) => {
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

app.post("/ask", (request, response) => {

    const rawQuestion = request.body.question;
    const question = sanitizeQuestion(rawQuestion).trim();
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

    if (messages.lenght > 0) {
        document.getElementById('clear-messages').setAttribute("style", "color:red;")
    }

    response.render("index", { messages, error, topicStats });
});

app.post("/clear-messages", (request, response) => {
    messages.length = 0;
    response.redirect("/");
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});