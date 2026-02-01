const form = document.getElementById("contactForm");
const thankYou = document.getElementById('thankYou')
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.user_name.value;
    const email = form.user_email.value;
    const message = form.message.value;


    const params = new URLSearchParams({
        name: name,
        email: email,
        message: message
    });

    window.location.href = "contact-us-respond.html?" + params.toString();
});
