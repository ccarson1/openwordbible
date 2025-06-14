const annotationsContainer = document.getElementById("annotations-container");


let batchSize = 100; // sentences per batch
let currentIndex = 0;
let sentencesList = [];
let modifiedWords = [];

// // Flatten all sentences first
// for (let a = 0; a < content.length; a++) {
//     for (let b = 0; b < content[a].length; b++) {
//         for (let c = 0; c < content[a].pages[b].length; c++) {
//             sentencesList.push(content[a].pages[b][c]);
//         }
//     }
// }


function editAnnotation([chapter, page, sentence, word], label) {
    let newLabel = document.getElementById("word-label");
    console.log(newLabel);
    console.log(content[chapter].pages[page][sentence])
    console.log(content[chapter].pages[page][sentence].labels[word])
    content[chapter].pages[page][sentence].labels[word] = label
    console.log(content[chapter].pages[page][sentence])
}



// Function to render a batch
function renderNextBatch() {
    //let end = Math.min(currentIndex + batchSize, sentencesList.length);
    let all_instances = document.getElementById("all-instances");
    let div_words = document.getElementsByClassName("word");
    let sents = document.getElementsByClassName("sent");
    for (let a = 0; a < content.length; a++) {
        console.log(content[a])
        let chapterDiv = document.createElement("div");
        chapterDiv.setAttribute("class", "cha");
        chapterDiv.setAttribute("id", a)
        for (let b = 0; b < content[a].length; b++) {
            let pageDiv = document.createElement("div");
            pageDiv.setAttribute("class", "page");
            pageDiv.setAttribute("id", b);
            for (let c = 0; c < content[a].pages[b].length; c++) {
                sentencesList.push(content[a].pages[b][c]);
                let sentenceDiv = document.createElement('div');
                sentenceDiv.className = 'sent';
                sentenceDiv.setAttribute("id", b + "_" + c)
                let words = content[a].pages[b][c]['text'].split(" ");
                for (let wordText of words) {
                    let word = document.createElement('span');
                    word.className = 'word';
                    word.innerText = wordText;

                    word.addEventListener('click', function () {
                        document.getElementById("target-word").value = this.innerText;
                        document.getElementById('word-label').value = content[a].pages[b][c].labels[6]

                        let word_count = 0;



                        for (let w of div_words) {

                            if (w.innerText === this.innerText) {
                                sent_index = Array.from(w.parentNode.parentNode.children).indexOf(w.parentNode)
                                word_index = Array.from(w.parentNode.children).indexOf(w)
                                sent = w.parentNode.parentNode.children[sent_index]
                                page_index = sent.parentNode.id;
                                chapter_index = sent.parentNode.parentNode.id;
                                document.getElementById('word-label').value = content[chapter_index].pages[page_index][sent_index].labels[word_index]
                                if (all_instances.checked) {

                                    w.style.backgroundColor = "yellow";
                                    word_count++;
                                    
                                    modifiedWords.push([chapter_index, page_index, sent_index, word_index])


                                }
                            } else {
                                w.style.backgroundColor = "white";
                            }


                        }

                        document.getElementById('word-count').innerText = word_count;
                        this.style.backgroundColor = 'yellow';
                        // console.log(`Sentence Index: ${Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode)}`);
                        // console.log(`Word Index: ${Array.from(this.parentNode.children).indexOf(this)}`);
                        sent_index = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode)
                        word_index = Array.from(this.parentNode.children).indexOf(this)
                        sent = this.parentNode.parentNode.children[sent_index]
                        page_index = sent.parentNode.id;
                        chapter_index = sent.parentNode.parentNode.id;

                        modifiedWords.push([chapter_index, page_index, sent_index, word_index])
                    });

                    sentenceDiv.appendChild(word);
                }

                pageDiv.appendChild(sentenceDiv);
            }
            chapterDiv.appendChild(pageDiv);
        }
        annotationsContainer.appendChild(chapterDiv);
    }

    //currentIndex = end;
}

// Scroll listener to load more when near bottom
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
        renderNextBatch();
    }
});

// Initial load
renderNextBatch();

document.getElementById("add-btn").addEventListener('click', function () {
    let word = document.getElementById('target-word').value;
    let label = document.getElementById('word-label').value;

    console.log(`Word: ${word}, Label: ${label}`);
    for (let m = 0; m < modifiedWords.length; m++) {

        editAnnotation(modifiedWords[m], label)
    }
    modifiedWords = []

});


document.getElementById("save-btn").addEventListener("click", function () {
    showSpinner();

    console.log(book.path)

    console.log(content)
    fetch("/api/update-annotation/", {
        method: "POST",
        body: JSON.stringify({
            content: content,
            path: book.path,
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
            console.log(data);
            hideSpinner();

        })
})