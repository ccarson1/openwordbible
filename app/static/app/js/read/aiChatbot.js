const icon = document.getElementById('ai-icon');
const promptBox = document.getElementById('ai-prompt-box');
const promptInput = document.getElementById('ai-input');

const sendButton = document.getElementById('ai-send-button');

icon.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent outside click logic
    promptBox.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    const target = e.target;
    if (!promptBox.contains(target) && !icon.contains(target)) {
        promptBox.classList.remove('show');
    }
});

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
    userMessage.innerHTML = `<strong>You:</strong> `;
    userMessage.appendChild(document.createTextNode(prompt));
    chatContainer.appendChild(userMessage);

    // Add AI "loading" message
    const aiMessage = document.createElement("div");
    aiMessage.className = "ai-message ai-loading mb-2";
    aiMessage.innerHTML = `<strong>AI:</strong> <span class="spinner-border spinner-border-sm text-primary" role="status"></span> Loading...`;
    chatContainer.appendChild(aiMessage);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const ragUrl = document.getElementById("rag-server-url").innerText.trim().replace(/\/$/, "");
        const response = await fetch(`${ragUrl}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: prompt,
                book_id: parseInt(document.getElementById("book_id").innerText),
                model: modelName
            })
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        aiMessage.innerHTML = `<strong>AI:</strong> `;
        aiMessage.appendChild(document.createTextNode(data.answer));

        if (data.sources && data.sources.length > 0) {
            const sources = document.createElement("div");
            sources.className = "ai-sources mt-2";
            sources.innerHTML = `<small><strong>Sources:</strong></small><ul class="mb-0"></ul>`;
            data.sources.forEach(src => {
                const li = document.createElement("li");
                li.innerText = `Chapter ${src.chapter}, Page ${src.page}, Sentence ${src.sentence_index}`;
                sources.querySelector("ul").appendChild(li);
            });
            aiMessage.appendChild(sources);
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
        aiMessage.innerHTML = `<strong>AI:</strong> <span style="color:red;"></span>`;
        aiMessage.querySelector("span").innerText = `Error: ${err.message}`;
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