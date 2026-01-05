

let pages = 0;
let firstPage = 0;

function create_pages(array, chunkSize) {
    const new_array = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        new_array.push(array.slice(i, i + chunkSize));
    }
    return new_array;
}


window.onload = (event) => {


    console.log(booksData['bookmark'])
    let bookmark = booksData['bookmark'];
    console.log(bookmark["chapter"])
    if (bookmark) {
        //goToPosition(bookmark.chapter, bookmark.page, bookmark.word, bookmark.scroll);
        console.log(bookmark["current_chapter"], bookmark["current_page"], bookmark["current_word"], bookmark["scroll_position"]);
        current_book.current_chapter = bookmark["current_chapter"];
        console.log(current_book["current_chapter"])
    }

    console.log(`The content type is ${typeof (current_book["content"])}`);
    let book_content = current_book['content']


    current_book.content = book_content
    //current_book.callTotalPages();
    console.log(current_book.content[current_book.current_chapter]['pages'][current_book.current_page]);
    document.getElementById('total-pages').innerText = current_book.total_pages;
    console.log(current_book.current_chapter)
    let textArray = current_book.content[current_book.current_chapter]['pages'][current_book.current_page];
    let pageText = []
    for (let a = 0; a < textArray.length; a++) {
        console.log(textArray[a]['text']);
        pageText.push(textArray[a]['text'])
    }
    console.log(`Current Chapter is ${current_book.current_chapter}`)
    console.log(`Current Page: ${current_book.current_page}`)


    let cols = document.getElementById("cols").value;
    let textColor = document.getElementById("color").value;
    let fontSize = document.getElementById("fontSize").value;

    console.log(`Font Size is ${fontSize}`);
    document.getElementById("text-layout").style.display = "block";
    document.getElementById("text-layout").style.color = textColor;
    document.getElementById("text-layout").style.fontSize = `${fontSize}px`;
    document.getElementById("text-layout").style.columnCount = cols;
    console.log(pageText);
    create_word_layout(pageText);

    async function fetchChapter(index) {
        if (
            index < 0 ||
            index >= current_book.content.length ||
            current_book.content[index].pages.length > 0
        ) {
            return; // Out of bounds or already loaded
        }

        try {
            const response = await fetch(`/api/book/${current_book.id}/chapter/${index}/`);
            if (!response.ok) {
                throw new Error("Failed to load chapter");
            }
            const data = await response.json();
            current_book.content[index].pages = data.pages;  // Fill in the missing pages
            // console.log(`Loaded chapter ${index}`);
        } catch (err) {
            console.error(`Error loading chapter ${index}:`, err);
        }
    }

    async function progressivelyLoadChapters() {
        let totalChapters = current_book.content.length;
        let center = current_book.current_chapter;
        let offset = 1;

        while (true) {
            let left = center - offset;
            let right = center + offset;

            const promises = [];

            if (left >= 0) promises.push(fetchChapter(left));
            if (right < totalChapters) promises.push(fetchChapter(right));

            if (promises.length === 0) break;

            await Promise.all(promises);
            offset++;
        }

        console.log("All chapters loaded.");
    }

    progressivelyLoadChapters();




}

