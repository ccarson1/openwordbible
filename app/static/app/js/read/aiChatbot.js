const icon = document.getElementById('ai-icon');
const promptBox = document.getElementById('ai-prompt-box');
let firstClickDone = false;
const promptInput = document.getElementById('ai-input');

const sendButton = document.getElementById('ai-send-button');

icon.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent outside click logic
    if (!firstClickDone) {
        firstClickDone = true;
        return; // ignore first click
    }
    promptBox.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    const target = e.target;
    if (!promptBox.contains(target) && !icon.contains(target)) {
        promptBox.classList.remove('show');
    }
});

function submitPrompt() {
    const prompt = document.getElementById('ai-input').value;
    const selectedModel = document.querySelector('input[name="ai-model"]:checked');
    const model = selectedModel ? selectedModel.value : 'None';

    alert(`Prompt submitted: ${prompt}\nSelected Model: ${model}`);
    // Replace with fetch() if sending to backend
}



async function submitPrompt() {
    const input = document.getElementById("ai-input");
    const modelRadios = document.getElementsByName("ai-model");
    let modelName = "phi3-mini"; // default
    for (const radio of modelRadios) {
        if (radio.checked) {
            modelName = radio.value;
            break;
        }
    }

    const prompt = input.value.trim();
    if (!prompt) return;

    const chatContainer = document.getElementById("ai-chat-container");

    // Add user message
    const userMessage = document.createElement("div");
    userMessage.className = "ai-message user-message mb-2";
    userMessage.style.textAlign = "right";
    userMessage.innerHTML = `<strong>You:</strong> ${prompt}`;
    chatContainer.appendChild(userMessage);

    // Add AI "loading" message
    const aiMessage = document.createElement("div");
    aiMessage.className = "ai-message ai-loading mb-2";
    aiMessage.innerHTML = `<strong>AI:</strong> <span class="spinner-border spinner-border-sm text-primary" role="status"></span> Loading...`;
    chatContainer.appendChild(aiMessage);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch("http://192.168.56.101:9000/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: prompt,
                book_id: document.getElementById("book_id").innerText,
                model: modelName
            })
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        console.log("AI Response:", data);

        let sourcesHtml = "";

        if (data.sources && data.sources.length > 0) {
            sourcesHtml = `
                <div class="ai-sources mt-2">
                    <small><strong>Sources:</strong></small>
                    <ul class="mb-0">
                        ${data.sources.map(src => `
                            <li>
                                Chapter ${src.chapter},
                                Page ${src.page},
                                Sentence ${src.sentence_index}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `;
        }

        aiMessage.innerHTML = `
            <strong>AI:</strong> ${data.answer}
            ${sourcesHtml}
        `;

        // // Replace loading with actual AI response
        // aiMessage.innerHTML = `<strong>AI:</strong> ${data.answer}`;
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
        aiMessage.innerHTML = `<strong>AI:</strong> <span style="color:red;">Error: ${err.message}</span>`;
    }

    // Clear input
    input.value = "";
}


// Handle Send button
sendButton.addEventListener('click', submitPrompt);

// Handle Enter key
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // prevent newline if using textarea
        submitPrompt();
    }
});