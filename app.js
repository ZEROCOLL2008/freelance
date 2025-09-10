import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
// getStorage import එක දැන් අවශ්‍ය නෑ
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeTVg9d0NZOyq3zB5-tqiSl9-ywRUMSkg",
    authDomain: "task-f8eb3.firebaseapp.com",
    projectId: "task-f8eb3",
    storageBucket: "task-f8eb3.appspot.com", 
    messagingSenderId: "809013258784",
    appId: "1:809013258784:web:b78ada4b520d95da362a45",
    measurementId: "G-DL8DB2F0BY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const storage = getStorage(app); // Storage object එක දැන් අවශ්‍ය නෑ

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
        const imgbbApiKey = 'f068295c19803c448665a0ea48bcc2fc'; // <--- !!! මෙතනට ඔයාගේ API key එක දාන්න !!!
        const formData = new FormData();
        formData.append('image', screenshotFile);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });

        const imgbbResult = await imgbbResponse.json();

        if (!imgbbResult.success) {
            // ImgBB upload එක fail වුනොත් error එකක් පෙන්වන්න
            throw new Error(`Image upload failed: ${imgbbResult.error.message}`);
        }

        const imageUrl = imgbbResult.data.url; // ImgBB එකෙන් ලැබෙන image link එක

        // --- Step 2: Save data (with ImgBB URL) to Firestore ---
        const submissionData = {
            regNumber: regNumber,
            phoneNumber: phoneNumber,
            district: district,
            taskDate: selectedDate,
            screenshotURL: imageUrl, // ImgBB link එක මෙතන save කරනවා
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