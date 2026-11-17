const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

let bookName = document.getElementById("book-name");
let bookReligion = document.getElementById("book-religion");
let inputBookDenom = document.getElementById("input-book-denom");
let textPreview = document.getElementById("text-preview");
let activeTabText = 'TXT';
let page_pile;
let progressInterval = null;
let preview_content = document.getElementById("text-preview");
const CHUNK_SIZE = 250 * 1024;
const OWB_SERVICE_URL = document.getElementById("owb-service-url").innerText.trim().replace(/\/$/, "");
const DEFAULT_SENTENCE_REGEX = /(?<=[.!?]["'”’)\]]?)\s+(?=["'“‘(\[]?[A-Z0-9])/;

let formated_book = {
    "content": [

    ]
}


function set_page_numbers() {
    page_pile.refresh_preview_pages();
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

function updateProgressBar(percent, message) {
    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");

    if (bar) bar.style.width = `${percent}%`;
    if (text) text.innerText = message;
}

function pollProgress() {
    if (progressInterval) return;

    progressInterval = setInterval(async () => {
        try {
            const res = await fetch(`${OWB_SERVICE_URL}/progress`);
            const data = await res.json();

            // 🔥 USE BACKEND VALUE DIRECTLY
            updateProgressBar(data.percent || 0, data.message || "Processing...");

            if (data.done === true) {
                clearInterval(progressInterval);
                progressInterval = null;
                updateProgressBar(100, "Completed!");
            }
        } catch (err) {
            console.warn("Progress poll failed", err);
        }
    }, 500);
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
    let book_file = document.getElementById("up-book-txt");
    activeTabText = activeTabText.toLocaleUpperCase();
    if (book_file.files.length == 0) {
        alert("Choose a file to convert first.");
        return;
    }
    if (!['TXT', 'EPUB', 'PDF'].includes(activeTabText)) {
        alert(`${activeTabText} files are not supported yet.`);
        return;
    }

    showSpinner();
    let formData = new FormData();
    formData.append("book-file", book_file.files[0])
    formData.append("book-type", activeTabText)
    formData.append("words-per-page", document.getElementById("input-words-per-page").value)

    formated_book = { "content": [] };
    document.getElementById("page-list").innerHTML = "";
    document.getElementById("outline-container").innerHTML = "";
    document.getElementById("total-preview-pages").innerText = "Pages:";

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
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error || data.detail || `HTTP error! status: ${response.status}`);
                }
                return data;
            });
        })
        .then(data => {
            page_pile.set_book_data(data);
            page_pile.set_book_array();
            if (data['uploaded-file']['content'].length == 0) {
                throw new Error("No text was found in this file.");
            }
            page_pile.set_content();
            preview_content.innerText = page_pile.get_content();

            if (data['uploaded-file']['title'] && document.getElementById("book-name").value == "") {
                document.getElementById("book-name").value = data['uploaded-file']['title'];
            }
            if (data['uploaded-file']['author'] && document.getElementById("input-book-author").value == "") {
                document.getElementById("input-book-author").value = data['uploaded-file']['author'];
            }

            document.getElementById("add-partition").disabled = false;
            document.getElementById("add-outline-element").disabled = false;
            document.getElementById("btn-add-all-page").disabled = false;
            document.getElementById("btn-add-page").disabled = false;
            document.getElementById("btn-reset-page-numbers").disabled = false;
            document.getElementById("btn-upload-page").disabled = false;

            current_page = page_pile.get_current_page();
            page_pile.set_end_page();
            page_pile.set_content_pages();
            page_pile.outline_container();
            //page_pile.fill_form();
            hideSpinner();
            update_page_numbers();


        })
        .catch(error => {
            hideSpinner();
            alert("Convert failed: " + error.message);
        });
});


back_btns = document.getElementsByClassName("btn-pre-back");
for (let a = 0; a < back_btns.length; a++) {
    back_btns[a].addEventListener("click", function () {
        if (page_pile && current_page > 0) {
            current_page--
            page_pile.set_current_page(current_page);
            page_pile.set_content();
            preview_content.innerText = page_pile.get_content();
            update_page_numbers();
        }
    });

}
next_btns = document.getElementsByClassName("btn-pre-next");
for (let b = 0; b < next_btns.length; b++) {
    next_btns[b].addEventListener("click", function () {
        if (page_pile && current_page < page_pile.get_end_page()) {
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


function split_page(page, regex = page_pile.sentRegex || DEFAULT_SENTENCE_REGEX) {
    return page
        .replace(/\n/g, ' ')
        .split(regex)
        .map(s => s.trim())
        .filter(Boolean);
}

function ends_sentence(sentence) {
    return /[.!?]["'”’)\]]?$/.test(sentence);
}

document.getElementById("btn-add-page").addEventListener("click", function () {
    let sentences = split_page(preview_content.innerText);
    if (sentences.length == 0) return;

    if (formated_book.content.length == 0) {
        formated_book.content.push({
            chapter: document.getElementById("book-name").value || "Chapter 1",
            pages: []
        });
    }
    formated_book.content[formated_book.content.length - 1].pages.push(sentences);
    page_pile.refresh_preview_pages();
});

document.getElementById("btn-add-all-page").addEventListener("click", function () {
    let content_pages = page_pile.get_content_pages();

    // Split every page into sentences. A sentence that runs past the end
    // of a page is moved to the start of the next page so it isn't cut in two.
    let sentence_pages = [];
    let carry = "";
    for (let p = 0; p < content_pages.length; p++) {
        let text = Array.isArray(content_pages[p]) ? content_pages[p].join(" ") : content_pages[p];
        let sentences = split_page((carry + " " + text).trim());
        carry = "";
        if (p < content_pages.length - 1 && sentences.length > 1 && !ends_sentence(sentences[sentences.length - 1])) {
            carry = sentences.pop();
        }
        sentence_pages.push(sentences);
    }

    page_pile.sync_outline();
    let outline = page_pile.outline
        .map(o => ({ title: (o.title || "").trim(), page: parseInt(o.page) }))
        .filter(o => !isNaN(o.page) && o.page >= 1 && o.page <= sentence_pages.length)
        .sort((a, b) => a.page - b.page);

    formated_book.content = [];

    if (outline.length > 0) {
        if (outline[0].page > 1) {
            formated_book.content.push({
                chapter: "Front Matter",
                pages: sentence_pages.slice(0, outline[0].page - 1)
            });
        }
        for (let x = 0; x < outline.length; x++) {
            let start = outline[x].page - 1;
            let end = (x + 1 < outline.length) ? outline[x + 1].page - 1 : sentence_pages.length;

            formated_book.content.push({
                chapter: outline[x].title || `Chapter ${x + 1}`,
                pages: sentence_pages.slice(start, end)
            });
        }
    }
    else {
        formated_book.content.push({
            chapter: document.getElementById("book-name").value || "Chapter 1",
            pages: sentence_pages
        });
    }

    page_pile.refresh_preview_pages();

});

document.getElementById("add-partition").addEventListener("click", function () {
    showSpinner();
    let content = document.getElementById("text-preview").innerText;
    let label = document.getElementById("label-input").value;
    let delimiter = document.getElementById("search-input").value;

    const partition = page_pile.partitionText(content, label, delimiter);

    if (partition.errorMessage) {
        alert(partition.errorMessage);
    }

    hideSpinner();
});

document.getElementById("btn-upload-page").addEventListener("click", function () {
    if (formated_book.content.length == 0) {
        alert("Press Add All to build the pages before uploading.");
        return;
    }
    if (document.getElementById('book-name').value.trim() == "" || document.getElementById('input-book-lang').value == "") {
        alert("The book needs a name and a language.");
        return;
    }
    page_pile.recount_chapters();
    showSpinner();
    book_image = document.getElementById("input-book-cover");
    book_index = collect_index();
    book_data = new FormData();
    if (book_image.files.length > 0) {
        book_data.append("book_image", book_image.files[0]);
    } else {
        console.error("No file selected");
    }
    let published_book = JSON.stringify(formated_book);

    book_data.append("published_book", published_book);
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



    fetch("/api/publish-book/", {
        method: "POST",
        body: book_data,
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error || data.detail || `HTTP error! status: ${response.status}`);
                }
                return data;
            });
        })
        .then(data => {
            hideSpinner();
            alert(data['message'] + " Turn on Publish in Books to show it in the library.")
        })
        .catch(error => {
            hideSpinner();
            alert("Upload failed: " + error.message);
        });

});

document.getElementById("add-outline-element").addEventListener("click", function () {
    let newElementTitle = document.getElementById("new-element-title").value;
    let newElementValue = document.getElementById("new-element-value").value;

    if (newElementTitle.trim() == "" || isNaN(parseInt(newElementValue))) {
        alert("Enter a chapter name and a page number.");
        return;
    }

    page_pile.sync_outline();
    page_pile.outline.push({ title: newElementTitle, page: parseInt(newElementValue) })
    page_pile.outline.sort((a, b) => parseInt(a.page) - parseInt(b.page));
    page_pile.clear_outline();
    document.getElementById("new-element-title").value = "";
    document.getElementById("new-element-value").value = "";
});

document.getElementById("label-input").addEventListener("change", function () {
    let label = document.getElementById("label-input").value;

    if (label == 'sentence') {
        document.getElementById("search-input").value = '(?<=[.!?])\\s+(?=[A-Z\\[])';
    }
});


document.getElementById("btn-annotate-page").addEventListener("click", async function () {
    showSpinner();
    pollProgress();

    const book_image = document.getElementById("input-book-cover").files[0];
    const book_name = document.getElementById("book-name").value;
    const book_author = document.getElementById("input-book-author").value;
    const book_index = collect_index();

    if (!formated_book || formated_book.content.length == 0) {
        hideSpinner();
        alert("Press Add All to build the pages before annotating.");
        return;
    }

    page_pile.recount_chapters();
    const formated_book_string = JSON.stringify(formated_book);
    //const CHUNK_SIZE = 500000; // ~500 KB per chunk
    const totalChunks = Math.ceil(formated_book_string.length / CHUNK_SIZE);

    try {
        for (let i = 0; i < totalChunks; i++) {
            const chunk = formated_book_string.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

            const formData = new FormData();
            formData.append("book_name", book_name);
            formData.append("book_author", book_author);
            formData.append("book_index", JSON.stringify(book_index));
            if (book_image) formData.append("book_image", book_image);
            formData.append("published_book_chunk", chunk);
            formData.append("chunk_index", i);
            formData.append("total_chunks", totalChunks);

            const response = await fetch(`${OWB_SERVICE_URL}/process`, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRFToken": csrftoken,
                },
            });

            if (!response.ok) {
                throw new Error(`Chunk ${i + 1} upload failed: ${response.status}`);
            }

            // Update progress after each chunk
            const percentUploaded = Math.round(((i + 1) / totalChunks) * 30); // e.g., upload = 0-30%
            updateProgressBar(percentUploaded, `Uploaded chunk ${i + 1}/${totalChunks}`);

            const data = await response.json();
            if (data.published_book) {
                formated_book = data.published_book;
            }
        }

        page_pile.refresh_preview_pages();
        hideSpinner();
        alert("Book uploaded and processed successfully!");
    } catch (err) {
        hideSpinner();
        console.error(err);
        alert("Annotation failed: " + err.message + ". Is the OWB Service running?");
    }
});
