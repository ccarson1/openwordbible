const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

let bookName = document.getElementById("book-name");
let bookReligion = document.getElementById("book-religion");
let inputBookDenom = document.getElementById("input-book-denom");
let textPreview = document.getElementById("text-preview");
let activeTabText = 'TXT';
let page_pile;

let formated_book = {
    "content": [

    ]
}


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

function collect_index() {
    let chapters = document.getElementsByClassName('outline-element');
    newIndex = [];

    for (let x = 0; x < chapters.length; x++) {
        let header = chapters[x].children[0].value;
        let page = chapters[x].children[1].value;

        newIndex.push(
            {
                "header": header,
                "page": page
            }
        )
    }

    return newIndex
}



document.getElementById("btn-reset-page-numbers").addEventListener("click", function () {
    set_page_numbers();
});


document.getElementById("up-book-txt").addEventListener('change', function (event) {
    console.log("Uploading new book");

    let file = event.target.files[0];
    let allowedTypes = []
    activeTabText = activeTabText.toLocaleUpperCase();
    if (file) {
        if (activeTabText == 'TXT') {
            allowedTypes.push("text/plain");
        }
        else if (activeTabText == 'PDF') {
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
        console.log("Detected file type:", file.type);
        // if (!allowedTypes.includes(file.type)) {
        //     console.error(`Invalid file type. Please upload a ${activeTabText} file.`);
        //     alert(`Invalid file type. Only ${activeTabText} files are allowed.`);
        //     event.target.value = "";
        //     return;
        // }

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

    document.getElementById("add-partition").disabled = false;
    document.getElementById("add-outline-element").disabled = false;
    document.getElementById("btn-add-all-page").disabled = false;
    document.getElementById("btn-add-page").disabled = false;
    document.getElementById("btn-reset-page-numbers").disabled = false;
    document.getElementById("btn-upload-page").disabled = false;

    if (activeTabText == 'TXT') {
        page_pile = new Txtpub(book_file.files[0]);
    }
    else if (activeTabText == 'EPUB') {
        page_pile = new Epub(book_file.files[0]);
    }
    else if (activeTabText == 'PDF') {
        page_pile = new Pdf_obj(book_file.files[0]);
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
                preview_content = document.getElementById("text-preview");
                preview_content.innerText = page_pile.get_content();
            }
            else if (activeTabText == 'PDF') {
                preview_content = document.getElementById("text-preview");
                preview_content.innerText = page_pile.get_content();
            }

            current_page = page_pile.get_current_page();
            page_pile.set_end_page();
            page_pile.set_content_pages();
            page_pile.outline_container();
            //page_pile.fill_form();
            page_pile.initiate_outline();
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
            preview_content.innerText = page_pile.get_content();
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
            preview_content.innerText = page_pile.get_content();
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

    let chapters = 2
    if (page_pile.outline.length > 0) {
        for (let x = 0; x < page_pile.outline.length - 1; x++) {
            start = parseInt(page_pile.outline[x]['page']) - 1
            end = parseInt(page_pile.outline[x + 1]['page']) - 1
            chapter_pages = page_pile.content_pages.slice(start, end)
            formated_book.content.push(
                {
                    "chapter": page_pile.outline[x]['title'],
                    "pages": chapter_pages,
                    "start": start,
                    "end": end,
                    "length": chapter_pages.length
                }
            )
        }
    }
    else {
        formated_book.content.push(
            {
                "chapter": page_pile.book_data['uploaded-file']['title'],
                "pages": [page_pile.content],
                "start": 0,
                "end": 1,
                "length": page_pile.book_data['uploaded-file'].content.length
            }
        )
    }







    for (let c = 0; c < formated_book.content.length; c++) {
        if (activeTabText == "EPUB") {
            typeof (content_pages)
            page_pile.populate_preview_pages(content_pages[c].join(" "));
            //console.log(content_pages[c]);
        }
        else if (activeTabText == "TXT") {
            page_pile.populate_preview_pages(content_pages[0]);
        }
        else if (activeTabText == "PDF") {
            page_pile.populate_preview_pages(c);

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
    showSpinner();
    // let pages_to_upload = document.getElementsByClassName("page-container");
    // let pages_array = [];
    // for (let p = 0; p < pages_to_upload.length; p++) {

    //     pages_array.push(pages_to_upload[p].textContent)
    // }
    //console.log(pages_array);

    book_image = document.getElementById("input-book-cover");
    book_index = collect_index();
    book_data = new FormData();
    if (book_image.files.length > 0) {
        book_data.append("book_image", book_image.files[0]);
    } else {
        console.error("No file selected");
    }
    let published_book = JSON.stringify(formated_book);

    book_data.append("published_book", JSON.stringify(formated_book));
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
    book_data.append("book_publisher", document.getElementById("book-pub").value);
    book_data.append("book_index", JSON.stringify(book_index));



    //console.log(JSON.stringify(pages_array))
    fetch("/api/publish-book/", {
        method: "POST",
        body: book_data,
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
        .then(response => {
            if (!response.ok) {
                hideSpinner();
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            hideSpinner();
            console.log(data)
            alert(data['message'])
        })

});

document.getElementById("add-outline-element").addEventListener("click", function(){
    let newElementTitle = document.getElementById("new-element-title").value;
    let newElementValue = document.getElementById("new-element-value").value;

    let offset_page = page_pile.book_data['uploaded-file'].offest_page
    let active_page = parseInt(newElementValue);
    for(x=0; x<offset_page.length; x++){
        console.log(`Adjusting the page's offset ${active_page} : ${offset_page[x]['offset']}`)
        if(active_page <= offset_page[x]['page']){
            console.log(`Adjusting the page's offset ${active_page} : ${offset_page[x]['offset']}`)
            if(active_page == 1){
                newElementValue = 1
            }
            else{
                newElementValue = (active_page - offset_page[x]['offset']);
            }
            
            break;
        }
    }


    console.log(`Adding Outline ${newElementTitle} with value ${newElementValue}`);
    page_pile.outline.push({title: newElementTitle, page: newElementValue})
    page_pile.clear_outline();
    document.getElementById("new-element-title").value = "";
    document.getElementById("new-element-value").value = "";
});

