

function pageJump(note_page) {
    if (note_page >= 0 && note_page < pages.length) {
        // pages[current_book.current_page].style.display = "none";
        // current_page = note_page;
        // pages[current_page].style.display = "block";
        // window.scrollTo({ top: 0 });
        // document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
        //setPagButtons(current_page);

        renderPage(note_page);
    }
}


function getScrollPosition() {
    return window.scrollY || document.documentElement.scrollTop;
}

let bookmarkBtns = document.getElementsByClassName("bookmark");

for (let b = 0; b < bookmarkBtns.length; b++) {
    bookmarkBtns[b].addEventListener("click", () => {
 
            const bookmarkData = {
                book_id: current_book.id,
                chapter: current_book.current_chapter,
                page: currentPageIndex,
                word: 0,
                scroll: getScrollPosition()
            }

            Bookmark.save(bookmarkData);
            const tempBookmark = new Bookmark(bookmarkData);

    });
}




// window.onload = () => {

//     (async () => {
//         try {

//             const bookmark = await Bookmark.load(current_book.id);
//             if (bookmark) {
//                 //goToPosition(bookmark.chapter, bookmark.page, bookmark.word, bookmark.scroll);
//                 console.log(bookmark.chapter, bookmark.page, bookmark.word, bookmark.scroll);
//                 current_book.current_chapter = bookmark.chapter;
//             }

//         } catch (error) {
//             console.error("Failed to load bookmark:", error);
//         }
//     })();

// }

let currentPageIndex = 0;

function renderPage(pageIndex) {
    let temppage = []
    console.log(`Page Index: ${pageIndex}`)
    const textLayout = document.getElementById("text-layout");
    textLayout.innerHTML = ""; // Clear existing
    document.getElementById("chapter-header").innerText = current_book.content[current_book.current_chapter]['chapter']
    //current_book.content[0] = JSON.parse(current_book.content)
    //current_book.current_page = currentPageIndex
    console.log(`Current Chapter ${current_book.current_chapter}`);
    console.log(`Current Page: ${current_book.current_page}/${currentPageIndex}`)
    // console.log(current_book.content['content'][current_book.current_chapter]['pages'][current_book.current_page])
    if (current_book.content[current_book.current_chapter]['pages'][currentPageIndex].length > 0) {
        let sentences = current_book.content[current_book.current_chapter]['pages'][currentPageIndex];
        for (let n = 0; n < sentences.length; n++) {
            let newSent = document.createElement("span");
            newSent.setAttribute("class", "sentPartition");
            let tempSent = current_book.content[current_book.current_chapter]['pages'][currentPageIndex][n]['text'].split(/\s+/);
            for (let w = 0; w < tempSent.length; w++) {
                let newWord = document.createElement("div");
                newWord.className = "word";
                newWord.innerText = tempSent[w];
                newSent.appendChild(newWord);
            }

            temppage = temppage.concat(current_book.content[current_book.current_chapter]['pages'][currentPageIndex][n]['text'].split(/\s+/));
            textLayout.appendChild(newSent);
        }
    }
    else {
        temppage = [];
    }
    // console.log(temppage);
    // temppage.forEach(word => {
    //     let newWord = document.createElement("div");
    //     newWord.className = "word";
    //     newWord.innerText = word;
    //     textLayout.appendChild(newWord);
    // });

    currentPageIndex = parseInt(pageIndex);
    document.getElementById("current_page").value = (currentPageIndex + 1) + current_book.content[current_book.current_chapter]['start']
    updatePaginationUI();
    toggleHighlighted();
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
                btn.innerText = pageNum + current_book.content[current_book.current_chapter]['start'];
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
                current_book.current_page--

            }
            else {
                if (current_book.current_chapter > 0) {
                    --current_book.current_chapter;
                    currentPageIndex = current_book.content[current_book.current_chapter]['length'] - 1
                    console.log()
                    renderPage(currentPageIndex);
                    setupPaginationControls();
                }


            }
        };
    });

    // Next buttons
    document.querySelectorAll(".page-link.next").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex < current_book.content[current_book.current_chapter]['length'] - 1) {
                renderPage(++currentPageIndex);
                current_book.current_page++
                setupPaginationControls();
                toggleHighlighted();
            }
            else {
                if (current_book.current_chapter < current_book.content.length - 1) {
                    ++current_book.current_chapter;
                    currentPageIndex = 0
                    renderPage(currentPageIndex);
                    setupPaginationControls();
                }

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

function page_search(index) {
    index--;
    console.log(`Chapter before: ${current_book.current_chapter}`)
    console.log(`Current: ${index}`)
    console.log(`Start: ${current_book.content[current_book.current_chapter]['start']}`)
    console.log(`End: ${current_book.content[current_book.current_chapter]['end']}`)
    for (let p = 0; p < current_book.content.length; p++) {
        console.log(`${current_book.content[current_book.current_chapter]['start']} <= ${index} : ${current_book.content[current_book.current_chapter]['start'] <= currentPageIndex}`)
        console.log(`${current_book.content[current_book.current_chapter]['end']} > ${index} : ${current_book.content[current_book.current_chapter]['end'] > currentPageIndex}`)
        // if(current_book.content['content'][current_book.current_chapter]['start'] <= index && current_book.content['content'][current_book.current_chapter]['end'] > currentPageIndex){
        //     break;
        // }
        if (current_book.content[current_book.current_chapter]['start'] > index) {
            --current_book.current_chapter;
        }
        else if (current_book.content[current_book.current_chapter]['end'] <= index && (current_book.current_chapter + 1) != current_book.content.length) {
            ++current_book.current_chapter;
        }


    }

    console.log(`Current Chapter ${current_book.current_chapter}`);
    console.log(`Current Page: ${current_book.content[current_book.current_chapter]['start']}/${index}`)
    currentPageIndex = (parseInt(index) - current_book.content[current_book.current_chapter]['start']);
    console.log(`This page is ${currentPageIndex}`);
    //current_book.current_page = currentPageIndex;
    renderPage(parseInt(currentPageIndex));
    setupPaginationControls();
}


document.getElementById("current_page").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        console.log(`Page selection entered ${this.value}`);
        currentPageIndex = this.value;
        page_search(currentPageIndex)

    }
});


