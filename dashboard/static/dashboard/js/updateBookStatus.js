function updatePublishStatus(bookId) {
    fetch(`/dashboard/books/${bookId}/publish/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken() // if using Django
        }
    })
    .then(response => response.json())
    .then(data => console.log("Toggled:", data))
    .catch(err => alert("Error toggling book status"));
}

// CSRF helper (Django only)
function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}