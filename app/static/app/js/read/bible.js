
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

function setupStartPage(current_page=0) {
    pages = document.getElementsByClassName("read_cols");

    page_links = document.getElementsByClassName("page-link");
    

    for (let x = 0; x < pages.length; x++) {
        pages[x].style.display = "none"
    }

    try {
        pages[current_page].style.display = "block";

    }
    catch (error) {
        console.log("page not loaded");
    }
    // if(current_page != null){
    //     document.getElementById("header-page").innerText = "Page: " + current_page;

    // }
}

let prevs = document.getElementsByClassName("prev");
let nexts = document.getElementsByClassName("next");
let pag = document.getElementsByClassName("pag");
let pag2 = document.getElementsByClassName("pag2");
pag[0].style.backgroundColor = "gray";
pag2[0].style.backgroundColor = "gray";


function setPagButtons(nav_pag){
    let pag = document.getElementsByClassName("pag");
    let pag2 = document.getElementsByClassName("pag2");

    console.log(nav_pag)


    document.getElementById("header-page").innerText = "Page: " + (parseInt(nav_pag) +1);

    for (let g = 0; g < pag.length; g++) {
        pag[g].style.backgroundColor = "white";
        pag2[g].style.backgroundColor = "white";

        if (nav_pag % 3 > 1 && nav_pag > 2) {
            pag[g].innerText = parseInt(pag[g].innerText) - 3;
            pag2[g].innerText = parseInt(pag2[g].innerText) - 3;
            console.log(pag[g].innetText);
            console.log(pag2[g].innetText);

            //only show blocks that have a page
            if (parseInt(pag[g].innerText) > pages.length) {
                pag[g].style.display = "none";
                pag2[g].style.display = "none";
            }
            else {
                pag[g].style.display = "block";
                pag2[g].style.display = "block";
            }
        }
        else if(nav_pag >= 3 ){
            console.log(nav_pag);
            pag[g].innerText = parseInt(pag[g].innerText) + 3;
            pag2[g].innerText = parseInt(pag2[g].innerText) + 3;
        }
        else if(nav_pag == 0 && parseInt(pag[g].innerText) > 3){
            pag[g].innerText = parseInt(pag[g].innerText) - 3;
            pag2[g].innerText = parseInt(pag2[g].innerText) - 3;
        }
    }

    pag[(nav_pag%3)].style.backgroundColor = "gray";
    pag2[(nav_pag%3)].style.backgroundColor = "gray";
}

function loadBookmark() {
    showSpinner();
    console.log("Bookmark Loading...")

    username = document.getElementById("ui-username").innerText.trim();
    console.log(username)

    fetch('/api/load-bookmark/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ "username": username })
    })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
            document.getElementById("page-text").innerHTML = result['passage'];
            document.getElementById("book-header").innerText = result['book'];
            document.getElementById("notes-header").innerText = result['book'];


            const notes = result.notes;
            let page = result.page;
            document.cookie = `bookmarkpage=${page};bookmarkbook=${result['book']}`;
            console.log(page);
            curr_book = result['book_id'];
            current_page = page;

  

            console.log(notes)
            document.getElementById('notes-list').innerHTML = "";
            for (let i = 0; i < notes.length; i++) {
                console.log(notes[i].id);
                console.log(notes[i].title);
                console.log(notes[i].book);
                console.log(notes[i].data);

                //Adds note to the DOM
                addItem(notes[i].title, notes[i].data, notes[i].id)
            }


            document.getElementById("btn-new-note").disabled = false;
            document.getElementsByClassName("page-nav")[0].style.visibility = "visible";
            document.getElementsByClassName("page-nav")[1].style.visibility = "visible";
            setupStartPage(page);
            verses = load_page_array();

            create_clickable_passages(verses);
            setPagButtons(page);
            
            
            // Hide spinner
            hideSpinner();
        })
        .catch(error => {
            // Hide spinner
            hideSpinner();
            console.error('Error:', error);
        });


}


window.onload = (event) => {

    let t = document.getElementById("page-text").innerText
    document.getElementById("page-text").innerText = "";
    document.getElementById("page-text").innerHTML = t;

    
    loadBookmark();

}


//Event Listeners
for (let p = 0; p < prevs.length; p++) {
    prevs[p].addEventListener("click", function () {
        if (current_page > 0) {
            pages[current_page].style.display = "none";
            current_page--;
            pages[current_page].style.display = "block";
            window.scrollTo({ "top": 0 });
            console.log(current_page);
            document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
            
        }

        for (let g = 0; g < pag.length; g++) {
            pag[g].style.backgroundColor = "white";
            pag2[g].style.backgroundColor = "white";

            if (current_page >= 2 && current_page % 3 == 2) {
                pag[g].innerText = parseInt(pag[g].innerText) - 3;
                pag2[g].innerText = parseInt(pag2[g].innerText) - 3;

                //only show blocks that have a page
                if (parseInt(pag[g].innerText) > pages.length) {
                    pag[g].style.display = "none";
                    pag2[g].style.display = "none";
                }
                else {
                    pag[g].style.display = "block";
                    pag2[g].style.display = "block";
                }
            }
        }
        if (current_page < pages.length) {
            console.log("pagination: " + current_page % 3)
            pag[(current_page % 3)].style.backgroundColor = "gray";
            pag2[(current_page % 3)].style.backgroundColor = "gray";
        }

    });
}

for (let n = 0; n < nexts.length; n++) {
    nexts[n].addEventListener("click", function () {

        if (current_page < pages.length - 1) {

            pages[current_page].style.display = "none";
            current_page++;
            pages[current_page].style.display = "block";
            window.scrollTo({ "top": 0 });
            console.log(pages.length - 1 + " : " + current_page);
            document.getElementById("header-page").innerText = "Page: " + (current_page + 1);
        }

        for (let g = 0; g < pag.length; g++) {
            pag[g].style.backgroundColor = "white";
            pag2[g].style.backgroundColor = "white";

            if (current_page % 3 == 0) {
                pag[g].innerText = parseInt(pag[g].innerText) + 3;
                pag2[g].innerText = parseInt(pag2[g].innerText) + 3;

                //only show blocks that have a page
                if (parseInt(pag[g].innerText) > pages.length) {
                    pag[g].style.display = "none";
                    pag2[g].style.display = "none";
                }
                else {
                    pag[g].style.display = "block";
                    pag2[g].style.display = "block";
                }
            }
        }
        if (current_page < pages.length) {
            console.log(current_page % 3)
            pag[(current_page % 3)].style.backgroundColor = "gray";
            pag2[(current_page % 3)].style.backgroundColor = "gray";
        }





    });
}

for (let g = 0; g < pag.length; g++) {
    pag[g].addEventListener("click", function () {

        pages[current_page].style.display = "none";
        current_page = parseInt(this.innerText) - 1;
        if (current_page < pages.length - 1) {
            pages[current_page].style.display = "block";
        }
        for (let b = 0; b < pag.length; b++) {
            pag[b].style.backgroundColor = "white";
        }

        if (current_page < pages.length) {
            pag[current_page % 3].style.backgroundColor = "gray";
        }


    });

    pag2[g].addEventListener("click", function () {

        pages[current_page].style.display = "none";
        current_page = parseInt(this.innerText) - 1;
        if (current_page < pages.length - 1) {
            pages[current_page].style.display = "block";
        }
        for (let b = 0; b < pag.length; b++) {
            pag[b].style.backgroundColor = "white";
            pag2[b].style.backgroundColor = "white";
        }

        if (current_page < pages.length) {
            pag[current_page % 3].style.backgroundColor = "gray";
            pag2[current_page % 3].style.backgroundColor = "gray";
        }


    });
}



function pageJump(note_page) {
    pages[current_page].style.display = "none";
    current_page = note_page
    pages[current_page].style.display = "block";
    window.scrollTo({ "top": 0 });
    document.getElementById("header-page").innerText = "Page: " + current_page;
}