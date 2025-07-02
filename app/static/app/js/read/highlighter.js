let isMouseDown = false;
let selectedWords = [];
let savedHighlights = [];
let temp_note_color;
let startWord;

const textLayout = document.getElementById("text-layout");
const toolbar = document.getElementById("toolbar");

// Track if current highlight is saved
let isCurrentHighlightSaved = false;

textLayout.addEventListener("mousedown", (e) => {
    if (e.button === 0 && e.target.classList.contains("word")) {

        if (myModal._isShown == false) {
            if (e.target.classList.contains("highlighted")) {
                h_note = document.getElementsByClassName(e.target.classList.value)
                console.log(h_note)
            }
            else {
                isMouseDown = true;
                clearTemporaryHighlights();
                startWord = e.target;
                updateSelectedWords(e.target);
            }

        }


    }
});

textLayout.addEventListener("mouseover", (e) => {
    if (isMouseDown && e.target.classList.contains("word")) {
        if (e.target.classList.contains("highlighted")) { }
        else {
            updateSelectedWords(e.target);
        }

    }
});


document.addEventListener("mouseup", (e) => {
    if (isMouseDown && selectedWords.length) {
        isMouseDown = false;
        isCurrentHighlightSaved = false;
        showToolbar(e.pageX, e.pageY);

        // Add icon after the last selected word
        const endIndex = selectedWords.length - 1;
        const lastWord = selectedWords[endIndex];


    }
});
// Right-click cancels current unsaved highlights
textLayout.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (!isCurrentHighlightSaved) {
        if (myModal._isShown == false) {
            if (e.target.classList.contains("highlighted")) { }
            else {
                updateSelectedWords(e.target);
            }
        }
        hideToolbar();
        return;
    }

    if (e.target.classList.contains("highlighted")) {
        e.target.className = "word";
        e.target.style.backgroundColor = "";
    }

    hideToolbar();
});

// Click outside the toolbar to cancel unsaved
document.addEventListener("mousedown", (e) => {
    if (!toolbar.contains(e.target) && !textLayout.contains(e.target)) {
        if (!isCurrentHighlightSaved) {
            if (myModal._isShown == false) {
                if (e.target.classList.contains("highlighted")) { }
                else {
                    updateSelectedWords(e.target);
                }
            }
        }
        hideToolbar();
    }
});

function selectWord(wordEl) {
    if (!selectedWords.includes(wordEl)) {
        selectedWords.push(wordEl);
        wordEl.classList.add("highlighted");
    }
}

function clearTemporaryHighlights() {
    selectedWords.forEach(w => {
        w.classList.remove("highlighted", "end-marker");
        w.style.backgroundColor = "";
    });
    selectedWords = [];
}

function hideToolbar() {
    toolbar.style.display = "none";
}

function showToolbar(x, y) {
    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${y}px`;
    toolbar.style.display = "block";
}

// Choose color but wait for Save to finalize
document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;
        temp_note_color = color;
        console.log(temp_note_color);
        selectedWords.forEach(word => {
            word.style.backgroundColor = color;
        });
    });
});

// SAVE BUTTON: finalize highlight and store to history
document.getElementById("save").addEventListener("click", () => {
    if (!selectedWords.length) return;
    sentence_index_start = Array.from(selectedWords[0].parentElement.parentElement.children).indexOf(selectedWords[0].parentElement);
    sentence_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.parentElement.children).indexOf(selectedWords[selectedWords.length - 1].parentElement);

    word_index_start = Array.from(selectedWords[0].parentElement.children).indexOf(selectedWords[0]);
    word_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.children).indexOf(selectedWords[selectedWords.length - 1]);
    console.log(`Note${current_book.id}_${sentence_index_start}`);
    document.getElementById("note-title").value = `Note${current_book.id}${currentPageIndex}${sentence_index_start}${sentence_index_end}${word_index_start}${word_index_end}`;
    myModal.show();


});

// COPY
document.getElementById("copy").addEventListener("click", () => {
    const text = [...document.querySelectorAll(".highlighted")]
        .map(w => w.textContent)
        .join(" ");
    navigator.clipboard.writeText(text);
    alert(text);
});

// SHARE
document.getElementById("share").addEventListener("click", () => {
    const text = [...document.querySelectorAll(".highlighted")]
        .map(w => w.textContent)
        .join(" ");
    alert("Share:\n" + text);
});


// This function highlights the range between startWord and currentWord
function updateSelectedWords(currentWord) {

    if (myModal._isShown == false) {
        clearTemporaryHighlights();
    }


    // Get all .word elements in order
    const allWords = Array.from(textLayout.querySelectorAll(".word"));

    // Get indexes of startWord and currentWord in DOM order
    const startIndex = allWords.indexOf(startWord);
    const currentIndex = allWords.indexOf(currentWord);

    if (startIndex === -1 || currentIndex === -1) return;

    // Determine range boundaries
    const [from, to] = startIndex < currentIndex
        ? [startIndex, currentIndex]
        : [currentIndex, startIndex];

    // Select all words in the range
    selectedWords = allWords.slice(from, to + 1);

    // Highlight all words in the range
    selectedWords.forEach(word => {
        word.classList.add("highlighted");
    });
}

function toggleHighlighted() {
    const textLayout = document.getElementById('text-layout');
    const sentenceCount = textLayout.children.length;
    const isHighlightingEnabled = document.getElementById('highlighterToggle').checked;

    const currentChapter = current_book.current_chapter;
    const currentPage = currentPageIndex;

    for (let note of notes) {
        // Only apply notes for the current chapter and page
        if (note.chapter !== currentChapter || note.page !== currentPage) continue;

        const {
            sentence_index_start,
            sentence_index_end,
            word_index_start,
            word_index_end,
            color
        } = note;

        for (let x = sentence_index_start; x <= sentence_index_end; x++) {
            const sentenceEl = textLayout.children[x];
            if (!sentenceEl) continue;

            let startWord = 0;
            let endWord = sentenceEl.children.length - 1;

            if (x === sentence_index_start) {
                startWord = word_index_start;
            }
            if (x === sentence_index_end) {
                endWord = word_index_end;
            }

            if (x === sentence_index_start && x === sentence_index_end && word_index_start > word_index_end) {
                [startWord, endWord] = [endWord, startWord];
            }

            for (let y = startWord; y <= endWord; y++) {
                const wordEl = sentenceEl.children[y];
                if (!wordEl) continue;
                wordEl.style.backgroundColor = isHighlightingEnabled ? color : 'white';
            }
        }
    }
}

// function toggleHighlighted() {
//     console.log(notes);
//     console.log(document.getElementById('highlighterToggle').checked)
//     for (let n = 0; n < notes.length; n++) {
//         for (let x = notes[n].sentence_index_start; x <= notes[n].sentence_index_end; x++) {
//             for (let y = notes[n].word_index_start; y <= notes[n].word_index_end; y++) {
//                 if (document.getElementById('highlighterToggle').checked == true) {
//                     document.getElementById('text-layout').children[x].children[y].style.backgroundColor = notes[n].color;
//                 }
//                 else {
//                     document.getElementById('text-layout').children[x].children[y].style.backgroundColor = 'white';
//                 }

//             }
//         }
//     }

// }

