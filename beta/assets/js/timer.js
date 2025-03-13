const TIMER_KEY = "melodify_sleep_timer";
let countdownInterval;

function setSleepTimer(hours, minutes) {
    const totalMinutes = (hours * 60) + minutes; // Convert HH & MM to total minutes

    if (totalMinutes <= 0) {
        alert("Please set a valid sleep timer.");
        return;
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + totalMinutes * 60000); // Calculate end time
    const endTimestamp = endTime.getTime();

    localStorage.setItem(TIMER_KEY, JSON.stringify({ endTime: endTimestamp }));

    startCountdown(endTimestamp);
}

function startCountdown(endTimestamp) {
    updateCountdownDisplay(endTimestamp);

    const remainingTime = endTimestamp - Date.now();
    if (remainingTime > 0) {
        setTimeout(() => {
            pauseMusic();
            localStorage.removeItem(TIMER_KEY);
            document.getElementById("countdownDisplaySpan").innerText = "Timer Ended";
        }, remainingTime);
    }
}

function updateCountdownDisplay(endTimestamp) {
    function update() {
        const now = Date.now();
        const remaining = endTimestamp - now;

        if (remaining > 0) {
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            document.getElementById("countdownDisplaySpan").innerText = 
                `Sleep Timer: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            document.getElementById("countdownDisplaySpan").innerText = "Timer Ended";
            clearInterval(countdownInterval);
        }
    }

    clearInterval(countdownInterval);
    countdownInterval = setInterval(update, 1000);
    update();
}

function checkSleepTimerOnLoad() {
    const timerData = JSON.parse(localStorage.getItem(TIMER_KEY));
    if (timerData) {
        const { endTime } = timerData;
        if (endTime > Date.now()) {
            startCountdown(endTime);
        } else {
            localStorage.removeItem(TIMER_KEY); // Clear old timer
        }
    }
}

function pauseMusic() {
    audio1("pause");
    console.log("Music paused due to sleep timer.");
}

// Cancel Timer Function
function cancelSleepTimer() {
    localStorage.removeItem(TIMER_KEY);
    clearInterval(countdownInterval);
    document.getElementById("countdownDisplaySpan").innerText = "Timer Canceled";
    console.log("Sleep Timer Canceled");
}

// Call this on page load
document.addEventListener("DOMContentLoaded", checkSleepTimerOnLoad);

// Attach event listener for setting the timer
document.getElementById("setTimerBtn").addEventListener("click", () => {
    const hours = parseInt(document.getElementById("inputHours").value) || 0;
    const minutes = parseInt(document.getElementById("inputMinutes").value) || 0;
    setSleepTimer(hours, minutes);
});

// Attach event listener for canceling the timer
document.getElementById("cancelTimerBtn").addEventListener("click", cancelSleepTimer);
