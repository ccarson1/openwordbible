let bookmark_string= ''


document.getElementById("bookmark").addEventListener("click", function(){
    current_book = document.getElementById("book-header").innerText;
    bookmark_string =  {
        "book": `${current_book}`,
        "page":  `${current_page}`,
        "username": `${username.trim()}`,
        "book_id": `${curr_book}`
    };
    console.log(bookmark_string);

    showSpinner();
    fetch('/save-bookmark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmark_string)
    })
        .then(response => response.json())
        .then(result => {
            hideSpinner();

            console.log(result);
            bookmark = result;
        })
        .catch(error => {
            // Hide spinner
            hideSpinner();
            console.error('Error:', error);
        });
});
