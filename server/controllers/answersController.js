
import { loadAnswers, saveAnswers } from '../data/answers.js'


export async function getAllAnswers(request, response) {
    const answers = await loadAnswers()

    response.json(answers)
}

export async function getAnswerByCategory(request, response) {
    const answers = await loadAnswers()
    let answerRule = answers.filter((answer) => answer.category === request.params.category)

    //     if (Array.isArray(answer)) {
    //     const randomIndex = Math.floor(Math.random() * answer.length);
    //     answer = answer[randomIndex];
    //   }

    response.json(answerRule)
}

export async function createAnswer(request, response) {
    const answers = await loadAnswers()

    const newAnswerRule = {
        category: request.body.category,
        keywords: request.body.keywords,
        answers: request.body.answers
    }

    answers.push(newAnswerRule)

    await saveAnswers(answers)

    response.json(newAnswerRule)
}

export async function updateAnswerByCategory(request, response) {
    const answers = await loadAnswers()
    const answerRule = answers.find((answer) => answer.category === request.params.category)

    answerRule.keywords = request.body.keywords
    answerRule.answers = request.body.answers

    await saveAnswers(answers)

    response.json(answerRule)
}

export async function deleteAnswer(request, response) {
    let answers = await loadAnswers()
    const updatedAnswers = answers.filter((answer) => answer.category !== request.params.category)

    await saveAnswers(updatedAnswers)
    
    response.send()
}

