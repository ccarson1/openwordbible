class Book {
    constructor({
        id,
        name,
        language,
        date,
        religion,
        content = null,
        authors = null,
        denomination = null,
        translator = null,
        book_id = null,
        description = null,
        rights = null,
        publisher = null,
        image = "book_images/default.jpg",
        book_file = null,
        is_published = false,
        book_index = null,
        current_page = 0,
        total_pages = 0,
        current_chapter = 0
    }) {
        this.id = id;
        this.name = name;
        this.language = language;
        this.date = date;
        this.religion = religion;
        this.content = content;
        this.authors = authors;
        this.denomination = denomination;
        this.translator = translator;
        this.book_id = book_id;
        this.description = description;
        this.rights = rights;
        this.publisher = publisher;
        this.image = image;
        this.book_file = book_file;
        this.is_published = is_published;
        this.book_index = book_index;
        this.current_page = current_page;
        this.total_pages = total_pages;
        this.current_chapter = current_chapter;
    }

    // Example method
    isReadyToPublish() {
        return !!this.name && !!this.book_file && this.is_published;
    }

    callTotalPages(){
        let total_pages = 0
        console.log(this.content)
        for(let x=0; x<this.content.length; x++){
            //console.log(this.content['content'][x]["pages"]);

            for(let y=0; y<this.content[x]["pages"].length; y++){
                // console.log(this.content['content'][x]["pages"][y])
                total_pages ++;
            }
        }

        this.total_pages = total_pages;
    }
}
