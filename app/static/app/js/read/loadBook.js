

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


    (async () => {
        try {

            const bookmark = await Bookmark.load(current_book.id);
            if (bookmark) {
                //goToPosition(bookmark.chapter, bookmark.page, bookmark.word, bookmark.scroll);
                console.log(bookmark.chapter, bookmark.page, bookmark.word, bookmark.scroll);
                current_book.current_chapter = bookmark.chapter;
                console.log(current_book.current_chapter)
            }

            console.log(`The content type is ${typeof (current_book["content"])}`);
            let book_content = current_book['content']


            current_book.content = book_content
            current_book.callTotalPages();
            console.log(current_book.content[current_book.current_chapter]['pages'][current_book.current_page]);
            document.getElementById('total-pages').innerText = current_book.total_pages + 1;
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

        } catch (error) {
            console.error("Failed to load bookmark:", error);
        }
    })();




}

