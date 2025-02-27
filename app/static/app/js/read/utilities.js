function showSpinner() {
    document.getElementById('spinner-overlay').style.display = 'flex';
    document.getElementById('spinner-container').style.display = 'inline-block';
}

function hideSpinner() {
    document.getElementById('spinner-overlay').style.display = 'none';
    document.getElementById('spinner-container').style.display = 'none';
}