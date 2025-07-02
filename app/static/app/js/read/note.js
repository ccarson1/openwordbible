
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


var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));


function resetModal() {
    editingNote = null;
    document.getElementById("note-title").value = "";
    document.getElementById("note-data").value = "";
    document.getElementById("NoteModalLabel").innerText = "New Note";

    const delBtn = document.getElementById('delete-button');
    if (delBtn) delBtn.remove();


}
document.getElementById('exampleModal').addEventListener('hidden.bs.modal', resetModal);

document.addEventListener('DOMContentLoaded', function () {


    const checkTextLayoutReady = () => {
        const layout = document.getElementById('text-layout');
        if (layout && layout.children.length > 0) {
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

        document.getElementById("note-title").value = "";
        document.getElementById("note-data").value = "";
        document.getElementById("NoteModalLabel").innerText = "New Note";
        const delBtn = document.getElementById('delete-button');
        if (delBtn) delBtn.remove();

        selectedWords = [];
        hideToolbar();
        myModal.show();
    });

    document.getElementById("save-note").addEventListener("click", function () {

        let note_title = document.getElementById("note-title").value;
        let note_data = document.getElementById("note-data").value;


        console.log(notes);
        console.log(validate_inputs());

        if (validate_inputs() == true) {
            note_desc = document.getElementById("note-data").value;

            //notes.push({ "title": note_title, "book": current_book.id, "data": note_data })

            sentence_index_start = Array.from(selectedWords[0].parentElement.parentElement.children).indexOf(selectedWords[0].parentElement);
            sentence_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.parentElement.children).indexOf(selectedWords[selectedWords.length - 1].parentElement);

            word_index_start = Array.from(selectedWords[0].parentElement.children).indexOf(selectedWords[0]);
            word_index_end = Array.from(selectedWords[selectedWords.length - 1].parentElement.children).indexOf(selectedWords[selectedWords.length - 1]);

            console.log(`Chapter : ${current_book.current_chapter}`);
            console.log(`Page : ${currentPageIndex}`)
            //sends json to backend
            save_note({
                "title": note_title,
                "book": current_book.id,
                "data": note_data,
                "note_color": temp_note_color,
                "chapter": current_book.current_chapter,
                "page": currentPageIndex,
                "sentence_index_start": sentence_index_start,
                "sentence_index_end": sentence_index_end,
                "word_index_start": word_index_start,
                "word_index_end": word_index_end
            });


            selectedWords.forEach((word, i) => {
                console.log(word);
                word.classList.add(`note_${notes.length}`);

            });

            // el_class = selectedWords[0].classList.value;
            // temp_note = new Note(notes.length, note_title, current_book.id, note_desc, el_class)

            document.getElementById("note-title").value = "";
            document.getElementById("note-data").value = "";
            document.getElementById("NoteModalLabel").innerText = "New Note";

            isCurrentHighlightSaved = true;
            savedHighlights.push([...selectedWords]);
            selectedWords = [];
            hideToolbar();
            myModal.hide();
        }



    });


});

function noteItem(id) {
    console.log(id)
    myModal.show();
    let m = document.getElementById(id);
    let book_name = document.getElementById("notes-header").innerText;
    document.getElementById("NoteModalLabel").innerText = book_name + " - Note number: " + id;
    document.getElementById("note-title").value = m.children[0].children[0].innerText;
    document.getElementById("note-data").value = m.children[1].innerText;

    // Clear previous footer content to avoid appending multiple delete buttons
    //remove extra generated delete buttons
    //document.getElementById('delete-button').innerHTML = "";
    let footer = document.getElementById("m-footer");

    if (footer.children.length == 2) {
        let delBtn = document.createElement("div");
        delBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
        delBtn.onclick = function () { btnDelete(id); }; // Correct way to assign the function
        delBtn.id = "delete-button";
        footer.appendChild(delBtn);
    }



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


    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;        // Months are zero-based (0-11), so add 1
    const day = now.getDate();

    let newNote = document.createElement("div");
    newNote.innerHTML = `
        
        <div  class='list-group-item  lh-tight notes' onclick="noteItem(`+ note.id + `)" id="` + note.id + `">
            <div class="d-flex w-100 align-items-center justify-content-between" >
                <strong class="mb-1">${note.title}</strong>
                <div class="d-flex flex-column align-items-end">
                <small class="text-muted">${year}-${month}-${day}</small>
                <div class="circle-indicator mt-1" style="background-color:`+ note.color + `;"></div>
            </div>
                
            </div>
            <div class="col-10 mb-1 small">${note.note}</div>
            
        </div>
        

        `;
    note_list.appendChild(newNote);
    num_of_notes++;
}


function save_note(note) {
    console.log(note);
    let username = document.getElementById("ui-username").innerText.trim();
    showSpinner();

    const payload = {
        username: username,
        note: note
    }

    // Send a POST request
    fetch('/api/save-note/', {
        method: 'POST',
        body: JSON.stringify(note),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        }
    })
        .then(response => response.json())
        .then(result => {

            // Hide spinner
            hideSpinner();

            console.log('Success:', result);
            console.log('notes saved')

            const new_notes = result.notes;

            console.log(new_notes)
            notes = []
            document.getElementById('notes-list').innerHTML = "";
            for (let i = 0; i < new_notes.length; i++) {
                console.log(new_notes[i].id);
                console.log(new_notes[i].title);
                console.log(new_notes[i].book);
                console.log(new_notes[i].data);

                //Adds note to the DOM

                addItem(new_notes[i])
            }
            //setupStartPage();

            //loadNotes(new_notes[0].book)
        })
        .catch(error => {
            // Hide spinner
            hideSpinner();
            console.error('Error:', error);
        });
}




function btnDelete(id) {
    document.getElementById("m-footer").removeChild(document.getElementById('delete-button'));
    myModal.hide();

    console.log(id);
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
        .then(response => response.json())
        .then(result => {
            // Hide spinner
            hideSpinner();
            console.log('Success:', result);
            console.log('Note deleted');

            const deletedElement = document.getElementById(result.deleted);
            if (deletedElement) {
                deletedElement.classList.add('fade-out');
                setTimeout(() => deletedElement.remove(), 300); // wait for animation
            }

            const note_result = notes.find(n => n.id === result.deleted);
            console.log(note_result);

            for (let x = note_result.sentence_index_start; x <= note_result.sentence_index_end; x++) {
                for (let y = note_result.word_index_start; y <= note_result.word_index_end; y++) {
                    document.getElementById('text-layout').children[x].children[y].style.backgroundColor = 'rgba(255,255,255,255)';
                }
            }
            notes = notes.filter(note => note.id !== result.deleted);

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
            console.log(data);
            returned_notes = data;
            for (let d = 0; d < data.length; d++) {
                
                console.log(data[d]);
                addItem(data[d]);
            }
            hideSpinner();
        })
        .catch(err => {
            console.error(err);
            hideSpinner();
        });
}