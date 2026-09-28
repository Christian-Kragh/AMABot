
import express from "express";
import cors from 'cors';
import messagesRouter from './routes/messages.js'
import answersRouter from './routes/answers.js'
import topicsRouter from './routes/topics.js'


const app = express();
const port = 3000;


app.use(express.json())
app.use(cors())


app.use("/messages", messagesRouter)
app.use("/answers", answersRouter)
app.use("/topics", topicsRouter)


app.get("/debug", (request, response) => {
    console.log(request.query);
    response.send(request.query);
});

app.get("/debug/:name", (request, response) => {
    console.log(request.params);
    response.send(request.params);
});

app.use((request, response) => {
    response.status(404).json({ error: "Ukendt url" })
})

app.use((error, request, response, next) => {
    console.error(error)
    response.status(500).json({ error: error.message })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});