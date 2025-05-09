class BookFormatter{
    constructor(
        book,
        user,
        words = 300,
        columns = 1,
        font = 'None',
        font_size = 1,
        color = "black"
    ){
        this.book = book;
        this.user = user;
        this.words = words;
        this.columns = columns;
        this.font = font;
        this.font_size = font_size;
        this.color = color;
        
    }
}