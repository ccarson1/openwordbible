

const annotationsContainer = document.getElementById("annotations-container");

let batchSize = 100; // sentences per batch
let currentIndex = 0;
let sentencesList = [];
let modifiedWords = [];

// Flatten all sentences first
for (let a = 0; a < content.length; a++) {
    for (let b = 0; b < content[a].length; b++) {
        for (let c = 0; c < content[a].pages[b].length; c++) {
            sentencesList.push(content[a].pages[b][c]);
        }
    }
}



// Function to render a batch
function renderNextBatch() {
    let end = Math.min(currentIndex + batchSize, sentencesList.length);
    for (let i = currentIndex; i < end; i++) {
        let sentenceDiv = document.createElement('div');
        sentenceDiv.className = 'sent';
        let words = sentencesList[i]['text'].split(" ");
        for (let wordText of words) {
            let word = document.createElement('span');
            word.className = 'word';
            word.innerText = wordText;

            word.addEventListener('click', function () {
                document.getElementById("target-word").value = this.innerText;

                let all_instances = document.getElementById("all-instances");
                let words = document.getElementsByClassName("word");
                let word_count = 0;
                
                

                for (let w of words) {
                    if (w.innerText === this.innerText) {
                        if (all_instances.checked) {
                            w.style.backgroundColor = "yellow";
                            word_count++;
                            sent_index = Array.from(w.parentNode.parentNode.children).indexOf(w.parentNode)
                            word_index = Array.from(w.parentNode.children).indexOf(w)
                            console.log(`Sentence Index: ${sent_index}`);
                            console.log(`Word Index: ${word_index}`);
                            modifiedWords.push([sent_index, word_index])
                        }
                    } else {
                        w.style.backgroundColor = "white";
                    }
                }

                document.getElementById('word-count').innerText = word_count;
                this.style.backgroundColor = 'yellow';
                console.log(`Sentence Index: ${Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode)}`);
                console.log(`Word Index: ${Array.from(this.parentNode.children).indexOf(this)}`);
            });

            sentenceDiv.appendChild(word);
        }

        annotationsContainer.appendChild(sentenceDiv);
    }
    currentIndex = end;
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
    // for(let w = 0; w<modifiedWords.length; w++){
    //     content
    // }

});