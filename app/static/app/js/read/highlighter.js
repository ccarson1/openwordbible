let isMouseDown = false;
let selectedWords = [];
let savedHighlights = [];
// let historyStack = [];
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


        // let startIndex = document.createElement("i");
        // startIndex.setAttribute("class", "bi bi-cursor-text");

        // startWord.parentNode.insertBefore(startIndex, startWord);
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

        // let endIndexIcon = document.createElement("i");
        // endIndexIcon.setAttribute("class", "bi bi-cursor-text");

        // // Insert after the lastWord element
        // if (lastWord.nextSibling) {
        //   lastWord.parentNode.insertBefore(endIndexIcon, lastWord.nextSibling);
        // } else {
        //   lastWord.parentNode.appendChild(endIndexIcon);
        // }
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

// // UNDO
// document.getElementById("undo").addEventListener("click", () => {
//     if (!historyStack.length) return;

//     const lastAction = historyStack.pop();
//     lastAction.forEach(({ el, prevColor, prevClasses }) => {
//         el.style.backgroundColor = prevColor;
//         el.className = ""; // reset all
//         prevClasses.forEach(cls => el.classList.add(cls));
//     });
// });

// // CTRL+Z Undo shortcut
// document.addEventListener("keydown", (e) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === "z") {
//         document.getElementById("undo").click();
//     }
// });

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
    console.log(notes);
    console.log(document.getElementById('highlighterToggle').checked)
    for (let n = 0; n < notes.length; n++) {
        for (let x = notes[n].sentence_index_start; x <= notes[n].sentence_index_end; x++) {
            for (let y = notes[n].word_index_start; y <= notes[n].word_index_end; y++) {
                if(document.getElementById('highlighterToggle').checked == true){
                    document.getElementById('text-layout').children[x].children[y].style.backgroundColor = notes[n].color;
                }
                else{
                    document.getElementById('text-layout').children[x].children[y].style.backgroundColor = 'white';
                }
                
            }
        }
    }

}

