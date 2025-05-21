// const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
// let current_page = 0;
// let  pag, pag2, prevs, nexts;

// function setupStartPage(current_page = 0) {
//     cols = document.getElementsByClassName("read_cols");
//     pag = document.getElementsByClassName("pag");
//     pag2 = document.getElementsByClassName("pag2");

//     for (let x = 0; x < pages.length; x++) {
//         pages[x].style.display = "none";
//     }

//     if (pages[current_page]) {
//         pages[current_page].style.display = "block";
//         document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
//     } else {
//         console.log("page not loaded");
//     }

//     if (pag.length > 0 && pag2.length > 0) {
//         pag[0].style.backgroundColor = "gray";
//         pag2[0].style.backgroundColor = "gray";
//     }
// }

// function setPagButtons(nav_pag) {
//     for (let g = 0; g < pag.length; g++) {
//         pag[g].style.backgroundColor = "white";
//         pag2[g].style.backgroundColor = "white";

//         if (nav_pag % 3 > 1 && nav_pag > 2) {
//             pag[g].innerText = parseInt(pag[g].innerText) - 3;
//             pag2[g].innerText = parseInt(pag2[g].innerText) - 3;
//         } else if (nav_pag >= 3) {
//             pag[g].innerText = parseInt(pag[g].innerText) + 3;
//             pag2[g].innerText = parseInt(pag2[g].innerText) + 3;
//         } else if (nav_pag == 0 && parseInt(pag[g].innerText) > 3) {
//             pag[g].innerText = parseInt(pag[g].innerText) - 3;
//             pag2[g].innerText = parseInt(pag2[g].innerText) - 3;
//         }

//         // Hide if exceeds page count
//         if (parseInt(pag[g].innerText) > pages.length) {
//             pag[g].style.display = "none";
//             pag2[g].style.display = "none";
//         } else {
//             pag[g].style.display = "inline-block";
//             pag2[g].style.display = "inline-block";
//         }
//     }

//     pag[nav_pag % 3].style.backgroundColor = "gray";
//     pag2[nav_pag % 3].style.backgroundColor = "gray";
// }

// function addPaginationListeners() {
//     prevs = document.getElementsByClassName("prev");
//     nexts = document.getElementsByClassName("next");

//     for (let p = 0; p < prevs.length; p++) {
//         prevs[p].addEventListener("click", () => {
//             if (current_page > 0) {
//                 //pages[current_page].style.display = "none";
//                 current_page--;
//                 //pages[current_page].style.display = "block";
//                 window.scrollTo({ top: 0 });
//                 //document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
//                 setPagButtons(current_page);
//             }
//         });
//     }

//     for (let n = 0; n < nexts.length; n++) {
//         nexts[n].addEventListener("click", () => {
//             if (current_page < pages.length - 1) {
//                 //pages[current_page].style.display = "none";
//                 current_page++;
//                 //pages[current_page].style.display = "block";
//                 window.scrollTo({ top: 0 });
//                 //document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
//                 setPagButtons(current_page);
//             }
//         });
//     }

//     for (let g = 0; g < pag.length; g++) {
//         pag[g].addEventListener("click", function () {
//             pageJump(parseInt(this.innerText) - 1);
//         });

//         pag2[g].addEventListener("click", function () {
//             pageJump(parseInt(this.innerText) - 1);
//         });
//     }
// }

// function pageJump(note_page) {
//     if (note_page >= 0 && note_page < pages.length) {
//         pages[current_page].style.display = "none";
//         current_page = note_page;
//         pages[current_page].style.display = "block";
//         window.scrollTo({ top: 0 });
//         document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
//         setPagButtons(current_page);
//     }
// }

// function paginateTextFromDOM() {
//     pages = document.getElementsByClassName("read_cols");

//     pag = document.getElementsByClassName("pag");
//     pag2 = document.getElementsByClassName("pag2");

//     // Show only first 3 page buttons if total pages > 3
//     for (let g = 0; g < pag.length; g++) {
//         let pageIndex = parseInt(pag[g].innerText) - 1;
//         if (pageIndex >= pages.length) {
//             pag[g].style.display = "none";
//             pag2[g].style.display = "none";
//         } else {
//             pag[g].style.display = "inline-block";
//             pag2[g].style.display = "inline-block";
//         }
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     paginateTextFromDOM();
//     setupStartPage(current_page);
//     addPaginationListeners();
// });



// // function loadBookmark() {
// //     showSpinner();
// //     console.log("Bookmark Loading...")

// //     username = document.getElementById("ui-username").innerText.trim();
// //     console.log(username)

// //     fetch('/api/load-bookmark/', {
// //         method: 'POST',
// //         headers: {
// //             'Content-Type': 'application/json',
// //             'X-CSRFToken': csrftoken
// //         },
// //         body: JSON.stringify({ "username": username })
// //     })
// //         .then(response => response.json())
// //         .then(result => {
// //             console.log('Success:', result);
// //             document.getElementById("page-text").innerHTML = result['passage'];
// //             document.getElementById("book-header").innerText = result['book'];
// //             document.getElementById("notes-header").innerText = result['book'];


// //             const notes = result.notes;
// //             let page = result.page;
// //             document.cookie = `bookmarkpage=${page};bookmarkbook=${result['book']}`;
// //             console.log(page);
// //             curr_book = result['book_id'];
// //             current_page = page;

  

// //             console.log(notes)
// //             document.getElementById('notes-list').innerHTML = "";
// //             for (let i = 0; i < notes.length; i++) {
// //                 console.log(notes[i].id);
// //                 console.log(notes[i].title);
// //                 console.log(notes[i].book);
// //                 console.log(notes[i].data);

// //                 //Adds note to the DOM
// //                 addItem(notes[i].title, notes[i].data, notes[i].id)
// //             }


// //             document.getElementById("btn-new-note").disabled = false;
// //             document.getElementsByClassName("page-nav")[0].style.visibility = "visible";
// //             document.getElementsByClassName("page-nav")[1].style.visibility = "visible";
// //             setupStartPage(page);
// //             verses = load_page_array();

// //             create_clickable_passages(verses);
// //             setPagButtons(page);
            
            
// //             // Hide spinner
// //             hideSpinner();
// //         })
// //         .catch(error => {
// //             // Hide spinner
// //             hideSpinner();
// //             console.error('Error:', error);
// //         });


// // }


// // window.onload = (event) => {

// //     let t = document.getElementById("page-text").innerHTML;
    

    
// //     // loadBookmark();

// // }

let currentPageIndex = 0;

function renderPage(pageIndex) {
    console.log(`Page Index: ${pageIndex}`)
    const textLayout = document.getElementById("text-layout");
    textLayout.innerHTML = ""; // Clear existing
    document.getElementById("chapter-header").innerText = current_book.content['content'][current_book.current_chapter]['chapter']

    current_book.current_page = currentPageIndex
    console.log(`Current Chapter ${current_book.current_chapter}`);
    console.log(`Current Page: ${current_book.current_page}/${currentPageIndex}`)
    // console.log(current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page])
    if(current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page].length > 0){
        pages = current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page].split(/\s+/);
    }
    else{
        pages = [];
    }

    pages.forEach(word => {
        let newWord = document.createElement("div");
        newWord.className = "word";
        newWord.innerText = word;
        textLayout.appendChild(newWord);
    });

    currentPageIndex = parseInt(pageIndex);
    document.getElementById("current_page").value = (currentPageIndex + 1) + current_book.content['content'][current_book.current_chapter]['start']
    updatePaginationUI();
}

function updatePaginationUI() {
    const pagButtons = document.querySelectorAll(".page-link.pag, .page-link.pag2");


    pagButtons.forEach((btn, index) => {
        btn.classList.remove("active");
        if (index === (currentPageIndex % 3)) {
            btn.classList.add("active");
        }
        
    });
}

function setupPaginationControls() {
    const pagButtons = document.querySelectorAll(".pag");
    const pagButtons2 = document.querySelectorAll(".pag2");

    const allPagButtons = [pagButtons, pagButtons2];

    const totalPages = pages.length;
    const pageGroup = Math.floor(currentPageIndex / 3);
    const startIndex = pageGroup * 3;

    allPagButtons.forEach(buttonSet => {
        buttonSet.forEach((btn, index) => {
            const pageNum = startIndex + index + 1;

            if (pageNum <= totalPages) {
                btn.innerText = pageNum + current_book.content['content'][current_book.current_chapter]['start'];
                btn.style.display = "inline-block";
                btn.onclick = () => {
                    renderPage(pageNum - 1);
                    setupPaginationControls();
                };

                btn.classList.toggle("active", currentPageIndex === (pageNum - 1));
            } else {
                btn.style.display = "none";
            }
        });
    });

    // Prev buttons
    document.querySelectorAll(".page-link.prev").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex > 0) {
                renderPage(--currentPageIndex);
                setupPaginationControls();
            }
            else{
                --current_book.current_chapter;
                currentPageIndex = current_book.content['content'][current_book.current_chapter]['length']-1
                console.log()
                renderPage(currentPageIndex);
                setupPaginationControls();
            }
        };
    });

    // Next buttons
    document.querySelectorAll(".page-link.next").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex < current_book.content['content'][current_book.current_chapter]['length']-1) {
                renderPage(++currentPageIndex);
                setupPaginationControls();
            }
            else{
                ++current_book.current_chapter;
                currentPageIndex = 0
                renderPage(currentPageIndex);
                setupPaginationControls();
            }
        };
    });
}


// Modify this function
function create_word_layout(textArray) {
    let wordsPerPage = parseInt(document.getElementById("wordsPerPage").value, 10);
    //pages = create_pages(textArray, wordsPerPage);
    console.log(textArray);
    pages = textArray;

    if (pages.length > 0) {
        renderPage(0);
        setupPaginationControls();
    }
    
    console.log(`Total pages: ${pages.length}`);
}

function page_search(index){
    index--;
    console.log(`Chapter before: ${current_book.current_chapter}`)
    console.log(`Current: ${index}`)
    console.log(`Start: ${current_book.content['content'][current_book.current_chapter]['start']}`)
    console.log(`End: ${current_book.content['content'][current_book.current_chapter]['end']}`)
    for(let p=0; p<current_book.content['content'].length; p++){
        console.log(`${current_book.content['content'][current_book.current_chapter]['start']} <= ${index} : ${current_book.content['content'][current_book.current_chapter]['start'] <= currentPageIndex}`)
        console.log(`${current_book.content['content'][current_book.current_chapter]['end']} > ${index} : ${current_book.content['content'][current_book.current_chapter]['end'] > currentPageIndex}`)
        // if(current_book.content['content'][current_book.current_chapter]['start'] <= index && current_book.content['content'][current_book.current_chapter]['end'] > currentPageIndex){
        //     break;
        // }
        if(current_book.content['content'][current_book.current_chapter]['start'] > index ){
            --current_book.current_chapter;
        }
        else if(current_book.content['content'][current_book.current_chapter]['end'] <= index && (current_book.current_chapter + 1) != current_book.content['content'].length){
            ++current_book.current_chapter;
        }

        
    }
    
    console.log(`Current Chapter ${current_book.current_chapter}`);
    console.log(`Current Page: ${current_book.content['content'][current_book.current_chapter]['start']}/${index}`)
    currentPageIndex = (parseInt(index) - current_book.content['content'][current_book.current_chapter]['start']);
    console.log(`This page is ${currentPageIndex}`);
    current_book.current_page = currentPageIndex;
    renderPage(parseInt(currentPageIndex));
    setupPaginationControls();
}


document.getElementById("current_page").addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        console.log(`Page selection entered ${this.value}`);
        currentPageIndex = this.value;
        page_search(currentPageIndex)
        
    }
});


