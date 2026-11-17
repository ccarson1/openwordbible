const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

function updatePublishStatus(bookId) {
    fetch(`/dashboard/books/${bookId}/publish/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            document.getElementById(`publish-${bookId}`).checked = data.is_published;
        })
        .catch(err => {
            const toggle = document.getElementById(`publish-${bookId}`);
            toggle.checked = !toggle.checked;
            alert("Error toggling book status");
        });
}

function export_csv(bookId, bookName) {
    showSpinner();
    const formData = new FormData();
    formData.append("book_id", bookId);

    fetch("/api/export-dataset/", {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": csrftoken  // Do NOT set Content-Type manually here
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const disposition = response.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename="(.+)"/);
        return response.blob().then(blob => ({ blob: blob, fileName: match ? match[1] : `${bookName}.csv` }));
    })
    .then(({ blob, fileName }) => {
        hideSpinner();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
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
