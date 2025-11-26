// ---------------------- REGISTRATION ------------------------

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const contactInput = document.getElementById("contactInput");
const pinInput = document.getElementById("pinInput");
const saveBtn = document.getElementById("saveBtn");

const loginBox = document.getElementById("loginBox");
const homeBox = document.getElementById("homeBox");

const reg_form = document.getElementById("regForm");

// Hidden form fields
const reg_name_field = document.getElementById("reg_name_field");
const reg_phone_field = document.getElementById("reg_phone_field");
const reg_contacts_field = document.getElementById("reg_contacts_field");
const reg_pin_field = document.getElementById("reg_pin_field");


// ---------------------- AUTO LOGIN -------------------------

window.onload = () => {
    const savedUser = localStorage.getItem("sf_name");
    if (savedUser) {
        loginBox.classList.add("hidden");
        homeBox.classList.remove("hidden");
    }
};


// ---------------------- SAVE REGISTRATION -------------------------

saveBtn.addEventListener("click", () => {
    let nm = nameInput.value.trim();
    let ph = phoneInput.value.trim();
    let cont = contactInput.value.trim();
    let pn = pinInput.value.trim();

    if (!nm || !ph || !cont || !pn) {
        alert("All fields required!");
        return;
    }

    // safety contacts limit check (max 10 allowed)
    let contList = cont.split(",").map(c => c.trim()).filter(c => c.length > 0);
    if (contList.length > 10) {
        alert("Maximum 10 safety contacts allowed!");
        return;
    }

    // Save locally
    localStorage.setItem("sf_name", nm);
    localStorage.setItem("sf_phone", ph);
    localStorage.setItem("sf_contacts", cont);
    localStorage.setItem("sf_pin", pn);

    // Send to Google Form
    reg_name_field.value = nm;
    reg_phone_field.value = ph;
    reg_contacts_field.value = cont;
    reg_pin_field.value = pn;
    reg_form.submit();

    loginBox.classList.add("hidden");
    homeBox.classList.remove("hidden");

    alert("Registration Completed!");
});


// ---------------------- SAFETY CONTACTS (VIEW + UPDATE) ------------------------

const contactsBtn = document.getElementById("contactsBtn");

contactsBtn.addEventListener("click", () => {
    const oldContacts = localStorage.getItem("sf_contacts") || "";

    let updated = prompt(
        "Your Safety Contacts (edit if needed):\n(Max 10 contacts, comma separated)",
        oldContacts
    );

    if (updated !== null && updated.trim() !== "") {

        let list = updated.split(",")
                           .map(x => x.trim())
                           .filter(x => x.length > 0);

        if (list.length > 10) {
            alert("⚠ Maximum 10 contacts allowed!");
            return;
        }

        localStorage.setItem("sf_contacts", updated.trim());
        alert("✔ Safety Contacts Updated Successfully!");
    }
});


// ---------------------- SAFE PLACES ------------------------

const placesBtn = document.getElementById("placesBtn");

placesBtn.addEventListener("click", () => {
    const url = "https://www.google.com/maps/search/police+station+hospital+near+me";
    window.open(url, "_blank");
});


// ---------------------- EMERGENCY MODE ------------------------

const helpBtn = document.getElementById("helpBtn");
const cancelBtn = document.getElementById("cancelBtn");
const statusEl = document.getElementById("status");

const video = document.getElementById("video");
const preview = document.getElementById("preview");

let mediaStream = null;
let alarmSound = null;
let captureLoop = null;


function setStatus(txt) {
    statusEl.innerText = "Status: " + txt;
}


// Alarm start
function startAlarm() {
    alarmSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
    alarmSound.loop = true;
    alarmSound.play().catch(e => console.log("Audio error:", e));
}


// Alarm stop
function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}


// Start Camera
async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = mediaStream;
        video.style.display = "block";
        return true;
    } catch (err) {
        alert("Camera permission denied!");
        return false;
    }
}


// Stop Camera
function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
    }
    video.style.display = "none";
    preview.style.display = "none";
}



// Capture frame
function captureFrame() {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    preview.src = canvas.toDataURL("image/jpeg");
    preview.style.display = "block";
}



// HELP button
helpBtn.addEventListener("click", async () => {
    startAlarm();
    setStatus("Emergency Started!");

    let camOK = await startCamera();
    if (!camOK) return;

    captureFrame();

    captureLoop = setInterval(() => {
        captureFrame();
        console.log("Captured frame...");
    }, 5000);
});



// CANCEL button
cancelBtn.addEventListener("click", () => {
    let savedPin = localStorage.getItem("sf_pin");
    let givenPin = prompt("Enter PIN to cancel:");

    if (savedPin === givenPin) {
        stopAlarm();
        stopCamera();
        clearInterval(captureLoop);
        setStatus("Emergency Stopped");
        alert("Emergency Mode Stopped");
    } else {
        alert("Wrong PIN!");
    }
});