class Book{
    constructor(file){
        this.file = file;
        this.bookdata;
        this.book_array;
        this.content;
        this.current_page = 0;
        this.end_page = 0;
        this.content_pages;
        this.total_pages;
        this.partition_text;
        this.matches = [];
        this.outline;
        this.offest_page
        
    }

    fill_form(data=this.book_array){
        console.log(`Author: ${data['author'][0]}`)
        console.log(`Date: ${data['date'][0]}`)
        console.log(`Identifier: ${data['identifier'][0]}`)
        console.log(`Publisher: ${data['publisher'][0]}`)
        console.log(`Rights: ${data['rights'][0]}`)
        console.log(`Title: ${data['title'][0]}`)
        console.log(`Description: ${data['description']}`)
    
        document.getElementById("book-name").value = data['title'][0];
        document.getElementById("input-book-author").value = data['author'][0];
        document.getElementById("input-book-id").value = data['identifier'][0];
        document.getElementById("book-right").innerText = `Rights: ${data['rights'][0]}`;
        document.getElementById("book-pub").innerText = `Publisher: ${data['publisher'][0]}`;
    
    }

    split_words(text){
        console.log(text)
        text = text.replace("\n", " ");
        return text.split(/\s+/);
    }

    splitTextIntoChunks(words, wordsPerChunk=255){
        wordsPerChunk = parseInt(wordsPerChunk);
        const chunks = [];
        //page_text = ''
        let counter = 0;
        for (let i = 0; i < words.length; i++) {
            if(i == (parseInt(wordsPerChunk)*counter)){
                console.log(i)
                console.log((wordsPerChunk*counter)+wordsPerChunk)
                console.log(words.slice(i, (wordsPerChunk*counter)+wordsPerChunk).length)
                chunks.push(words.slice(i, (wordsPerChunk*counter)+wordsPerChunk).join(' '));
                counter++;
            }

        }

        return chunks;
    }

    get_conversion(page_content, wordsPerPage){
        let words = this.split_words(page_content);
        let page_array = this.splitTextIntoChunks(words, wordsPerPage);
        
        return page_array;
    }



    // generateRegexFromText(text) {
    //     // Escape special regex characters except for '|'
    //     let escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
    //     // Replace digit sequences with a flexible digit matcher
    //     let regexPattern = escapedText.replace(/\d+/g, '\\d+');
        
    //     // Modify pattern to match delimiters
    //     let regex = new RegExp(`(?=(${regexPattern}))`);
    
    //     return regex;
    // }

    generateRegexFromText(text, custom_regex) {

        // if(custom_regex == true){
        //     console.log(`The custom regex is ${custom_regex}`)
        //     return text;
        // }
        // else{
        //     // Escape special regex characters except for '|'
        //     let escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        //     // Replace digit sequences with a flexible digit matcher allowing an optional '?'
        //     let regexPattern = escapedText.replace(/\d+\?/g, '\\d+\\?').replace(/\d+/g, '\\d+');
        
        //     // Modify pattern to match delimiters
        //     let regex = new RegExp(`(?=(${regexPattern}))`);

        //     return regex;
        // }
        return text
    
        
    }

    populate_preview_text(content=this.get_content()){
        //content = content.split(/\s+/);
        // console.log(`The regex is: ${this.get_partitionText()}`);
        // //content = content.split(this.get_partitionText());
        // console.log(content);
        
        let preview_text = document.getElementById("text-preview");
        preview_text.innerText = content;
        // let temp_string = '';
        // content.forEach(t => {
        //     let wordDiv = document.createElement("div");
        //     wordDiv.innerText = t;
        //     wordDiv.setAttribute("class", "test-item");
        //     preview_text.appendChild(wordDiv);
        // });
    }

    // partitionText(text, regex){

    //     // for(let t=0; t<content.length;t++){
    //     //     if(partition.test(content[t].innerText)){
    //     //         content[t].className = "test-item-par"
    //     //     }else{
    //     //         content[t].className = "test-item"
    //     //     }
    //     // }
    //     console.log(partition)
    //     console.log(content)
    //     let split_content = content.split(partition);
    //     console.log(split_content)
    //     let preview_text = document.getElementById("text-preview");
    //     preview_text.innerText = '';
    //     let temp_string = '';
    //     split_content.forEach(t => {
    //         let wordDiv = document.createElement("div");
    //         wordDiv.innerText = t;
    //         wordDiv.setAttribute("class", "test-item");
    //         preview_text.appendChild(wordDiv);
    //     });


    // }

    partitionText(text, label, regex) {
        // if (typeof text !== "string" || !text) {
        //     console.error("Invalid text input");
        //     return [];
        // }
    
        // if (!(regex instanceof RegExp)) {
        //     console.error("Invalid regex input, ensure it's a valid RegExp object.");
        //     return [];
        // }
    
        let matches = this.matches;
        let match;

        
    
        // // Ensure regex has the global flag to find all matches
        // let globalRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    
        let globalRegex = new RegExp(regex, "g");
        //console.log(text.match(/\d+/g))
        console.log(globalRegex)
        console.log(regex)
        matches = [...text.matchAll(regex)]
        console.log(matches);
        // console.log(matches[0][0]);
        // console.log(matches[0][1]);


        // while ((match = regex.exec(text)) !== null) {
        //     if (match.index === regex.lastIndex) {
        //         regex.lastIndex++; // Prevent infinite loop
        //     }
    
        //     matches.push({
        //         start: match.index,
        //         end: match.index + match[0].length,
        //         match: match[1],
        //         label: label
        //     });
        // }
        console.log(matches)
        this.matches = matches;
        return matches;
    }

    createEditorPopup(targetElement) {

        console.log(targetElement)
    
        // Create overlay background
        let overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "1000";
    
        // Create popup container
        let popup = document.createElement("div");
        popup.style.backgroundColor = "white";
        popup.style.padding = "20px";
        popup.style.borderRadius = "8px";
        popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
        popup.style.minWidth = "300px";
        popup.style.width = "70%";
    
    
        // Create textarea
        let textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "70vh";
        textarea.value = targetElement.children[0].innerText;
    
        // Create buttons
        let saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.style.marginRight = "10px";
    
        let cancelButton = document.createElement("button");
        cancelButton.innerText = "Cancel";
    
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
    
        // Append elements
        popup.appendChild(textarea);
        popup.appendChild(document.createElement("br"));
        popup.appendChild(saveButton);
        popup.appendChild(cancelButton);
        popup.appendChild(deleteButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    
        // Save button action
        saveButton.addEventListener("click", function () {
            targetElement.innerText = textarea.value;
            document.body.removeChild(overlay);
        });
    
        // Cancel button action
        cancelButton.addEventListener("click", function () {
            document.body.removeChild(overlay);
        });
    
        deleteButton.addEventListener("click", function(){
            document.getElementById("page-list").removeChild(targetElement);
            document.body.removeChild(overlay);
        });
    }

    populate_preview_pages(c){

        let page_list = document.getElementById("page-list");
        let newChapter = document.createElement("div");
        newChapter.textContent = formated_book.content[c]['chapter'];
        newChapter.setAttribute("class", "page-container");

        for (let p = 0; p < formated_book.content[c]['pages'].length; p++) {
            let newPage = document.createElement("div");
            newPage.textContent = formated_book.content[c]['pages'][p];
            newPage.setAttribute("class", "page-list-item");
            newChapter.appendChild(newPage);
        }
        newChapter.addEventListener("click", () => {
            this.createEditorPopup(newChapter);
        });
        page_list.appendChild(newChapter);

        // let wordsPerPage = document.getElementById("input-words-per-page").value;
        // if (parseInt(wordsPerPage) > 0) {
        //     let page_array = page_pile.get_conversion(page_content, wordsPerPage)
        //     for (let x = 0; x < page_array.length; x++) {
        //         let page_count = document.getElementById("page-list").children.length;
        //         let newPageContainer = document.createElement("div");
        //         newPageContainer.setAttribute("class", "page-container");
        //         let newPage = document.createElement("div");
        //         newPage.setAttribute("class", "page-list-item");
        //         newPage.innerText = page_array[x]
                
        //         let pageNumber = document.createElement("div");
        //         pageNumber.innerText = x;
        //         pageNumber.setAttribute("class", "page-number");
        //         newPageContainer.appendChild(newPage);
        //         newPageContainer.appendChild(pageNumber);
        //         newPageContainer.addEventListener("click", ()=> {
        //             this.createEditorPopup(newPageContainer);
        //         });
        //         document.getElementById("page-list").appendChild(newPageContainer);
        //     }
        // }
        // else{
        //     alert("You must enter Words per page");
    
        // }
    }

    set_book_data(book_data){
        this.book_data = book_data;
    }
    get_book_data(){
        return this.book_data;
    }
    set_book_array(book_array = this.book_data['uploaded-file']) {
        this.book_array = book_array;
    }
    get_book_array(){
        return this.book_array;
    }
    set_content(content = this.book_array["content"][this.current_page]){
        this.content = content;
    }
    get_content(){
        return this.content;
    }
    set_current_page(current_page){
        this.current_page = current_page;
    }
    get_current_page(){
        return this.current_page;
    }

    set_end_page(end_page= this.book_data['uploaded-file'].length){
        this.end_page = end_page;
    }
    get_end_page(){
        return this.end_page;
    }
    set_content_pages(content_pages = this.book_data['uploaded-file']['content']){
        this.content_pages = content_pages;
    }
    get_content_pages(){
        return this.content_pages;
    }
    set_partitionText(partition_text){
        this.partition_text = partition_text;
    }
    get_partitionText(){
        return this.partitionText;
    }
    set_outline(outline= this.book_data['uploaded-file']['book_outline']){
        this.outline = outline;
    }
    get_outline(){
        return this.outline;
    }
    set_offest_page(offest_page = this.book_array["offset_page"]){
        this.offest_page = offest_page;
    }
    get_offset_page(){
        return this.offest_page;
    }
}