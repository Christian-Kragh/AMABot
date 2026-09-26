
import express from "express";
import messagesRouter from './routes/messages.js'
import answersRouter from './routes/answers.js'
// import { answers } from "./data/answers.js";

const app = express();
const port = 3000;

app.use(express.json())
app.use("/messages", messagesRouter)
app.use("/answers", answersRouter)


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




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});