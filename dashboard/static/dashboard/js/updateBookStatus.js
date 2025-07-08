const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

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

function export_csv(file) {
    showSpinner();
    console.log(file)
    file = file.replace("\\", "/")
    let fileName = file.split(/[\\.]/);
    console.log(fileName);
    
    
    fileName = fileName[1]
    console.log(fileName)
    const formData = new FormData();
    formData.append("file_path", file);

    fetch("/api/export-dataset/", {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": csrftoken  // Do NOT set Content-Type manually here
        }
    })
    .then(response => {
        if (!response.ok) {
            hideSpinner();
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        hideSpinner();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        hideSpinner();
        alert("Export failed: " + error.message);
    });
}