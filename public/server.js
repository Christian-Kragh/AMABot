
import express from "express";
// import { messages } from "../messages.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const messages = []

const answers = [
    {
        keywords: ["navn", "hedder", "hvem er du"],
        answers: ["Jeg hedder Christian. Hvad vil du ellers vide om mig?"]
    },
    {
        keywords: ["bor", "by", "fra"],
        answers: ["Jeg bor i Lading."]
    },
    {
        keywords: ["fritid", "hobby", "kan lide"],
        answers: ["I min fritid kan jeg godt lide at læse og gå ture."]
    },
    {
        keywords: ["dyr", "hund", "kat"],
        answers: [
            "Jeg elsker hunde",
            "Jeg er mere til hunde end katte, men katte kan også være søde."
        ]
    }
];

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

function sanitizeQuestion(input) {
    return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

app.get("/", (request, response) => {
    response.render("index", { messages, error: "" });
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
        const answer = findAnswer(question);
        messages.push({ type: "answer", text: answer, createdAt: new Date() });
    }

    if (messages.lenght > 0) {
        document.getElementById('clear-messages').setAttribute("style", "color:red;")
    }

    response.render("index", { messages, error });
});

app.post("/clear-messages", (request, response) => {
    messages.length = 0;
    response.redirect("/");
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});