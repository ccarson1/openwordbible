class Pdf_obj extends Book{
    constructor(file){
       super(file);
        
    }

    populate_outline(outline){
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
            removeButton.setAttribute("class", "btn btn-danger remove-button");
            

            let trashIcon = document.createElement("i");
            trashIcon.setAttribute("class", "bi bi-trash");
            removeButton.appendChild(trashIcon);
            removeButton.style.height = "30px";

            newOutline.appendChild(newTitle);
            newOutline.appendChild(newPage);
            newOutline.appendChild(removeButton);
            outline_container.appendChild(newOutline);
        }

        this.initiate_outline();
    }

    outline_container() {
        this.set_outline();
        let outline = this.get_outline()
        this.populate_outline(outline);
        
        
    }

    remove_outline(index){
        let outline = this.get_outline();
        outline.splice(index, 1);
        this.set_outline(outline);
        
    }

    add_outline(index, element){
        let outline = this.get_outline();
        outline.splice(index, 0, element);
        this.set_outline(outline);
        
    }

    swap_outline(start, end){
        let outline = this.get_outline();
        let temp = outline[start];
        outline[start] = outline[end];
        outline[end] = temp;
        this.set_outline(outline);
        
    }

    clear_outline(){
        let outline = this.get_outline();
        document.getElementById("outline-container").innerHTML = "";
        this.populate_outline(outline);
    }

    initiate_outline(){
        let removeButtons = document.getElementsByClassName("remove-button");
        let outline_container = document.getElementById("outline-container");
        for(let r=0; r<removeButtons.length; r++){
            removeButtons[r].addEventListener("click", () =>{
                console.log(`Index: ${r}`);
                this.remove_outline(r);
                this.clear_outline();

                
            })
        }
    }

}