import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6wfcw2AB2ATdG29MKdON2Wb1R2UH7Uuc",
    authDomain: "taskdone-aca18.firebaseapp.com",
    projectId: "taskdone-aca18",
    storageBucket: "taskdone-aca18.appspot.com",
    messagingSenderId: "1035778561207",
    appId: "1:1035778561207:web:041497e4e0095e292c6932",
    measurementId: "G-Q4M4V0C8EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const regNumberInput = document.getElementById('regNumber');
const phoneInput = document.getElementById('phoneNumber');
const districtInput = document.getElementById('district');
const dateInput = document.getElementById('taskDate');
const screenshotInput = document.getElementById('screenshot');
const statusInput = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');
const loadingDiv = document.getElementById('loading');

submitBtn.addEventListener('click', async () => {
    // Get values from input fields
    const regNumber = regNumberInput.value;
    const phoneNumber = phoneInput.value;
    const district = districtInput.value;
    const selectedDate = dateInput.value;
    const screenshotFile = screenshotInput.files[0];
    const status = statusInput.value;
    const apiKey = 'a5ebe079102608265e453fd45c90f790'; // ImgBB API Key

    // --- Validation ---
    if (!regNumber || !phoneNumber || !district || !selectedDate || !screenshotFile) {
        alert('Please fill all the fields!');
        return;
    }

    // --- Show Loading State ---
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    loadingDiv.classList.remove('hidden');

    try {
        // --- Step 1: Upload image to ImgBB ---
        const formData = new FormData();
        formData.append('image', screenshotFile);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const imgbbResult = await imgbbResponse.json();
        
        if (!imgbbResult.success) {
            throw new Error(imgbbResult.error.message || 'Image upload failed.');
        }

        const imageUrl = imgbbResult.data.url;

        // --- Step 2: Save data to Firestore ---
        const submissionData = {
            regNumber: regNumber,
            phoneNumber: phoneNumber,
            district: district,
            taskDate: selectedDate,
            screenshotURL: imageUrl,
            status: status,
            submittedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, "submissions"), submissionData);
        alert('Submission successful! Thank you.');
        
        // Reset the form
        regNumberInput.value = '';
        phoneInput.value = '';
        districtInput.value = '';
        dateInput.value = '';
        screenshotInput.value = '';

    } catch (error) {
        console.error("Error:", error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        // --- Hide Loading State ---
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Task';
        loadingDiv.classList.add('hidden');
    }
});