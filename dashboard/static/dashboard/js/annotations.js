const annotationsContainer = document.getElementById("annotations-container");


let batchSize = 100; // sentences per batch
let currentIndex = 0;
let sentencesList = [];
let modifiedWords = [];
let lastClicked;
let all_instances = document.getElementById("all-instances");



for(let x=0; x<book.chapter_count; x++){
    loadChapterPages(book.id, x)
}


all_instances.addEventListener("change", function(){
    console.log(modifiedWords);
    modifiedWords = [];
    console.log(modifiedWords);

    let div_words = document.getElementsByClassName("word");
    for (let w of div_words){
        w.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
    if(all_instances.checked == true){
        console.log("Checking all instances.")
    }
    else{
        console.log("Only checking a single instance.")
    }
    
});

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
    console.log(book.id)
    

    let sents = document.getElementsByClassName("sent");
    for (let a = 0; a < content.length; a++) {

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
                        modifiedWords = [];
                        let sentDiv = this.parentNode;
                        let pageDiv = sentDiv.parentNode;
                        let chapterDiv = pageDiv.parentNode;

                        let wordIndex = Array.from(sentDiv.children).indexOf(this);
                        let sentIndex = Array.from(pageDiv.children).indexOf(sentDiv);
                        let pageIndex = parseInt(pageDiv.id);
                        let chapterIndex = parseInt(chapterDiv.id);

                        console.log(wordIndex)

                        const label = content[chapterIndex].pages[pageIndex][sentIndex].labels[wordIndex].trim();
                        document.getElementById('word-label').value = label;

                        console.log(`a: ${chapterIndex}, b: ${pageIndex}, c: ${sentIndex}, index: ${wordIndex}`);
                        console.log("Setting label to:", label);



                        let div_words = document.getElementsByClassName("word");
                        let count = 0;
                        if (document.getElementById("all-instances").checked) {
                            for (let w of div_words) {
                                if (w.innerText === this.innerText) {

                                    let w_sent = w.parentNode;
                                    let w_page = w_sent.parentNode;
                                    let w_chap = w_page.parentNode;
                                    let w_i = Array.from(w_sent.children).indexOf(w);
                                    let s_i = Array.from(w_page.children).indexOf(w_sent);
                                    let p_i = parseInt(w_page.id);
                                    let c_i = parseInt(w_chap.id);

                                    w.style.backgroundColor = "yellow";
                                    count++;
                                    modifiedWords.push([c_i, p_i, s_i, w_i]);


                                } else {
                                    w.style.backgroundColor = "rgba(0, 0, 0, 0)";
                                }
                            }
                        }
                        else {

                                this.style.backgroundColor = "yellow";
                                if(lastClicked != undefined){
                                    lastClicked.style.backgroundColor = "rgba(0, 0, 0, 0)";
                                }
                                
                                lastClicked = this;
                                


                        }
                        document.getElementById("word-count").innerText = count;




                        // Add this word to modifiedWords
                        modifiedWords.push([chapterIndex, pageIndex, sentIndex, wordIndex]);
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




async function loadChapterPages(bookId, chapterIndex) {
    try {
        const response = await fetch(`/api/book/${bookId}/chapter/${chapterIndex}/`);
        if (!response.ok) {
            throw new Error(`Failed to load chapter ${chapterIndex}`);
        }

        const data = await response.json();
        console.log(data)
        content.push(data); // Fill in the blank
        console.log(`Loaded chapter ${chapterIndex}`);
        //renderNextBatch();
        //renderChapter(chapterIndex);
    } catch (error) {
        console.error("Error loading chapter:", error);
    }
}

document.getElementById("add-btn").addEventListener('click', function () {
    let word = document.getElementById('target-word').value;
    let label = document.getElementById('word-label').value;

    console.log(`Word: ${word}, Label: ${label}`);
    console.log(modifiedWords)
    for (let m = 0; m < modifiedWords.length; m++) {

        editAnnotation(modifiedWords[m], label)
    }
    modifiedWords = []

});


document.getElementById("save-btn").addEventListener("click", function () {
    showSpinner();

    console.log(book.path)
    let bookPath = book.path.replace("\\", "/");

    console.log(content)
    fetch("/api/update-annotation/", {
        method: "POST",
        body: JSON.stringify({
            content: content,
            path: bookPath,
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