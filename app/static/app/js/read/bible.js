

function pageJump(chapter, page) {
    goToPage(parseInt(chapter), parseInt(page));
}


function getScrollPosition() {
    return window.scrollY || document.documentElement.scrollTop;
}

let bookmarkBtns = document.getElementsByClassName("bookmark");

for (let b = 0; b < bookmarkBtns.length; b++) {
    bookmarkBtns[b].addEventListener("click", () => {

            const bookmarkData = {
                book_id: current_book.id,
                chapter: current_book.content[current_book.current_chapter]['index'],
                page: currentPageIndex,
                word: 0,
                scroll: getScrollPosition()
            }

            Bookmark.save(bookmarkData)
                .then(() => {
                    for (let i = 0; i < bookmarkBtns.length; i++) {
                        let icon = bookmarkBtns[i].querySelector("i");
                        if (icon) icon.className = "bi bi-bookmark-fill";
                    }
                })
                .catch(() => alert("The bookmark could not be saved."));

    });
}


let currentPageIndex = 0;

async function loadChapter(index) {
    const chapter = current_book.content[index];
    if (!chapter || chapter.length == 0 || chapter.pages.length > 0) {
        return; // Out of bounds, empty or already loaded
    }

    if (!chapter.loading) {
        chapter.loading = fetch(`/api/book/${current_book.id}/chapter/${chapter.index}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load chapter");
                }
                return response.json();
            })
            .then(data => {
                chapter.pages = data.pages;  // Fill in the missing pages
            })
            .catch(err => {
                console.error(`Error loading chapter ${index}:`, err);
            })
            .finally(() => {
                chapter.loading = null;
            });
    }
    await chapter.loading;
}

async function goToPage(chapterIndex, pageIndex) {
    if (chapterIndex < 0 || chapterIndex >= current_book.content.length) return;

    await loadChapter(chapterIndex);
    current_book.current_chapter = chapterIndex;

    const lastPage = Math.max(current_book.content[chapterIndex]['pages'].length - 1, 0);
    pageIndex = Math.min(Math.max(parseInt(pageIndex) || 0, 0), lastPage);

    renderPage(pageIndex);
    setupPaginationControls();
}

function renderPage(pageIndex) {
    currentPageIndex = parseInt(pageIndex);
    current_book.current_page = currentPageIndex;

    const chapter = current_book.content[current_book.current_chapter];
    const textLayout = document.getElementById("text-layout");
    textLayout.innerHTML = ""; // Clear existing
    document.getElementById("chapter-header").innerText = chapter['chapter'];

    const sentences = chapter['pages'][currentPageIndex] || [];
    for (let n = 0; n < sentences.length; n++) {
        let newSent = document.createElement("span");
        newSent.setAttribute("class", "sentPartition");
        let tempSent = sentences[n]['text'].split(/\s+/);
        for (let w = 0; w < tempSent.length; w++) {
            let newWord = document.createElement("div");
            newWord.className = "word";
            newWord.innerText = tempSent[w];
            newSent.appendChild(newWord);
        }
        textLayout.appendChild(newSent);
    }

    document.getElementById("current_page").value = chapter['start'] + currentPageIndex + 1;
    updatePaginationUI();
    toggleHighlighted();
}

function updatePaginationUI() {
    const pagButtons = document.querySelectorAll(".page-link.pag, .page-link.pag2");

    pagButtons.forEach((btn, index) => {
        btn.classList.toggle("active", (index % 3) === (currentPageIndex % 3));
    });
}

function findChapter(fromIndex, step) {
    for (let c = fromIndex + step; c >= 0 && c < current_book.content.length; c += step) {
        if (current_book.content[c]['length'] > 0) return c;
    }
    return -1;
}

function setupPaginationControls() {
    const pagButtons = document.querySelectorAll(".pag");
    const pagButtons2 = document.querySelectorAll(".pag2");

    const allPagButtons = [pagButtons, pagButtons2];

    const chapter = current_book.content[current_book.current_chapter];
    const totalPages = chapter['pages'].length;
    const pageGroup = Math.floor(currentPageIndex / 3);
    const startIndex = pageGroup * 3;

    allPagButtons.forEach(buttonSet => {
        buttonSet.forEach((btn, index) => {
            const pageNum = startIndex + index + 1;

            if (pageNum <= totalPages) {
                btn.innerText = pageNum + chapter['start'];
                btn.style.display = "inline-block";
                btn.onclick = () => goToPage(current_book.current_chapter, pageNum - 1);

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
                goToPage(current_book.current_chapter, currentPageIndex - 1);
            }
            else {
                const prev = findChapter(current_book.current_chapter, -1);
                if (prev != -1) {
                    goToPage(prev, current_book.content[prev]['length'] - 1);
                }
            }
        };
    });

    // Next buttons
    document.querySelectorAll(".page-link.next").forEach(btn => {
        btn.onclick = () => {
            if (currentPageIndex < chapter['pages'].length - 1) {
                goToPage(current_book.current_chapter, currentPageIndex + 1);
            }
            else {
                const next = findChapter(current_book.current_chapter, 1);
                if (next != -1) {
                    goToPage(next, 0);
                }
            }
        };
    });
}


function page_search(index) {
    const page = parseInt(index) - 1;
    if (isNaN(page)) return;

    for (let c = 0; c < current_book.content.length; c++) {
        const chapter = current_book.content[c];
        if (chapter['length'] > 0 && page >= chapter['start'] && page < chapter['end']) {
            goToPage(c, page - chapter['start']);
            return;
        }
    }
}


document.getElementById("current_page").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        page_search(this.value);
    }
});

