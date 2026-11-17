const popup = document.getElementById("searchPopup");
const openBtn = document.getElementById("openSearchPopup");
const closeBtn = document.getElementById("closeSearchPopup");
const comparePanel = document.getElementById("compare-panel");

let compareBook = null;
let compareChapter = 0;
let comparePage = 0;

openBtn.onclick = () => popup.style.display = "block";
closeBtn.onclick = () => popup.style.display = "none";

function renderCompare() {
    const chapters = compareBook.content ? compareBook.content.content : [];
    document.getElementById("compare-title").innerText = compareBook.name;

    const compareText = document.getElementById("compare-text");
    compareText.innerHTML = "";

    if (!chapters || chapters.length == 0) {
        document.getElementById("compare-chapter").innerText = "";
        document.getElementById("compare-page").innerText = "";
        compareText.innerText = "This book has no text.";
        return;
    }

    const chapter = chapters[compareChapter];
    const page = chapter.pages[comparePage] || [];
    document.getElementById("compare-chapter").innerText = chapter.chapter || "";
    document.getElementById("compare-page").innerText = `Page ${comparePage + 1} / ${chapter.pages.length}`;

    for (let s = 0; s < page.length; s++) {
        const sentence = document.createElement("span");
        sentence.innerText = page[s].text + " ";
        compareText.appendChild(sentence);
    }
}

function moveCompare(step) {
    if (!compareBook || !compareBook.content) return;
    const chapters = compareBook.content.content;
    let chapter = compareChapter;
    let page = comparePage + step;

    while (chapter >= 0 && chapter < chapters.length) {
        if (page >= 0 && page < chapters[chapter].pages.length) {
            compareChapter = chapter;
            comparePage = page;
            renderCompare();
            return;
        }
        chapter += step;
        if (chapter >= 0 && chapter < chapters.length) {
            page = step > 0 ? 0 : chapters[chapter].pages.length - 1;
        }
    }
}

document.getElementById("compare-prev").onclick = () => moveCompare(-1);
document.getElementById("compare-next").onclick = () => moveCompare(1);
document.getElementById("close-compare").onclick = () => {
    comparePanel.hidden = true;
    compareBook = null;
};

document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.trim();
    const resultsDiv = document.getElementById("searchResults");

    // Only search if input is not empty
    if (query.length === 0) {
        resultsDiv.innerHTML = "";
        return;
    }

    fetch(`/api/search-books/?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            resultsDiv.innerHTML = "";

            data.forEach(item => {
                const div = document.createElement("div");
                div.textContent = item.name || item;
                div.classList.add("search-result-item");
                div.onclick = () => {
                    popup.style.display = "none";
                    showSpinner();

                    const formData = new FormData();
                    formData.append("id", item.id);
                    fetch(`/api/load-book/`, {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": getCookie("csrftoken"),
                        },
                        body: formData,
                    })
                        .then(response => {
                            if (!response.ok) throw new Error("Network response was not ok");
                            return response.json();
                        })
                        .then(data => {
                            hideSpinner();
                            compareBook = data.book;
                            const chapters = compareBook.content ? compareBook.content.content : [];
                            compareChapter = Math.min(current_book.current_chapter, Math.max(chapters.length - 1, 0));
                            comparePage = 0;
                            if (chapters.length > 0 && currentPageIndex < chapters[compareChapter].pages.length) {
                                comparePage = currentPageIndex;
                            }
                            comparePanel.hidden = false;
                            renderCompare();
                        })
                        .catch(error => {
                            hideSpinner();
                            console.error("Error loading book:", error);
                            alert("The book could not be loaded.");
                        });
                };
                resultsDiv.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error fetching search results:", error);
            resultsDiv.innerHTML = "<p>Error loading results</p>";
        });
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
