class Note{
    constructor(
        book,
        note, 
        user,
        date
    ){
        this.book = book;
        this.note = note;
        this.user = user;
        this.date = date;
    }
}



// num_of_notes = 0;
// notes = []


// var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));

// document.addEventListener('DOMContentLoaded', function () {
//     // Get references to the modal and the trigger button

//     var triggerButton = document.getElementById('btn-new-note');

//     // Add an event listener to the button to show the modal
//     triggerButton.addEventListener('click', function () {
//         myModal.show();
//         document.getElementById("note-title").value = "";
//         document.getElementById("note-data").value = "";
//         document.getElementById("NoteModalLabel").innerText = "New Note";
//     });

//     document.getElementById("save-note").addEventListener("click", function () {

//         let note_title = document.getElementById("note-title").value;
//         let note_data = document.getElementById("note-data").value;




//         console.log(notes);

//         if (validate_inputs() == true) {
//             notes.push({ "title": note_title, "book": curr_book, "data": note_data })
//             //sends json to backend
//             save_notes(notes);
//             myModal.hide();
//         }



//     });


// });

// function noteItem(id) {
//     console.log(id)
//     myModal.show();
//     let m = document.getElementById(id);
//     let book_name = document.getElementById("notes-header").innerText;
//     document.getElementById("NoteModalLabel").innerText = book_name + " - Note number: " + id;
//     document.getElementById("note-title").value = m.children[0].children[0].innerText;
//     document.getElementById("note-data").value = m.children[1].innerText;

//     // Clear previous footer content to avoid appending multiple delete buttons
//     //remove extra generated delete buttons
//     //document.getElementById('delete-button').innerHTML = "";
//     let footer = document.getElementById("m-footer");

//     if (footer.children.length == 2) {
//         let delBtn = document.createElement("div");
//         delBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
//         delBtn.onclick = function () { btnDelete(id); }; // Correct way to assign the function
//         delBtn.id = "delete-button";
//         footer.appendChild(delBtn);
//     }



// }

// function addItem(note_title, note_data, note_id) {



//     let note_list = document.getElementById('notes-list');
//     if (!note_list) {
//         console.error('Element with id "note-list" not found.');
//         return;
//     }


//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth() + 1;        // Months are zero-based (0-11), so add 1
//     const day = now.getDate();

//     let newNote = document.createElement("div");
//     newNote.innerHTML = `
        
//         <div  class='list-group-item  lh-tight notes' onclick="noteItem(`+ note_id + `)" id="` + note_id + `">
//             <div class="d-flex w-100 align-items-center justify-content-between" >
//                 <strong class="mb-1">${note_title}</strong>
//                 <small class="text-muted"> ${year}-${month}-${day}</small>
                
//             </div>
//             <div class="col-10 mb-1 small">${note_data}</div>
            
//         </div>
        

//         `;
//     note_list.appendChild(newNote);
//     num_of_notes++;
// }


// function save_notes(notes) {
//     console.log(notes);
//     let username = document.getElementById("ui-username").innerText;
//     showSpinner();

//     const payload = {
//         username: username,
//         notes: notes
//     }

//     // Send a POST request
//     fetch('/save-notes', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//     })
//         .then(response => response.json())
//         .then(result => {

//             // Hide spinner
//             hideSpinner();

//             console.log('Success:', result);
//             console.log('notes saved')

//             const notes = result.notes;

//             console.log(notes)
//             document.getElementById('notes-list').innerHTML = "";
//             for (let i = 0; i < notes.length; i++) {
//                 console.log(notes[i].id);
//                 console.log(notes[i].title);
//                 console.log(notes[i].book);
//                 console.log(notes[i].data);

//                 //Adds note to the DOM

//                 addItem(notes[i].title, notes[i].data, notes[i].id)
//             }
//             //setupStartPage();
//         })
//         .catch(error => {
//             // Hide spinner
//             hideSpinner();
//             console.error('Error:', error);
//         });
// }




// function btnDelete(id) {
//     document.getElementById("m-footer").removeChild(document.getElementById('delete-button'));
//     myModal.hide();

//     console.log(id);
//     // Show spinner
//     showSpinner();

//     // Send a POST request
//     fetch('/delete-note', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ "note_id": id, "book_id": curr_book }) // Use 'body' to send the request payload
//     })
//         .then(response => response.json())
//         .then(result => {
//             // Hide spinner
//             hideSpinner();
//             console.log('Success:', result);
//             console.log('Note deleted');

//             const notes = result.notes;

//             console.log(notes)
//             document.getElementById('notes-list').innerHTML = "";
//             for (let i = 0; i < notes.length; i++) {
//                 console.log(notes[i].id);
//                 console.log(notes[i].title);
//                 console.log(notes[i].book);
//                 console.log(notes[i].data);

//                 //Adds note to the DOM

//                 addItem(notes[i].title, notes[i].data, notes[i].id)
//             }
//             //setupStartPage();
//         })
//         .catch(error => {
//             // Hide spinner
//             hideSpinner();
//             console.error('Error:', error);
//         });
// }