import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, Timestamp, getCountFromServer, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6wfcw2AB2ATdG29MKdON2Wb1R2UH7Uuc",
    authDomain: "taskdone-aca18.firebaseapp.com",
    projectId: "taskdone-aca18",
    storageBucket: "taskdone-aca18.appspot.com",
    messagingSenderId: "1035778561207",
    appId: "1:1035778561207:web:041497e4e0095e292c6932",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tableBody = document.getElementById('submissionsTableBody');
const searchInput = document.getElementById('searchInput');
const datePicker = document.getElementById('datePicker');
const modal = document.getElementById('screenshotModal');
const modalImage = document.getElementById('modalImage');
const closeModalBtn = document.getElementById('closeModalBtn');
const totalCountEl = document.getElementById('totalCount');
const displayCountEl = document.getElementById('displayCount');

let allSubmissions = [];

const renderTable = (submissions) => {
    displayCountEl.textContent = submissions.length;
    tableBody.innerHTML = ''; 

    if (submissions.length === 0) { 
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-gray-500">No submissions found.</td></tr>`;
        return;
    }

    submissions.forEach(sub => {
        const submittedDate = sub.submittedAt ? sub.submittedAt.toDate() : new Date();
        const formattedSubmittedDate = submittedDate.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        const row = `
            <tr class="data-row">
                <td class="px-6 py-4 whitespace-nowrap reg-number">${sub.regNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap">${sub.phoneNumber || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${sub.district || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800">${sub.taskDate || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formattedSubmittedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button data-url="${sub.screenshotURL}" class="view-screenshot-btn text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button data-id="${sub.id}" class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

const fetchTotalCount = async () => {
    try {
        const submissionsCol = collection(db, 'submissions');
        const snapshot = await getCountFromServer(submissionsCol);
        totalCountEl.textContent = snapshot.data().count;
    } catch (error) {
        console.error("Error fetching total count:", error);
        totalCountEl.textContent = 'Error';
    }
};

const fetchSubmissions = async (filterDate = null) => {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-gray-500">Loading submissions...</td></tr>`;
    displayCountEl.textContent = '...';

    try {
        const submissionsCol = collection(db, 'submissions');
        let q;

        if (filterDate) {
            const startOfDay = new Date(filterDate); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filterDate); endOfDay.setHours(23, 59, 59, 999);
            q = query(submissionsCol, where("submittedAt", ">=", Timestamp.fromDate(startOfDay)), where("submittedAt", "<=", Timestamp.fromDate(endOfDay)), orderBy("submittedAt", "desc"));
        } else {
            q = query(submissionsCol, orderBy("submittedAt", "desc"));
        }
        
        const querySnapshot = await getDocs(q);
        allSubmissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTable(allSubmissions);
    } catch (error) {
        console.error("Error fetching submissions: ", error);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-red-500">Error loading data.</td></tr>`;
    }
};

const closeModal = () => { modal.classList.add('hidden'); modalImage.src = ''; };

tableBody.addEventListener('click', async (event) => {
    if (event.target.classList.contains('view-screenshot-btn')) {
        modalImage.src = event.target.dataset.url;
        modal.classList.remove('hidden');
    }

    if (event.target.classList.contains('delete-btn')) {
        const docId = event.target.dataset.id;
        const isConfirmed = confirm('Are you sure you want to delete this submission?');
        
        if (isConfirmed) {
            try {
                await deleteDoc(doc(db, 'submissions', docId));
                event.target.closest('tr').remove();
                
                totalCountEl.textContent = parseInt(totalCountEl.textContent) - 1;
                displayCountEl.textContent = parseInt(displayCountEl.textContent) - 1;

                allSubmissions = allSubmissions.filter(sub => sub.id !== docId);
                alert('Submission deleted successfully!');
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert('Failed to delete submission.');
            }
        }
    }
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) { closeModal(); } });

searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSubmissions = allSubmissions.filter(sub => 
        sub.regNumber.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredSubmissions);
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

window.addEventListener('DOMContentLoaded', () => {
    fetchSubmissions();
    fetchTotalCount();
});