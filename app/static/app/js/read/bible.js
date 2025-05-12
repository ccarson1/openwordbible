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
    const textLayout = document.getElementById("text-layout");
    textLayout.innerHTML = ""; // Clear existing

    

    pages[pageIndex].forEach(word => {
        let newWord = document.createElement("div");
        newWord.className = "word";
        newWord.innerText = word;
        textLayout.appendChild(newWord);
    });

    currentPageIndex = pageIndex;
    updatePaginationUI();
}

function updatePaginationUI() {
    const pagButtons = document.querySelectorAll(".page-link.pag, .page-link.pag2");

    pagButtons.forEach((btn, index) => {
        btn.classList.remove("active");
        if (index === currentPageIndex) {
            btn.classList.add("active");
        }
    });
}

function setupPaginationControls() {
    const paginationContainers = [document.querySelectorAll(".pag"), document.querySelectorAll(".pag2")];

    // Clear existing paginations
    paginationContainers.forEach(containerSet => {
        containerSet.forEach((btn, index) => {
            btn.innerText = index + 1;
            btn.style.display = index < pages.length ? "inline-block" : "none";

            btn.onclick = () => {
                renderPage(index);
            };
        });
    });

    document.querySelectorAll(".page-link.prev").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex > 0) {
                renderPage(currentPageIndex - 1);
            }
        };
    });

    document.querySelectorAll(".page-link.next").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex < pages.length - 1) {
                console.log(pages[currentPageIndex])
                renderPage(currentPageIndex + 1);
            }
        };
    });
}

// Modify this function
function create_word_layout(textArray) {
    let wordsPerPage = parseInt(document.getElementById("wordsPerPage").value, 10);
    pages = create_pages(textArray, wordsPerPage);

    if (pages.length > 0) {
        renderPage(0);
        setupPaginationControls();
    }

    console.log(`Total pages: ${pages.length}`);
}


