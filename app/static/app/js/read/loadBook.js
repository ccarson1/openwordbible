
// let books = document.getElementsByClassName("dropdown-item");
// let curr_book;
// let verses = "";

// for (let b = 0; b < books.length; b++) {

//     books[b].addEventListener("click", function () {
//         curr_book = b + 1;
//         sendBookRequest(this.getAttribute("value"));

//         document.getElementById("btn-new-note").disabled = false;
//         document.getElementsByClassName("page-nav")[0].style.visibility = "visible";
//         document.getElementsByClassName("page-nav")[1].style.visibility = "visible";
//     });
// }

// function create_clickable_passages(verses) {
//     let clickable_passages = document.getElementsByClassName("passage");
//     for (let cp = 0; cp < clickable_passages.length; cp++) {
//         clickable_passages[cp].addEventListener("click", function () {
//             Array.from(document.getElementsByClassName("word")).forEach(word => {
//                 word.style.backgroundColor = "white";
//                 //word.style.borderColor = "white";
//                 //word.onmouseover = function(){word.style.borderRadius = "5px";}
//                 //word.onmouseover = function(){word.style.backgroundColor = "rgba(90, 136, 204, 0.795)";}
//                 //word.onmouseout = function(){word.style.backgroundColor = "white";}
//             });
//             //set tooltip attributes
//             this.setAttribute("data-bs-toggle", "popover");
//             this.setAttribute("data-placement", "bottom");
//             this.setAttribute("title", "Double click to make a note for " + this.innerText);
//             this.style.padding = "2%";

//             let selection = document.getElementsByClassName("w"+ (cp+1) + " p"+(current_page));
//             console.log("w"+ (cp+1) + " p"+(current_page));
//             console.log("Current page: " + current_page);
//             for(let s=0; s<selection.length; s++){
//                 console.log(selection[s]);
//                 selection[s].style.backgroundColor = "#0dcaf0";
//                 // selection[s].style.borderColor = "#0dcaf0";
//                 // selection[s].style.border = "1px solid #0dcaf0";
//                 // selection[s].style.borderRadius = "5px";
//             }
//             console.log(selection);
//             console.log(selection.length)
//         });

//         clickable_passages[cp].addEventListener("dblclick", function(){
//             myModal.show();
//             document.getElementById("note-title").value = document.getElementById("notes-header").innerText + " Verse " + this.innerText;
//             document.getElementById("note-data").value = "";
//             document.getElementById("NoteModalLabel").innerText = "New Note";
//         });

//     }
// }

// function sendBookRequest(book) {
//     // Define the data to send
//     console.log("The book id being sent to the backend is " + curr_book)
//     username = document.getElementById("ui-username").innerText;
//     const data = { name: username, book: book, book_id: curr_book };

//     // Show spinner
//     showSpinner();

//     // Send a POST request
//     fetch('/submit-data', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     })
//         .then(response => response.json())
//         .then(result => {
//             current_page = 0;
//             console.log('Success:', result);
//             document.getElementById("page-text").innerHTML = result['passage'];
//             document.getElementById("book-header").innerText = result['book'];
//             document.getElementById("notes-header").innerText = result['book'];

//             const notes = result.notes;

//             console.log(notes)
//             document.getElementById('notes-list').innerHTML = "";
//             for (let i = 0; i < notes.length; i++) {
//                 console.log(notes[i].id);
//                 console.log(notes[i].title);
//                 console.log(notes[i].book);
//                 console.log(notes[i].data);

//                 //Adds note to the DOM
//                 addItem(notes[i].title, notes[i].data, notes[i].id)
//             }


//             setupStartPage();
//             verses = load_page_array();

//             create_clickable_passages(verses);

//             if(curr_book != book){
//                 setPagButtons(0);
//             }
//             else{
//                 setPagButtons(getCookie(bookmarkpage));
//             }
//             // Hide spinner
//             hideSpinner();
//         })
//         .catch(error => {
//             // Hide spinner
//             hideSpinner();
//             console.error('Error:', error);
//         });
// }


// function load_page_array() {

//     let col_length = document.getElementsByClassName("read_cols").length;
//     page_array = ''
//     for(let c=0; c<col_length;c++){
//         let word_length = document.getElementsByClassName("read_cols")[c].children.length;
//         for(let w=0; w<word_length;w++){
//             word = document.getElementsByClassName("read_cols")[c].children[w].innerText;
//             page_array = `${page_array} ${word}`;
//         }
//     }

//     page_array = page_array.split(/{\d+:\d+}/);
//     page_array = page_array.filter(element => element && element.trim().length > 0);


//     return page_array;

// }
let pages = 0;
let firstPage = 0;

function create_pages(array, chunkSize) {
    const new_array = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        new_array.push(array.slice(i, i + chunkSize));
    }
    return new_array;
}



// function create_word_layout(textArray) {
//     let textLayout = document.getElementById("text-layout");
//     let wordsPerPage = parseInt(document.getElementById("wordsPerPage").value, 10);

//     // Get paginated pages
//     pages = create_pages(textArray, wordsPerPage);

//     // Clear previous layout
//     textLayout.innerHTML = "";

//     // Show first page (you can change this to any page index)
//     firstPage = pages[0]

//     firstPage.forEach(word => {
//         let newWord = document.createElement("div");
//         newWord.setAttribute("class", "word");
//         newWord.innerText = word;
//         textLayout.append(newWord);
//     });

//     console.log(`Total pages: ${pages.length}`);
// }

window.onload = (event) => {
    console.log(`The content type is ${typeof(current_book["content"])}`);
    let book_content = JSON.parse(current_book["content"])
    

    current_book.content = book_content
    current_book.callTotalPages();
    console.log(current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page]);

    let pageText = current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page];
    console.log(`Current Chapter is ${current_book.current_chapter}`)
    console.log(`Current Page: ${current_book.current_page}`)
    let textArray = pageText.split(/\s+/);

    let cols = document.getElementById("cols").value;
    let textColor = document.getElementById("color").value;
    let fontSize = document.getElementById("fontSize").value;

    console.log(`Font Size is ${fontSize}`);
    document.getElementById("text-layout").style.display = "block";
    document.getElementById("text-layout").style.color = textColor;
    document.getElementById("text-layout").style.fontSize =  `${fontSize}px`;
    document.getElementById("text-layout").style.columnCount = cols;
    console.log(textArray);
    create_word_layout(textArray);


}

