
import { loadAnswers, saveAnswers } from '../data/answers.js'


export async function getAllAnswers(request, response) {
    const answers = await loadAnswers()

    response.json(answers)
}

export async function getAnswerByCategory(request, response) {
    const answers = await loadAnswers()
    const answer = answers.find((answer) => answer.category === request.params.category)


    if (!answer) {
        response.status(404).json({ error: `Der findes ingen ${request.params.category}-kategori` })
    }
    else {
        let answerRule = answers.filter((answer) => answer.category === request.params.category)

        response.json(answerRule)
    }
}

export async function createAnswer(request, response) {
    const answers = await loadAnswers()

    if (!request.body.category || !request.body.keywords || !request.body.answers) {
        response.status(400).json({ error: "Du mangler at udfylde kategori, keywords og/eller et svar" })
    }
    else {

        const newAnswerRule = {
            category: request.body.category,
            keywords: request.body.keywords,
            answers: request.body.answers
        }

        answers.push(newAnswerRule)

        await saveAnswers(answers)

        response.status(201).json(newAnswerRule)
    }
}

export async function updateAnswerByCategory(request, response) {
    const answers = await loadAnswers()
    const answerRule = answers.find((answer) => answer.category == request.params.category)

    if (!answerRule) {
        response.status(404).json({ error: `Der findes ikke en ${request.params.category}-kategori` })
    }
    else {
        if (!request.body.category || !request.body.keywords || !request.body.answers) {
            response.status(400).json({ error: `Du mangler at udfylde kategori, keywords og/eller et svar` })
        }
        else {

            answerRule.keywords = request.body.keywords
            answerRule.answers = request.body.answers

            await saveAnswers(answers)

            response.json(answerRule)
        }
    }
}

export async function deleteAnswer(request, response) {
    const answers = await loadAnswers()
    const answer = answers.find((answer) => answer.category === request.params.category
    )

    if (!answer) {
        response.status(404).json({ error: `Der findes ikke en kategori der hedder ${request.params.category}` })
    }
    else {
        let updatedAnswers = answers.filter((answer) => answer.category !== request.params.category)
        await saveAnswers(updatedAnswers)
    }

    response.status(404).send()
}

