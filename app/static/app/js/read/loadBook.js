

let bookReady = false;


window.onload = async (event) => {

    let bookmark = booksData['bookmark'];
    let startChapter = 0;
    let startPage = 0;

    if (bookmark) {
        for (let c = 0; c < current_book.content.length; c++) {
            if (current_book.content[c]['index'] == bookmark["current_chapter"]) {
                startChapter = c;
                startPage = bookmark["current_page"];
                break;
            }
        }
    }

    document.getElementById('total-pages').innerText = current_book.total_pages;

    let cols = document.getElementById("cols").value;
    let textColor = document.getElementById("color").value;
    let fontSize = document.getElementById("fontSize").value;
    let font = document.getElementById("font").value;

    const textLayout = document.getElementById("text-layout");
    textLayout.style.display = "block";
    textLayout.style.color = textColor;
    textLayout.style.fontSize = `${fontSize}px`;
    textLayout.style.columnCount = cols;
    if (font) textLayout.style.fontFamily = font;

    if (current_book.content.length > 0) {
        await goToPage(startChapter, startPage);
        if (bookmark && bookmark["scroll_position"]) {
            window.scrollTo({ top: bookmark["scroll_position"] });
        }
    }
    bookReady = true;

    async function progressivelyLoadChapters() {
        let totalChapters = current_book.content.length;
        let center = current_book.current_chapter;
        let offset = 1;

        while (true) {
            let left = center - offset;
            let right = center + offset;

            const promises = [];

            if (left >= 0) promises.push(loadChapter(left));
            if (right < totalChapters) promises.push(loadChapter(right));

            if (promises.length === 0) break;

            await Promise.all(promises);
            offset++;
        }
    }

    progressivelyLoadChapters();

}

