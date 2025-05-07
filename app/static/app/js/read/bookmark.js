class Bookmark {
    constructor(book, user, page, scroll_position) {
        this.book = book;
        this.user = user;
        this.page = page;
        this.scroll_position = scroll_position;
    }

    static async save(bookmarkData) {
        try {
            const response = await fetch('/save-bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookmarkData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
            return new Bookmark(result); // or return result if no need to instantiate
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}


// let bookmark_string = ''
// document.getElementById("bookmark").addEventListener("click", function () {
//     current_book = document.getElementById("book-header").innerText;
//     bookmark_string = {
//         "book": `${current_book}`,
//         "page": `${current_page}`,
//         "username": `${username.trim()}`,
//         "book_id": `${curr_book}`
//     };
//     console.log(bookmark_string);

//     showSpinner();

// });
