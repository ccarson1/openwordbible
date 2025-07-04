class Book {
    constructor(file) {
        this.file = file;
        this.bookdata;
        this.book_array;
        this.content;
        this.current_page = 0;
        this.end_page = 0;
        this.content_pages;
        this.total_pages;
        this.partition_text;
        this.matches = [];
        this.outline;
        this.offest_page
        this.sentRegex;

    }

    fill_form(data = this.book_array) {
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

    split_words(text) {
        console.log(text)
        text = text.replace("\n", " ");
        return text.split(/\s+/);
    }

    splitTextIntoChunks(words, wordsPerChunk = 255) {
        wordsPerChunk = parseInt(wordsPerChunk);
        const chunks = [];
        //page_text = ''
        let counter = 0;
        for (let i = 0; i < words.length; i++) {
            if (i == (parseInt(wordsPerChunk) * counter)) {
                console.log(i)
                console.log((wordsPerChunk * counter) + wordsPerChunk)
                console.log(words.slice(i, (wordsPerChunk * counter) + wordsPerChunk).length)
                chunks.push(words.slice(i, (wordsPerChunk * counter) + wordsPerChunk).join(' '));
                counter++;
            }

        }

        return chunks;
    }

    

    get_conversion(page_content, wordsPerPage) {
        let words = this.split_words(page_content);
        let page_array = this.splitTextIntoChunks(words, wordsPerPage);

        return page_array;
    }


    generateRegexFromText(text, custom_regex) {

        return text


    }

    populate_preview_text(content = this.get_content()) {

        let preview_text = document.getElementById("text-preview");
        preview_text.innerText = content;

    }



    partitionText(text, label, delimiter) {
        console.log(delimiter);

        try {
            const regex = new RegExp(delimiter, "g");

            if (label == 'sentence') {
                console.log(label)
                this.sentRegex = regex;
            }
            //const regex = /(?<=[.!?])\s+(?=[A-Z\[])/g;
            const sentences = text.split(regex);
            const matches = [...text.matchAll(regex)];

            this.matches = matches;
            document.getElementById("text-preview").innerHTML = ""
            for (let x = 0; x < sentences.length; x++) {
                sentences[x] = sentences[x].split(/\s+/);
                let newsent = document.createElement("span");
                newsent.setAttribute("class", "sentencePortion");

                for (let y = 0; y < sentences[x].length; y++) {
                    let newdiv = document.createElement("span");
                    newdiv.setAttribute("class", "regexWord");
                    newdiv.innerText = sentences[x][y];
                    newdiv.style.display = "inline-block";
                    newdiv.style.marginRight = "4px";
                    newsent.appendChild(newdiv);


                }
                document.getElementById("text-preview").appendChild(newsent);
            }

            return {
                label,
                matches,
                sentences
            };
        }
        catch (error) {
            console.error("An error occurred:", error.message);
            return {
                errorMessage: `Invalid regex: ${error.message}`
            }
        }


    }


    createEditorPopup(targetElement) {

        console.log(targetElement)

        // Create overlay background
        let overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "1000";

        // Create popup container
        let popup = document.createElement("div");
        popup.style.backgroundColor = "white";
        popup.style.padding = "20px";
        popup.style.borderRadius = "8px";
        popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
        popup.style.minWidth = "300px";
        popup.style.width = "70%";


        // Create textarea
        let textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "70vh";
        textarea.value = targetElement.children[0].innerText;

        // Create buttons
        let saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.style.marginRight = "10px";

        let cancelButton = document.createElement("button");
        cancelButton.innerText = "Cancel";

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        // Append elements
        popup.appendChild(textarea);
        popup.appendChild(document.createElement("br"));
        popup.appendChild(saveButton);
        popup.appendChild(cancelButton);
        popup.appendChild(deleteButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Save button action
        saveButton.addEventListener("click", function () {
            targetElement.innerText = textarea.value;
            document.body.removeChild(overlay);
        });

        // Cancel button action
        cancelButton.addEventListener("click", function () {
            document.body.removeChild(overlay);
        });

        deleteButton.addEventListener("click", function () {
            document.getElementById("page-list").removeChild(targetElement);
            document.body.removeChild(overlay);
        });
    }

    populate_preview_pages(c) {

        let page_list = document.getElementById("page-list");
        let newChapter = document.createElement("div");
        newChapter.textContent = formated_book.content[c]['chapter'];
        newChapter.setAttribute("class", "page-container");

        for (let p = 0; p < formated_book.content[c]['pages'].length; p++) {
            let newPage = document.createElement("div");
            newPage.textContent = formated_book.content[c]['pages'][p];
            newPage.setAttribute("class", "page-list-item");
            newChapter.appendChild(newPage);
        }
        newChapter.addEventListener("click", () => {
            this.createEditorPopup(newChapter);
        });
        page_list.appendChild(newChapter);


    }

    set_book_data(book_data) {
        this.book_data = book_data;
    }
    get_book_data() {
        return this.book_data;
    }
    set_book_array(book_array = this.book_data['uploaded-file']) {
        this.book_array = book_array;
    }
    get_book_array() {
        return this.book_array;
    }
    set_content(content = this.book_array["content"][this.current_page]) {
        this.content = content;
    }
    get_content() {
        return this.content;
    }
    set_current_page(current_page) {
        this.current_page = current_page;
    }
    get_current_page() {
        return this.current_page;
    }

    set_end_page(end_page = this.book_data['uploaded-file'].length) {
        this.end_page = end_page;
    }
    get_end_page() {
        return this.end_page;
    }
    set_content_pages(content_pages = this.book_data['uploaded-file']['content']) {
        this.content_pages = content_pages;
    }
    get_content_pages() {
        return this.content_pages;
    }
    set_partitionText(partition_text) {
        this.partition_text = partition_text;
    }
    get_partitionText() {
        return this.partitionText;
    }
    set_outline(outline = this.book_data['uploaded-file']['book_outline']) {
        this.outline = outline;
    }
    get_outline() {
        return this.outline;
    }
    set_offest_page(offest_page = this.book_array["offset_page"]) {
        this.offest_page = offest_page;
    }
    get_offset_page() {
        return this.offest_page;
    }
}