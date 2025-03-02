// document.getElementById('toggle-password').addEventListener('click', function () {
//     console.log("toggled password visible")
//     const passwordInput = document.getElementById('input-pass');
//     const icon = this.querySelector('i');

//     if (passwordInput.type === 'password') {
//         passwordInput.type = 'text';
//         icon.classList.remove('fa-eye-slash');
//         icon.classList.add('fa-eye');
//     } else {
//         passwordInput.type = 'password';
//         icon.classList.remove('fa-eye');
//         icon.classList.add('fa-eye-slash');
//     }
// });

const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

function send_profile_data(){

    image_input = document.getElementById("profile-image");
    username = document.getElementById("username-input");
    useremail = document.getElementById("email-input");

    let formData = new FormData();
    if (image_input.files.length > 0) {
        formData.append("profile-image", image_input.files[0]);
    } else {
        console.error("No file selected");
    }
    console.log(image_input.files)
    formData.append("username", username.value);
    formData.append("email", useremail.value);
    fetch("/api/profile/",{
        method: "POST",
        body: formData,
        headers:{
            "X-CSRFToken": csrftoken
        }

    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
        }
        return response.json();
    })

    document.getElementById("prof-image")
}



document.getElementById("btnSendData").addEventListener("click", function(){
    send_profile_data();
});