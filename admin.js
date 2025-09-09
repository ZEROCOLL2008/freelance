// 1. Firebase v9+ Modular SDK - getCountFromServer aluthen import karala
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, Timestamp, getCountFromServer } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 2. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6wfcw2AB2ATdG29MKdON2Wb1R2UH7Uuc",
    authDomain: "taskdone-aca18.firebaseapp.com",
    projectId: "taskdone-aca18",
    storageBucket: "taskdone-aca18.appspot.com",
    messagingSenderId: "1035778561207",
    appId: "1:1035778561207:web:041497e4e0095e292c6932",
};

// 3. Firebase Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. DOM Elements
const tableBody = document.getElementById('submissionsTableBody');
const searchInput = document.getElementById('searchInput');
const datePicker = document.getElementById('datePicker');
const loadingState = document.getElementById('loadingState');
const modal = document.getElementById('screenshotModal');
const modalImage = document.getElementById('modalImage');
const closeModalBtn = document.getElementById('closeModalBtn');
const totalCountEl = document.getElementById('totalCount'); // Aluth Count element eka
const displayCountEl = document.getElementById('displayCount'); // Aluth Count element eka

let allSubmissions = [];

/**
 * Table eka render karana function eka
 */
const renderTable = (submissions) => {
    displayCountEl.textContent = submissions.length; // Pennana gana update karanna
    tableBody.innerHTML = ''; 

    if (submissions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-500">No submissions found.</td></tr>`;
        return;
    }

    submissions.forEach(sub => {
        const submittedDate = sub.submittedAt ? sub.submittedAt.toDate() : new Date();
        const formattedSubmittedDate = submittedDate.toLocaleString('si-LK', { timeZone: 'Asia/Colombo' });

        const row = `
            <tr class="data-row">
                <td class="px-6 py-4 whitespace-nowrap reg-number">${sub.regNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800">${sub.taskDate || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formattedSubmittedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap">${sub.status}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button data-url="${sub.screenshotURL}" class="view-screenshot-btn text-indigo-600 hover:text-indigo-900 font-medium">View Screenshot</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

/**
 * Sampurna submissions gana ganan karana aluth function eka
 */
const fetchTotalCount = async () => {
    try {
        const submissionsCol = collection(db, 'submissions');
        const snapshot = await getCountFromServer(submissionsCol);
        totalCountEl.textContent = snapshot.data().count; // Total gana update karanna
    } catch (error) {
        console.error("Error fetching total count:", error);
        totalCountEl.textContent = 'Error';
    }
};

/**
 * Firestore eken data fetch karana function eka
 */
const fetchSubmissions = async (filterDate = null) => {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-500" id="loadingState">Loading submissions...</td></tr>`;
    displayCountEl.textContent = '...';

    try {
        const submissionsCol = collection(db, 'submissions');
        let q;

        if (filterDate) {
            const startOfDay = new Date(filterDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filterDate);
            endOfDay.setHours(23, 59, 59, 999);
            q = query(submissionsCol, where("submittedAt", ">=", Timestamp.fromDate(startOfDay)), where("submittedAt", "<=", Timestamp.fromDate(endOfDay)), orderBy("submittedAt", "desc"));
        } else {
            q = query(submissionsCol, orderBy("submittedAt", "desc"));
        }
        
        const querySnapshot = await getDocs(q);
        allSubmissions = querySnapshot.docs.map(doc => doc.data());
        renderTable(allSubmissions);

    } catch (error) {
        console.error("Error fetching submissions: ", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-red-500">Error loading data. Please try again.</td></tr>`;
    }
};

// Modal Logic (wenasak ne)
tableBody.addEventListener('click', (event) => { if (event.target.classList.contains('view-screenshot-btn')) { modalImage.src = event.target.dataset.url; modal.classList.remove('hidden'); } });
const closeModal = () => { modal.classList.add('hidden'); modalImage.src = ''; };
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) { closeModal(); } });

// Filter Logic
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSubmissions = allSubmissions.filter(sub => 
        sub.regNumber.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredSubmissions); // Search result eka pennanakota, "Currently Displaying" ganath update wei
});

datePicker.addEventListener('change', () => {
    const selectedDateValue = datePicker.value;
    if (selectedDateValue) {
        const [year, month, day] = selectedDateValue.split('-');
        const selectedDate = new Date(year, month - 1, day);
        fetchSubmissions(selectedDate);
    } else {
        fetchSubmissions();
    }
});

// Page eka load weddi functions dekama call karanna
window.addEventListener('DOMContentLoaded', () => {
    fetchSubmissions();
    fetchTotalCount(); // Sampurna gana ganna
});