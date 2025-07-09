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



function submitPrompt() {
    const prompt = promptInput.value.trim();
    const selectedModel = document.querySelector('input[name="ai-model"]:checked');
    const model = selectedModel ? selectedModel.value : 'None';

    if (prompt && promptBox.classList.contains('show')) {
        alert(`Prompt submitted: ${prompt}\nModel: ${model}`);
        promptInput.value = ''; // Clear input after sending
    }
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