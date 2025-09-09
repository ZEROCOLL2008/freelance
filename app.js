// 1. Firebase v9+ Modular SDK eken functions import karaganna
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 2. Oyage Web App eke Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6wfcw2AB2ATdG29MKdON2Wb1R2UH7Uuc",
    authDomain: "taskdone-aca18.firebaseapp.com",
    projectId: "taskdone-aca18",
    storageBucket: "taskdone-aca18.appspot.com",
    messagingSenderId: "1035778561207",
    appId: "1:1035778561207:web:041497e4e0095e292c6932",
    measurementId: "G-Q4M4V0C8EC"
};

// 3. Firebase Initialize karanna
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore database eka ganna

// 4. DOM Elements - HTML eke thiyena input fields serama select karaganna
const regNumberInput = document.getElementById('regNumber');
const dateInput = document.getElementById('taskDate');
const screenshotInput = document.getElementById('screenshot');
const statusInput = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');
const loadingDiv = document.getElementById('loading');

// 5. Submit Button eka click kalama wena dewal
submitBtn.addEventListener('click', async () => {
    // Input fields walin values ganna
    const regNumber = regNumberInput.value;
    const selectedDate = dateInput.value;
    const screenshotFile = screenshotInput.files[0];
    const status = statusInput.value;
    const apiKey = 'a5ebe079102608265e453fd45c90f790'; // ImgBB API Key eka

    // --- Validation: Fields serama purawalada balanna ---
    if (!regNumber || !selectedDate || !screenshotFile) {
        alert('Please fill all fields: Register Number, Task Date, and Screenshot!');
        return; // Fields madinam, methanin nawaththanna
    }

    // --- Loading State: User ta wade wenawa kiyala pennanna ---
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    loadingDiv.classList.remove('hidden');

    try {
        // --- Step 1: Screenshot eka ImgBB ekata upload karanna ---
        const formData = new FormData();
        formData.append('image', screenshotFile);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const imgbbResult = await imgbbResponse.json();
        
        if (!imgbbResult.success) {
            // ImgBB eken error ekak awoth
            throw new Error(imgbbResult.error.message || 'Image upload failed. Please try again.');
        }

        const imageUrl = imgbbResult.data.url; // Upload karapu image eke URL eka

        // --- Step 2: Serama data Firestore eke save karanna ---
        const submissionData = {
            regNumber: regNumber,
            taskDate: selectedDate, // User select karapu date eka
            screenshotURL: imageUrl, // ImgBB eken gaththa URL eka
            status: status,
            submittedAt: serverTimestamp() // Submit karapu welawa save karanna
        };
        
        // 'submissions' kiyana collection ekata data ටික add karanna
        const docRef = await addDoc(collection(db, "submissions"), submissionData);
        console.log("Document written with ID: ", docRef.id);

        alert('Submission successful! Thank you.');
        
        // Form eka reset karanna
        regNumberInput.value = '';
        dateInput.value = '';
        screenshotInput.value = '';
        statusInput.value = 'All tasks done';

    } catch (error) {
        // Process eke mokak hari error ekak unoth
        console.error("Error:", error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        // --- Loading State eka iwara karanna ---
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Task';
        loadingDiv.classList.add('hidden');
    }
});