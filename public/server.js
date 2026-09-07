
import express from "express";
// import { messages } from "../messages.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const messages = []

app.get("/", (request, response) => {
    response.render("index", { messages });
});

app.post("/ask", (request, response) => {
    const question = request.body.question;

    messages.push({ type: "question", text: "question" });
    messages.push({ type: "answer", text: "Jeg leder efter et svar ..." })

    response.render("index", { question, messages });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});