let side_note_list;
if (document.getElementById("btn-search-notes") != null) {
    document.getElementById("btn-search-notes").addEventListener("click", function () {
        console.log("Searching")
        side_note_list = document.getElementsByClassName("notes");
        let side_note_search = document.getElementById("note-search");

        for (let s = 0; s < side_note_list.length; s++) {
            let text = side_note_list[s].innerText;
            let search_text = side_note_search.value;

            console.log(search_text == '');
            if (search_text == '') {
                console.log("Display all");
                side_note_list[s].style.display = "block";
            }
            if (text.search(search_text) == -1) {

                side_note_list[s].style.display = "none";

            }
            else {
                side_note_list[s].style.display = "block";
            }


        }
    });

}



// function addSearchedItem(note_title, note_data, note_page) {



//     let search_list = document.getElementById('search-results');

//     if (!search_list) {
//         console.error('Element with id "note-list" not found.');
//         return;
//     }


//     let newNote = document.createElement("div");
//     newNote.innerHTML = `
        
//         <div  class='list-group-item  lh-tight notes' onclick="pageJump(`+ note_page + `)">
//             <div class="d-flex w-100 align-items-center justify-content-between" >
//                 <strong class="mb-1">${note_title}</strong>
//                 <small class="text-muted">Page: ${note_page}</small>
                
//             </div>
//             <div class="col-10 mb-1 small">${note_data}</div>
            
//         </div>
//         <hr>
        

//         `;
//     search_list.appendChild(newNote);
// }

function addSearchedItem(note_title, note_data, note_page) {
    let search_list = document.getElementById('search-results');

    if (!search_list) {
        console.error('Element with id "search-results" not found.');
        return;
    }

    let newNote = document.createElement("div");
    newNote.innerHTML = `
        <div class='list-group-item lh-tight notes' onclick="pageJump(${note_page})">
            <div class="d-flex w-100 align-items-center justify-content-between">
                <strong class="mb-1">${note_title}</strong>
                <small class="text-muted">Page: ${note_page}</small>
            </div>
            <div class="col-10 mb-1 small">${note_data}</div>
        </div>
        <hr>
    `;

    search_list.appendChild(newNote);
}

let verse_array = [];

if (document.getElementById("btn-top-search") != null) {
    document.getElementById("btn-top-search").addEventListener("click", function () {
        document.getElementById('search-results').innerHTML = "";

        let search_value = document.getElementById("top-search").value;
        console.log("Searching...");
        console.log(search_value);



        // Usage
        const matches = searchWordWithHighlight(current_book.content,search_value);
        console.log(matches.length);
        matches.forEach(m => {
            console.log(m.highlightedText);  
            document.getElementById("num_of_results").innerText = m.highlightedText;
            addSearchedItem("searched item", m.highlightedText, '2')
        });

        //document.getElementById("num_of_results").innerText = matches.length;

        // let book_words = document.getElementsByClassName("read_cols");
        // let book_passages = document.getElementsByClassName("passage");
        // let verse_counter = 0;
        // verse_array = [];
        // let verse_pages = [];

        // for (let b = 0; b < book_words.length; b++) {
        //     for (let c = 0; c < book_words[b].children.length; c++)
        //         if (book_words[b].children[c].innerText.toLowerCase() == search_value) {
        //             book_words[b].children[c].style.backgroundColor = "rgba(90, 136, 204, 0.795)";
        //             console.log(verses[book_words[b].children[c].className.split(" ")[1].slice(1,)]);
        //             verse_array.push(book_words[b].children[c].className.split(" ")[1].slice(1,));
        //             verse_pages.push(b);
        //         }
        //         else {
        //             book_words[b].children[c].style.backgroundColor = "white";
        //         }

        // }

        // for (let v = 0; v < verse_array.length; v++) {
        //     console.log(verses[verse_array[v]]);
        //     console.log(book_passages[verse_array[v]].innerText);
        //     addSearchedItem(book_passages[verse_array[v] - 1].innerText, verses[verse_array[v]], verse_pages[v])
        // }
        // document.getElementById("num_of_results").innerText = verse_array.length;

    });
}

function searchWordWithHighlight(data, searchWord) {
    const results = [];
    const searchRegex = new RegExp(`\\b(${searchWord})\\b`, 'gi'); // whole word match, case-insensitive

    data.forEach((chapter, chapterIndex) => {
        chapter.pages.forEach((page, pageIndex) => {
            page.forEach((paragraph, paragraphIndex) => {
                const originalText = paragraph.text;
                if (searchRegex.test(originalText)) {
                    const highlightedText = originalText.replace(
                        searchRegex,
                        '<mark>$1</mark>'
                    );

                    results.push({
                        chapter: chapter.chapter,
                        page: pageIndex,
                        paragraph: paragraphIndex,
                        highlightedText: highlightedText
                    });
                }
            });
        });
    });

    return results;
}




let result_links = document.getElementsByClassName("results");

for (let r = 0; r < result_links.length; r++) {
    result_links[r].addEventListener("click", function () {
        console.log(r);
        console.log(result_links[r])
        if (r == 0) {
            result_links[0].setAttribute("class", "nav-link results active");
            result_links[1].setAttribute("class", "nav-link results");

            document.getElementById("note-container").style.display = "block";
            document.getElementById("search-container").style.display = "none";
        }
        else {
            result_links[1].setAttribute("class", "nav-link results active");
            result_links[0].setAttribute("class", "nav-link results");

            document.getElementById("note-container").style.display = "none";
            document.getElementById("search-container").style.display = "block";
        }
    });
}
