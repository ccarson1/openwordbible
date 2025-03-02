const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

let bookName = document.getElementById("book-name");
let bookReligion = document.getElementById("book-religion");
let inputBookDenom = document.getElementById("input-book-denom");
let textPreview = document.getElementById("text-preview");


function get_book_type(){
    return bookType.value;
}

document.getElementById("up-book-txt").addEventListener('change', function(event){
    console.log("uploading new book")

    console.log(get_book_type());
    showSpinner();
    file = event.target.files[0];
    let textPreview = document.getElementById("text-preview"); // Ensure this element exists

    if (file) {
        let reader = new FileReader();

        reader.onload = function(e) {
            
            textPreview.innerText = e.target.result;
            hideSpinner();
        };

        reader.readAsText(file); // Read file as text
    } else {
        textPreview.innerText = "No file selected.";
    }
    

});


document.addEventListener("DOMContentLoaded", function () {
    let myTabs = document.getElementById("myTabs");

    myTabs.addEventListener("shown.bs.tab", function (event) {
        let activeTab = event.target; // The currently active tab
        let activeTabText = activeTab.innerText; // Get the text of the active tab
        let activeTabHref = activeTab.getAttribute("href"); // Get the href of the active tab

        console.log("Active Tab Text:", activeTabText);
        console.log("Active Tab Href:", activeTabHref);
    });
});


