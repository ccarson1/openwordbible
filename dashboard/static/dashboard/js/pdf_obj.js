class Pdf_obj extends Book{
    constructor(file){
       super(file);
        
    }

    outline_container() {
        this.set_outline();
        let outline = this.get_outline()
        let outline_container = document.getElementById("outline-container");

        for(let o=0; o<outline.length; o++){
            console.log(`Title: ${outline[o]["title"]} Page: ${outline[o]["page"]}`);

            let newOutline = document.createElement("span");
            newOutline.setAttribute("class", "outline-element")

            let newTitle = document.createElement("input");
            newTitle.setAttribute("type", "text");
            newTitle.value = outline[o]["title"];
            newTitle.style.width = "60%";

            let newPage = document.createElement("input");
            newPage.setAttribute("type", "text");
            newPage.value = outline[o]["page"];
            newPage.style.width = "15%";

            let removeButton = document.createElement("button");
            removeButton.setAttribute("type", "button");
            removeButton.setAttribute("class", "btn btn-danger");
            removeButton.setAttribute("id", "remove-button");

            let trashIcon = document.createElement("i");
            trashIcon.setAttribute("class", "bi bi-trash");
            removeButton.appendChild(trashIcon);
            removeButton.style.height = "30px";

            newOutline.appendChild(newTitle);
            newOutline.appendChild(newPage);
            newOutline.appendChild(removeButton);
            outline_container.appendChild(newOutline);
        }
        
    }

}