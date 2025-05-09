class Book {
    constructor({
        id,
        name,
        language,
        date,
        religion,
        content,
        authors = null,
        denomination = null,
        translator = null,
        book_id = null,
        description = null,
        rights = null,
        publisher = null,
        image = "book_images/default.jpg",
        book_file = null,
        is_published = false
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
    }

    // Example method
    isReadyToPublish() {
        return !!this.name && !!this.book_file && this.is_published;
    }
}
