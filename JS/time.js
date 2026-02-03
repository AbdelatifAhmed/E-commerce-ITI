const targetDate = new Date("2026-02-03T00:00:00");

function updateTimer() {
    const now = new Date();
    let diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("timer1").textContent = "Time's up!";
        document.getElementById("timer2").textContent = "Time's up!";
        return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;


    document.getElementById("timer1").textContent =
        `${hours} Hours : ${minutes} Minutes : ${seconds} Seconds`;
    document.getElementById("timer2").textContent =
        `${hours} Hours : ${minutes} Minutes : ${seconds} Seconds`;
}

setInterval(updateTimer, 1000);


