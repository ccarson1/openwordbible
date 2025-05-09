const popup = document.getElementById("searchPopup");
const openBtn = document.getElementById("openSearchPopup");
const closeBtn = document.getElementById("closeSearchPopup");

openBtn.onclick = () => popup.style.display = "block";
closeBtn.onclick = () => popup.style.display = "none";

document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.trim();
    const resultsDiv = document.getElementById("searchResults");

    // Only search if input is not empty
    if (query.length === 0) {
        resultsDiv.innerHTML = "";
        return;
    }

    // Call your API endpoint, replace URL with your actual endpoint
    fetch(`/api/search-books/?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            // Assuming data is an array of results
            resultsDiv.innerHTML = "";

            data.forEach(item => {
                const div = document.createElement("div");
                console.log(item)
                div.textContent = item.name || item; // Adjust depending on your API response
                div.classList.add("search-result-item");
                div.onclick = () => {
                    alert(`You clicked on "${div.textContent}"`);
                    popup.style.display = "none";

                    const formData = new FormData();
                    formData.append("id", item.id);
                    fetch(`/api/load-book/`, {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": getCookie("csrftoken"),
                        },
                        body: formData,
                    })
                        .then(response => {
                            if (!response.ok) throw new Error("Network response was not ok");
                            return response.json();
                        })
                        .then(data => {
                            console.log("Book loaded:", data);
                            // Do something with data.book and data.book_format
                        })
                        .catch(error => {
                            console.error("Error loading book:", error);
                        });
                };
                resultsDiv.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error fetching search results:", error);
            resultsDiv.innerHTML = "<p>Error loading results</p>";
        });
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
