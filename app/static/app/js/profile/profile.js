function send_profile_data(event) {
    event.preventDefault();

    const form = document.getElementById("form-container");
    const csrftoken = form.querySelector('[name=csrfmiddlewaretoken]').value;
    const image_input = document.getElementById("profile-image");

    let formData = new FormData();
    if (image_input.files.length > 0) {
        formData.append("profile-image", image_input.files[0]);
    }
    formData.append("username", form.elements["username"].value);
    formData.append("email", form.elements["email"].value);
    formData.append("password", form.elements["password"].value);

    fetch("/api/profile/", {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": csrftoken
        }

    })
        .then(response => response.json().then(data => ({ ok: response.ok, data: data })))
        .then(({ ok, data }) => {
            if (!ok) {
                alert(data.error || data.detail || "The profile could not be updated.");
                return;
            }
            window.location.reload();
        })
        .catch(() => alert("The profile could not be updated."));
}


if (document.getElementById("form-container")) {
    document.getElementById("form-container").addEventListener("submit", send_profile_data);
}
