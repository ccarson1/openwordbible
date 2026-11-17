
class Note {
    constructor({
        id = null,
        book,
        title,
        note,  
        color,
        tags = null,
        chapter,
        page,
        sentence_index_start,
        sentence_index_end,
        word_index_start,
        word_index_end,
        date = new Date()
    }) {
        this.id = id;
        this.book = book;
        this.title = title;
        this.note = note;
        this.color = color;
        this.tags = tags;
        this.chapter = chapter;
        this.page = page;
        this.sentence_index_start = sentence_index_start;
        this.sentence_index_end = sentence_index_end;
        this.word_index_start = word_index_start;
        this.word_index_end = word_index_end;
        this.date = new Date(date);
    }
}



num_of_notes = 0;
notes = []
let editingNote = null;


var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));


function resetModal() {
    editingNote = null;
    document.getElementById("note-title").value = "";
    document.getElementById("note-data").value = "";
    document.getElementById("note-tags").value = "";
    document.getElementById("NoteModalLabel").innerText = "New Note";

    const delBtn = document.getElementById('delete-button');
    if (delBtn) delBtn.remove();


}
document.getElementById('exampleModal').addEventListener('hidden.bs.modal', resetModal);

document.addEventListener('DOMContentLoaded', function () {


    const checkTextLayoutReady = () => {
        if (bookReady) {
            loadNotes(current_book.id);
        } else {
            setTimeout(checkTextLayoutReady, 100); // check again after 100ms
        }
    };

    checkTextLayoutReady();

    // Get references to the modal and the trigger button

    var triggerButton = document.getElementById('btn-new-note');

    // Add an event listener to the button to show the modal
    triggerButton.addEventListener('click', function () {

        resetModal();

        selectedWords = [];
        hideToolbar();
        myModal.show();
    });

    document.getElementById("save-note").addEventListener("click", function () {

        let note_title = document.getElementById("note-title").value;
        let note_data = document.getElementById("note-data").value;
        let note_tags = document.getElementById("note-tags").value.split(",").map(t => t.trim()).filter(Boolean);

        if (validate_inputs() == true) {

            if (editingNote) {
                save_note({
                    "note_id": editingNote.id,
                    "title": note_title,
                    "book": current_book.id,
                    "data": note_data,
                    "tags": note_tags
                });
                myModal.hide();
                return;
            }

            if (!selectedWords.length) {
                alert("Select some text on the page before saving a note.");
                return;
            }

            sentence_index_start = Array.from(selectedWords[0].parentElement.parentElement.children).indexOf(selectedWords[0].parentElement);
            sentence_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.parentElement.children).indexOf(selectedWords[selectedWords.length - 1].parentElement);

            word_index_start = Array.from(selectedWords[0].parentElement.children).indexOf(selectedWords[0]);
            word_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.children).indexOf(selectedWords[selectedWords.length - 1]);

            //sends json to backend
            save_note({
                "title": note_title,
                "book": current_book.id,
                "data": note_data,
                "tags": note_tags,
                "note_color": temp_note_color || "yellow",
                "chapter": current_book.current_chapter,
                "page": currentPageIndex,
                "sentence_index_start": sentence_index_start,
                "sentence_index_end": sentence_index_end,
                "word_index_start": word_index_start,
                "word_index_end": word_index_end
            });


            selectedWords.forEach((word, i) => {
                word.classList.add(`note_${notes.length}`);

            });

            resetModal();

            isCurrentHighlightSaved = true;
            savedHighlights.push([...selectedWords]);
            selectedWords = [];
            hideToolbar();
            myModal.hide();
        }



    });


});

function noteItem(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    pageJump(note.chapter, note.page);

    resetModal();
    editingNote = note;
    myModal.show();
    document.getElementById("NoteModalLabel").innerText = current_book.name + " - " + note.title;
    document.getElementById("note-title").value = note.title;
    document.getElementById("note-data").value = note.note;
    document.getElementById("note-tags").value = (note.tags || []).join(", ");

    let footer = document.getElementById("m-footer");

    let delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger";
    delBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
    delBtn.onclick = function () { btnDelete(id); };
    delBtn.id = "delete-button";
    footer.appendChild(delBtn);

}




function addItem(note) {


    let temp_note = new Note(note)
    notes.push(temp_note);
    toggleHighlighted();

    // const layout = document.getElementById('text-layout');
    // for (let x = temp_note.sentence_index_start; x <= temp_note.sentence_index_end; x++) {
    //     const sentence = layout?.children[x];
    //     if (!sentence) continue;

    //     for (let y = temp_note.word_index_start; y <= temp_note.word_index_end; y++) {
    //         const word = sentence?.children[y];
    //         if (!word) continue;

    //         word.style.backgroundColor = temp_note.color;
    //     }
    // }

    


    let note_list = document.getElementById('notes-list');
    if (!note_list) {
        console.error('Element with id "note-list" not found.');
        return;
    }

    const date = temp_note.date;

    let newNote = document.createElement("div");
    newNote.innerHTML = `
        <div  class='list-group-item  lh-tight notes'>
            <div class="d-flex w-100 align-items-center justify-content-between" >
                <strong class="mb-1"></strong>
                <div class="d-flex flex-column align-items-end">
                <small class="text-muted">${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</small>
                <div class="circle-indicator mt-1"></div>
            </div>
                
            </div>
            <div class="col-10 mb-1 small"></div>
            
        </div>
        `;
    let item = newNote.firstElementChild;
    item.id = "note-" + note.id;
    item.querySelector("strong").innerText = note.title;
    item.querySelector(".circle-indicator").style.backgroundColor = note.color;
    item.querySelector(".small").innerText = note.note;
    item.addEventListener("click", () => noteItem(note.id));
    note_list.appendChild(newNote);
    num_of_notes++;
}


function save_note(note) {
    showSpinner();

    // Send a POST request
    fetch('/api/save-note/', {
        method: 'POST',
        body: JSON.stringify(note),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(result => {

            // Hide spinner
            hideSpinner();

            const new_notes = result.notes;

            notes = []
            document.getElementById('notes-list').innerHTML = "";
            for (let i = 0; i < new_notes.length; i++) {
                //Adds note to the DOM
                addItem(new_notes[i])
            }
            renderPage(currentPageIndex);
        })
        .catch(error => {
            // Hide spinner
            hideSpinner();
            console.error('Error:', error);
            alert("The note could not be saved.");
        });
}




function btnDelete(id) {
    myModal.hide();

    // Show spinner
    showSpinner();

    // Send a POST request
    fetch('/api/delete-note/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ "note_id": id, "book_id": current_book.id }) // Use 'body' to send the request payload
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(result => {
            // Hide spinner
            hideSpinner();

            const deletedElement = document.getElementById("note-" + result.deleted);
            if (deletedElement) {
                deletedElement.classList.add('fade-out');
                setTimeout(() => deletedElement.parentElement.remove(), 300); // wait for animation
            }

            notes = notes.filter(note => note.id !== result.deleted);
            renderPage(currentPageIndex);

        })
        .catch(error => {
            // Hide spinner
            hideSpinner();
            console.error('Error:', error);
        });
}


function loadNotes(bookId) {
    fetch('/api/notes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ book_id: bookId })
    })
        .then(res => res.json())
        .then(data => {
            notes = [];
            document.getElementById('notes-list').innerHTML = "";
            for (let d = 0; d < data.length; d++) {
                addItem(data[d]);
            }
            hideSpinner();
        })
        .catch(err => {
            console.error(err);
            hideSpinner();
        });
}