import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeTVg9d0NZOyq3zB5-tqiSl9-ywRUMSkg",
    authDomain: "task-f8eb3.firebaseapp.com",
    projectId: "task-f8eb3",
    // නිවැරදි කරන ලද storageBucket නම
    storageBucket: "task-f8eb3.firebasestorage.app",
    messagingSenderId: "809013258784",
    appId: "1:809013258784:web:b78ada4b520d95da362a45",
    measurementId: "G-DL8DB2F0BY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const regNumberInput = document.getElementById('regNumber');
const phoneInput = document.getElementById('phoneNumber');
const districtInput = document.getElementById('district');
const dateInput = document.getElementById('taskDate');
const screenshotInput = document.getElementById('screenshot');
// const statusInput = document.getElementById('status'); // <-- මෙම line එක ඉවත් කරන ලදී
const submitBtn = document.getElementById('submitBtn');
const loadingDiv = document.getElementById('loading');

submitBtn.addEventListener('click', async () => {
    // Get values from input fields
    const regNumber = regNumberInput.value;
    const phoneNumber = phoneInput.value;
    const district = districtInput.value;
    const selectedDate = dateInput.value;
    const screenshotFile = screenshotInput.files[0];
    // const status = statusInput.value; // <-- මෙම line එක ඉවත් කරන ලදී

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
        // --- Step 1: Firebase Storage වෙත Screenshot එක Upload කිරීම ---
        const fileName = `${Date.now()}-${screenshotFile.name}`;
        const storageRef = ref(storage, `screenshots/${fileName}`);
        
        const uploadResult = await uploadBytes(storageRef, screenshotFile);
        const imageUrl = await getDownloadURL(uploadResult.ref);

        // --- Step 2: Firestore වෙත දත්ත Save කිරීම ---
        const submissionData = {
            regNumber: regNumber,
            phoneNumber: phoneNumber,
            district: district,
            taskDate: selectedDate,
            screenshotURL: imageUrl,
            // status: status, // <-- මෙම line එක ඉවත් කරන ලදී
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
        // statusInput.value = ''; // අදාළ නැති නිසා ඉවත් කරන ලදී

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