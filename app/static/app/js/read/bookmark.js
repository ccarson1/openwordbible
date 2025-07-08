class Bookmark {
    constructor({ book, user, chapter, page, word, scroll_position }) {
        this.book = book;
        this.user = user;
        this.chapter = chapter;
        this.page = page;
        this.word = word;
        this.scroll_position = scroll_position;
    }

    static async save(bookmarkData) {
        try {
            const response = await fetch('/api/bookmark/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Bookmark.getCSRFToken(),
                },
                body: JSON.stringify(bookmarkData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Bookmark saved:', result);
            return result;
        } catch (error) {
            console.error('Error saving bookmark:', error);
            throw error;
        }
    }

    static async load(bookId) {
        try {
            const response = await fetch(`/api/bookmark/${bookId}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Bookmark loaded:', result);
            return result.bookmark; 
        } catch (error) {
            console.error('Error loading bookmark:', error);
            throw error;
        }
    }

    static getCSRFToken() {
        const name = 'csrftoken';
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : '';
    }
}
