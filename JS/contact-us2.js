const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name");
document.getElementById("thankYou").textContent = `Thank you ${name} for contacting us`;