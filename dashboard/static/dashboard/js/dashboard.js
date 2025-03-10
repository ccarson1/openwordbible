const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

let bookName = document.getElementById("book-name");
let bookReligion = document.getElementById("book-religion");
let inputBookDenom = document.getElementById("input-book-denom");
let textPreview = document.getElementById("text-preview");
let activeTabText = 'TXT';
let page_pile;


function set_page_numbers() {
    let pages = document.getElementsByClassName("page-container");
    for (let p = 0; p < pages.length; p++) {
        pages[p].children[1].innerText = p;
    }

}

function update_page_numbers() {
    for (let i = 0; i < document.getElementsByClassName("curr-page").length; i++) {
        document.getElementsByClassName("curr-page")[i].innerText = current_page;
        document.getElementsByClassName("total-pages")[i].innerText = page_pile.get_book_data()['uploaded-file']['content'].length;
    }
}

document.getElementById("btn-reset-page-numbers").addEventListener("click", function () {
    set_page_numbers();
});


document.getElementById("up-book-txt").addEventListener('change', function (event) {
    console.log("Uploading new book");

    let file = event.target.files[0];
    let allowedTypes = []
    if (file) {
        if (activeTabText == 'TXT') {
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
    formData.append("book-type", activeTabText)

    if (activeTabText == 'TXT') {
        page_pile = new Txtpub(book_file.files[0]);
    }
    else if (activeTabText == 'EPUB') {
        page_pile = new Epub(book_file.files[0]);
    }


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
        page_pile.set_book_data(data);
        page_pile.set_book_array();
        page_pile.set_content();
        if (activeTabText == 'TXT') {

            page_pile.populate_preview_text();
        }
        else if (activeTabText == 'EPUB') {
            epub_content = document.getElementById("text-preview");
            epub_content.innerText = page_pile.get_content();
        }

        current_page = page_pile.get_current_page();
        page_pile.set_end_page();
        page_pile.set_content_pages();
        //page_pile.fill_form();
        hideSpinner();
        update_page_numbers();

    })
});


back_btns = document.getElementsByClassName("btn-pre-back");
for (let a = 0; a < back_btns.length; a++) {
    back_btns[a].addEventListener("click", function () {
        if (current_page != 0) {
            current_page--
            page_pile.set_current_page(current_page);
            page_pile.set_content();
            page_pile.set_content_pages();
            epub_content.innerText = page_pile.get_content();
            update_page_numbers();
        }
    });

}
next_btns = document.getElementsByClassName("btn-pre-next");
for (let b = 0; b < next_btns.length; b++) {
    next_btns[b].addEventListener("click", function () {
        if (current_page != page_pile.get_end_page()) {
            current_page++
            page_pile.set_current_page(current_page);
            page_pile.set_content();
            epub_content.innerText = page_pile.get_content();
            update_page_numbers();
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


document.getElementById("btn-add-page").addEventListener("click", function () {
    let page_content = document.getElementById("text-preview").textContent;
    //console.log(page_pile.get_content());
    //let page_content = page_pile.get_content().join("");
    page_pile.populate_preview_pages(page_content);
});

document.getElementById("btn-add-all-page").addEventListener("click", function () {
    content_pages = page_pile.get_content_pages();
    console.log(content_pages);
    for (let c = 0; c < content_pages.length; c++) {
        if (activeTabText == "EPUB") {
            typeof (content_pages)
            page_pile.populate_preview_pages(content_pages[c].join(" "));
            //console.log(content_pages[c]);
        }
        else if (activeTabText == "TXT") {
            page_pile.populate_preview_pages(content_pages[0]);
        }
    }
    document.getElementById("total-preview-pages").innerText = `Pages: ${document.getElementsByClassName("page-container").length}`

});

document.getElementById("add-partition").addEventListener("click", function () {
    showSpinner();
    let search = document.getElementById("search-input").value;
    let content = document.getElementById("text-preview").value;
    let label = document.getElementById("label-input").value;
    let custom_regex = document.getElementById("input-custom");
    console.log(custom_regex.checked);
    let partition_regex = page_pile.generateRegexFromText(search, custom_regex.checked);
    console.log(partition_regex)
    partition = page_pile.partitionText(content, label, partition_regex);

    hideSpinner();
});

document.getElementById("btn-upload-page").addEventListener("click", function () {
    let pages_to_upload = document.getElementsByClassName("page-container");
    let pages_array = [];
    for (let p = 0; p < pages_to_upload.length; p++) {

        pages_array.push(pages_to_upload[p].textContent)
    }
    console.log(pages_array);

    book_image = document.getElementById("input-book-cover");

    book_data = new FormData();
    if(book_image.files.length > 0){
        book_data.append("book_image", book_image.files[0]);
    }else{
        console.error("No file selected");
    }
    book_data.append("published_book", pages_array)
    book_data.append("book_name", document.getElementById('book-name').value);
    book_data.append("book_date", document.getElementById('input-book-date').value);
    book_data.append("book_language", document.getElementById('input-book-lang').value);
    book_data.append("book_religion", document.getElementById('book-religion').value);
    book_data.append("book_denom", document.getElementById("input-book-denom").value);
    book_data.append("book_author", document.getElementById("input-book-author").value);
    book_data.append("book_translator", document.getElementById("input-book-translator").value);
    book_data.append("book_isbn", document.getElementById("input-book-isbn").value);
    book_data.append("book_description", document.getElementById("input-book-des").value);
    book_data.append("book_rights", document.getElementById("book-right").value);



    fetch("/api/publish-book/", {
        method: "POST",
        body: book_data,
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
        console.log(data)
    })
});

