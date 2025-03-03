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
            book_array = data
            epub_content = document.getElementById("epub-content");
            epub_content.innerText = data['uploaded-file'][current_page]
            end_page = data['uploaded-file'].length
            hideSpinner();
        })
});

back_btns = document.getElementsByClassName("btn-pre-back");
for (let a = 0; a < back_btns.length; a++) {
    back_btns[a].addEventListener("click", function () {
        if (current_page != 0) {
            current_page --
            console.log(current_page)
            epub_content.innerText = book_array['uploaded-file'][current_page]
        }
    });

}
next_btns = document.getElementsByClassName("btn-pre-next");
for(let b=0; b<next_btns.length; b++){
    next_btns[b].addEventListener("click", function () {
        if (current_page != end_page) {
            current_page ++
            console.log(current_page)
            epub_content.innerText = book_array['uploaded-file'][current_page]
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


