const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

let bookName = document.getElementById("book-name");
let bookReligion = document.getElementById("book-religion");
let inputBookDenom = document.getElementById("input-book-denom");
let textPreview = document.getElementById("text-preview");
let activeTabText = 'RTF'
let current_page = 0
let end_page = 0
let book_array = {}


document.getElementById("up-book-txt").addEventListener('change', function (event) {
    console.log("Uploading new book");

    let file = event.target.files[0];
    let allowedTypes = []
    if (file) {
        if (activeTabText == 'RTF') {
            allowedTypes.push("text/plain");
        }
        else if (activeTabText == 'PDf') {
            allowedTypes.push("application/pdf");
        }
        else if (activeTabText == 'DOCX') {
            allowedTypes.push("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }
        else if (activeTabText == 'ODT') {
            allowedTypes.push("application/vnd.oasis.opendocument.text");
        }
        else if (activeTabText == 'EPUB') {
            console.log(activeTabText)
            allowedTypes.push("application/epub+zip");
        }

        if (!allowedTypes.includes(file.type)) {
            console.error(`Invalid file type. Please upload a ${activeTabText} file.`);
            alert(`Invalid file type. Only ${activeTabText} files are allowed.`);
            event.target.value = "";
            return;
        }

        console.log("File accepted:", file.name);
    }
});

document.getElementById("convert-book").addEventListener("click", function () {
    showSpinner();
    console.log("Starting upload")
    let book_file = document.getElementById("up-book-txt");
    let formData = new FormData();
    formData.append("book-file", book_file.files[0])

    fetch("/api/upload-book/", {
        method: "POST",
        body: formData,
        headers: {
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
            book_data = data
            book_array = data['uploaded-file']
            epub_content = document.getElementById("epub-content");
            epub_content.innerText = book_array["content"][current_page]
            end_page = data['uploaded-file'].length
            fill_form(book_array)
            hideSpinner();
        })
});

function fill_form(data){
    console.log(`Author: ${data['author'][0]}`)
    console.log(`Date: ${data['date'][0]}`)
    console.log(`Identifier: ${data['identifier'][0]}`)
    console.log(`Publisher: ${data['publisher'][0]}`)
    console.log(`Rights: ${data['rights'][0]}`)
    console.log(`Title: ${data['title'][0]}`)
    console.log(`Description: ${data['description']}`)

    document.getElementById("book-name").value = data['title'][0];
    document.getElementById("input-book-author").value = data['author'][0];
    document.getElementById("input-book-id").value = data['identifier'][0];
    document.getElementById("book-right").innerText = `Rights: ${data['rights'][0]}`;
    document.getElementById("book-pub").innerText = `Publisher: ${data['publisher'][0]}`;

}

function split_words(text){
    return text.split(/\s+/);
}

function splitTextIntoChunks(words, wordsPerChunk =255) {
    // Split the text into words by spaces
    // Regex \s+ splits by any whitespace

    // Create an array to hold the chunks
    wordsPerChunk = parseInt(wordsPerChunk);
    const chunks = [];
    page_text = ''
    let counter = 0;
    for (let i = 0; i < words.length; i++) {
        if(i == (parseInt(wordsPerChunk)*counter)){
            console.log(i)
            console.log((wordsPerChunk*counter)+wordsPerChunk)
            console.log(words.slice(i, (wordsPerChunk*counter)+wordsPerChunk).length)
            chunks.push(words.slice(i, (wordsPerChunk*counter)+wordsPerChunk).join(' '));
            counter++;
        }

    }

    return chunks;
}

back_btns = document.getElementsByClassName("btn-pre-back");
for (let a = 0; a < back_btns.length; a++) {
    back_btns[a].addEventListener("click", function () {
        if (current_page != 0) {
            current_page --
            console.log(current_page)
            epub_content.innerText = book_array["content"][current_page]
        }
    });

}
next_btns = document.getElementsByClassName("btn-pre-next");
for(let b=0; b<next_btns.length; b++){
    next_btns[b].addEventListener("click", function () {
        if (current_page != end_page) {
            current_page ++
            console.log(current_page)
            epub_content.innerText = book_array["content"][current_page]
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    let myTabs = document.getElementById("myTabs");

    myTabs.addEventListener("shown.bs.tab", function (event) {
        let activeTab = event.target;
        activeTabText = activeTab.innerText;
        let activeTabHref = activeTab.getAttribute("href");

        console.log("Active Tab Text:", activeTabText);
        console.log("Active Tab Href:", activeTabHref);
    });
});

document.getElementById("btn-add-page").addEventListener("click", function(){
    let page_content = document.getElementById("epub-content").textContent;
    let words = split_words(page_content);
    let wordsPerPage = document.getElementById("input-words-per-page").value;
    let page_array = splitTextIntoChunks(words, wordsPerPage);
    console.log(page_array)
    for(let x=0; x< page_array.length; x++){
        let page_count = document.getElementById("page-list").children.length;
        let newPage = document.createElement("div")
        newPage.setAttribute("class", "page-list-item");
        // newPage.innerText = `${page_count+1}`
        newPage.innerText = page_array[x]
        document.getElementById("page-list").appendChild(newPage);
    }
    // if(words.length > 255){
        
    // }
    // else{
    //     let page_count = document.getElementById("page-list").children.length;
    //     let newPage = document.createElement("div")
    //     newPage.setAttribute("class", "page-list-item");
    //     // newPage.innerText = `${page_count+1}`
    //     newPage.innerText = page_content
    //     document.getElementById("page-list").appendChild(newPage);
    // }

    
});


