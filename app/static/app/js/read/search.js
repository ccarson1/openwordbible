let side_note_list;
if (document.getElementById("btn-search-notes") != null) {
    document.getElementById("btn-search-notes").addEventListener("click", function () {
        side_note_list = document.getElementsByClassName("notes");
        let search_text = document.getElementById("note-search").value.trim().toLowerCase();

        for (let s = 0; s < side_note_list.length; s++) {
            let text = side_note_list[s].innerText.toLowerCase();

            if (search_text == '' || text.includes(search_text)) {
                side_note_list[s].style.display = "block";
            }
            else {
                side_note_list[s].style.display = "none";
            }
        }
    });

}


function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function addSearchedItem(note_title, chapter, chapterIndex, sentence, note_data, note_page) {
    let search_list = document.getElementById('search-results');

    if (!search_list) {
        console.error('Element with id "search-results" not found.');
        return;
    }

    let newNote = document.createElement("div");
    newNote.innerHTML = `
        <div class='list-group-item lh-tight notes'>
            <div class="d-flex w-100 align-items-center justify-content-between">
                <strong class="mb-1">${escapeHtml(note_title)}</strong>
                <small class="text-muted"><em>Chapter: ${escapeHtml(chapter)}, Sentence: ${sentence + 1}</em></small>
                <small class="text-muted">Page: ${note_page}</small>
            </div>
            <div class="col-10 mb-1 small">${note_data}</div>
        </div>
        <hr>
    `;
    newNote.firstElementChild.addEventListener("click", () => pageJump(chapterIndex, note_page - 1 - current_book.content[chapterIndex].start));

    search_list.appendChild(newNote);
}

async function runTopSearch() {
    document.getElementById('search-results').innerHTML = "";

    let search_value = document.getElementById("top-search").value.trim();
    if (search_value == "") return;

    const searchTabTrigger = new bootstrap.Tab(document.querySelector('#search-tab'));
    searchTabTrigger.show();

    showSpinner();
    await Promise.all(current_book.content.map((chapter, index) => loadChapter(index)));
    hideSpinner();

    const matches = searchWordWithHighlight(current_book.content, search_value);
    matches.forEach(m => {
        addSearchedItem(`[${search_value}]`, m.chapter, m.chapterIndex, m.sentence, m.highlightedText, m.page)
    });

    document.getElementById("num_of_results").innerText = matches.length;
}

if (document.getElementById("btn-top-search") != null && document.getElementById("text-layout") != null) {
    document.getElementById("btn-top-search").addEventListener("click", runTopSearch);
    document.getElementById("top-search").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            runTopSearch();
        }
    });
}

function searchWordWithHighlight(data, searchWord) {
    const results = [];
    const pattern = `(^|[^\\p{L}\\p{N}])(${escapeRegex(escapeHtml(searchWord))})(?=$|[^\\p{L}\\p{N}])`;
    const testRegex = new RegExp(pattern, 'iu'); // whole word match, case-insensitive
    const replaceRegex = new RegExp(pattern, 'giu');

    data.forEach((chapter, chapterIndex) => {
        chapter.pages.forEach((page, pageIndex) => {
            page.forEach((sentence, sentenceIndex) => {
                const originalText = escapeHtml(sentence.text);
                if (testRegex.test(originalText)) {
                    const highlightedText = originalText.replace(replaceRegex, '$1<mark>$2</mark>');

                    results.push({
                        chapter: chapter.chapter,
                        chapterIndex: chapterIndex,
                        page: chapter.start + pageIndex + 1,
                        sentence: sentenceIndex,
                        highlightedText: highlightedText
                    });
                }
            });
        });
    });

    return results;
}
