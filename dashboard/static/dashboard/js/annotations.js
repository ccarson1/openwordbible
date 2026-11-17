const annotationsContainer = document.getElementById("annotations-container");


let modifiedWords = [];
let lastClicked;
let all_instances = document.getElementById("all-instances");
let labelType = document.getElementById("label-type");
let wordLabel = document.getElementById("word-label");

const NER_LABELS = Array.from(wordLabel.options).map(o => o.value);
const POS_LABELS = ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART",
    "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X"];


function labelKey() {
    return labelType.value == "POS" ? "POS" : "labels";
}

function setLabelOptions() {
    const labels = labelType.value == "POS" ? POS_LABELS : NER_LABELS;
    wordLabel.innerHTML = "";
    for (let l of labels) {
        let option = document.createElement("option");
        option.value = l;
        option.innerText = l;
        wordLabel.appendChild(option);
    }
}

function wordPosition(w) {
    let w_sent = w.parentNode;
    let w_page = w_sent.parentNode;
    let w_chap = w_page.parentNode;
    return [
        parseInt(w_chap.dataset.chapter),
        parseInt(w_page.dataset.page),
        parseInt(w_sent.dataset.sentence),
        parseInt(w.dataset.word)
    ];
}

function wordTitle([chapter, page, sentence, word]) {
    const s = content[chapter].pages[page][sentence];
    return `${s.labels[word]} / ${s.POS[word] || '-'}`;
}

function clearMarked() {
    for (let w of annotationsContainer.querySelectorAll(".word.marked")) {
        w.classList.remove("marked");
        w.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
}

function markWord(w) {
    w.classList.add("marked");
    w.style.backgroundColor = "yellow";
    modifiedWords.push(wordPosition(w));
}

function showCurrentLabel() {
    if (modifiedWords.length == 0) return;
    const [chapter, page, sentence, word] = modifiedWords[0];
    const label = (content[chapter].pages[page][sentence][labelKey()][word] || "").trim();
    if (label) wordLabel.value = label;
}

function markAllInstances(text) {
    clearMarked();
    modifiedWords = [];
    const target = text.trim().toLowerCase();
    if (target == "") return [];

    let found = [];
    for (let w of annotationsContainer.getElementsByClassName("word")) {
        if (w.innerText.toLowerCase() === target) {
            markWord(w);
            found.push(w);
        }
    }
    document.getElementById("word-count").innerText = found.length;
    showCurrentLabel();
    return found;
}


all_instances.addEventListener("change", function () {
    modifiedWords = [];
    clearMarked();
});

labelType.addEventListener("change", function () {
    setLabelOptions();
    showCurrentLabel();
});

document.getElementById("target-word").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const found = markAllInstances(this.value);
        if (found.length > 0) {
            found[0].scrollIntoView({ block: "center" });
        }
        else {
            alert(`"${this.value}" was not found.`);
        }
    }
});

annotationsContainer.addEventListener("click", function (event) {
    const word = event.target;
    if (!word.classList.contains("word")) return;

    document.getElementById("target-word").value = word.innerText;

    if (all_instances.checked) {
        markAllInstances(word.innerText);
        return;
    }

    clearMarked();
    modifiedWords = [];
    markWord(word);
    lastClicked = word;
    document.getElementById("word-count").innerText = 1;
    showCurrentLabel();
});


function renderChapter(a) {
    let chapterDiv = document.createElement("div");
    chapterDiv.setAttribute("class", "cha");
    chapterDiv.dataset.chapter = a;
    for (let b = 0; b < content[a].pages.length; b++) {
        let pageDiv = document.createElement("div");
        pageDiv.setAttribute("class", "page");
        pageDiv.dataset.page = b;
        for (let c = 0; c < content[a].pages[b].length; c++) {
            let sentenceDiv = document.createElement('div');
            sentenceDiv.className = 'sent';
            sentenceDiv.dataset.sentence = c;
            let words = content[a].pages[b][c]['text'].split(" ");
            for (let w = 0; w < words.length; w++) {
                let word = document.createElement('span');
                word.className = 'word';
                word.innerText = words[w];
                word.dataset.word = w;
                word.title = wordTitle([a, b, c, w]);
                sentenceDiv.appendChild(word);
            }
            pageDiv.appendChild(sentenceDiv);
        }
        chapterDiv.appendChild(pageDiv);
    }
    annotationsContainer.appendChild(chapterDiv);
}

// Render one chapter at a time so the page stays responsive on large books
function renderChapters(a = 0) {
    if (!Array.isArray(content)) {
        annotationsContainer.innerText = content.error || "This book could not be loaded.";
        hideSpinner();
        return;
    }
    if (a >= content.length) {
        hideSpinner();
        return;
    }
    renderChapter(a);
    setTimeout(() => renderChapters(a + 1), 0);
}

showSpinner();
renderChapters();


document.getElementById("add-btn").addEventListener('click', function () {
    let label = wordLabel.value;
    const key = labelKey();

    for (let m = 0; m < modifiedWords.length; m++) {
        const [chapter, page, sentence, word] = modifiedWords[m];
        content[chapter].pages[page][sentence][key][word] = label;
    }

    for (let w of annotationsContainer.querySelectorAll(".word.marked")) {
        w.title = wordTitle(wordPosition(w));
    }
    clearMarked();
    modifiedWords = []

});


document.getElementById("save-btn").addEventListener("click", function () {
    showSpinner();

    fetch("/api/update-annotation/", {
        method: "POST",
        body: JSON.stringify({
            content: content,
            id: book.id,
        }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            hideSpinner();
            alert(data.message);
        })
        .catch(error => {
            hideSpinner();
            alert("Saving failed: " + error.message);
        });
})
