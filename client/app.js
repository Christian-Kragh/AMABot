
const API_URL = "http://localhost:3000"

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#clear-messages-button");
const clearStatsButton = document.querySelector("#clear-stats-button");
const topicList = document.querySelector("#topic-list");
const mostAskedTopic = document.querySelector("#most-asked-topic");


questionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = questionInput.value.trim();

    const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    });

    const data = await response.json()

    displayMessage(data.question)
    displayMessage(data.answers)
    displayTopicStats(data.topicStats)
    displayMostAskedTopic(data.mostAskedTopic)

    questionInput.value = ""
});

function displayMessage(message) {
    const date = new Date(message.createdAt);
    const html = /*html*/ `
        <article class="${message.type}">
        <p>${message.text}</p>
        <small>${date.toLocaleTimeString("da-DK")}</small>
        </article>`;

    messagesContainer.insertAdjacentHTML("beforeend", html)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

async function getMessages() {
    const response = await fetch(`${API_URL}/messages`)
    const messages = await response.json()

    for (const message of messages) {
        displayMessage(message)
    }
}

getMessages()

clearMessagesButton.addEventListener("click", async () => {
    await fetch(`${API_URL}/messages`, { method: "DELETE" })
    messagesContainer.textContent = ""
})

async function getTopicStats() {
    const response = await fetch(`${API_URL}/topics`)
    const data = await response.json()

    displayTopicStats(data.topicStats)
    displayMostAskedTopic(data.mostAskedTopic)

}

function displayTopicStats(topicStats) {
    topicList.textContent = ""

    for (const [topic, count] of Object.entries(topicStats)) {
        const li = document.createElement('li')

        li.textContent = `${topic}: ${count}`

        topicList.appendChild(li)
    }
}

function displayMostAskedTopic(topic) {
    mostAskedTopic.textContent = topic;
}

getTopicStats()

clearStatsButton.addEventListener("click", async () => {
    await fetch(`${API_URL}/topics`, { method: "DELETE" })

    getTopicStats()
})