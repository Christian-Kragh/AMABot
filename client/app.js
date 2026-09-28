
const API_URL = "http://localhost:3000"

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#clear-messages-button");
const clearStatsButton = document.querySelector("#clear-stats-button");



function displayMessage(message) {
    const html = /*html*/ `
        <article class="${message.type}">
        <p>${message.text}</p>
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

    questionInput.value = ""
    // console.log(data)
});

clearMessagesButton.addEventListener("click", async () => {
    await fetch(`${API_URL}/messages`, { method: "DELETE" })
    messagesContainer.textContent = ""
})

// clearStatsButton.addEventListener("click", async () => {
//     await fetch(`${API_URL}/topics`, { method: "DELETE" })
//     // messagesContainer.textContent = ""
// })