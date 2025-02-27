function validate_inputs() {
    let title = document.getElementById("note-title").value.trim();
    let data = document.getElementById("note-data").value.trim();

    // Regular expression to check for text and numbers
    let textNumberRegex = /^[a-zA-Z0-9\s:{}]+$/;

    // Function to display Bootstrap alert
    function showAlert(message, type) {
        let alertContainer = document.getElementById("alert-container");
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // Check if title and data are non-empty and contain both text and numbers
    if (title === "" || data === "") {
        showAlert("Title and Data fields cannot be empty.", "warning");
        return false;
    }
    
    if (!textNumberRegex.test(title)) {
        showAlert("Title must contain only text and numbers.", "danger");
        return false;
    }
    
    if (!textNumberRegex.test(data)) {
        showAlert("Data must contain only text and numbers.", "danger");
        return false;
    }

    
    return true;
}