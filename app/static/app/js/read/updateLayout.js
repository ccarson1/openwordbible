const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("layout-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    let bookId = document.getElementById("book_id").innerText;
    data["id"] = parseInt(bookId);
    console.log(parseInt(bookId));
    console.log(data["id"]);

    fetch("/api/update-layout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken 
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        window.location.reload();
        
        return response.json();
      })
      .then((result) => {
        console.log("Success:", result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
