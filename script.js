// ---------------------- IMPORT FIREBASE MODULES ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------------- FIREBASE CONFIG ----------------------
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------- SCREEN UTILITY ----------------------
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// ---------------------- LOGIN / SIGNUP ----------------------
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = "collector"; // default role, admin created manually in Firestore
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Add user to Firestore
    await addDoc(collection(db, "users"), {
      name: email.split("@")[0],
      email,
      role,
      createdAt: new Date()
    });

    alert("Account created successfully!");
  } catch (err) {
    alert(err.message);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
}

// ---------------------- AUTH STATE ----------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
    const userData = userSnap.docs[0].data();

    if (userData.role === "admin") {
      loadAdminDashboard();
      showScreen("adminScreen");
    } else {
      loadCollectorDashboard();
      showScreen("dashboard");
    }
  } else {
    showScreen("loginScreen");
  }
});

// ---------------------- COLLECTOR DASHBOARD ----------------------
async function loadCollectorDashboard() {
  const user = auth.currentUser;
  const customersSnap = await getDocs(query(collection(db, "customers"), where("userId", "==", user.uid)));

  let totalSavings = 0;
  let totalLoans = 0;
  document.getElementById("totalCustomers").textContent = customersSnap.size;

  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = `
    <h3>Dashboard</h3>
    <p>Total Customers: ${customersSnap.size}</p>
    <p>Total Savings: ₵<span id="totalSavings"></span></p>
    <p>Total Loans: ₵<span id="totalLoans"></span></p>
    <button onclick="viewDailyLogs()">📅 View Daily Logs</button>
  `;

  customersSnap.forEach(docItem => {
    const data = docItem.data();
    totalSavings += data.balance || 0;
    totalLoans += data.totalLoan || 0;
  });

  document.getElementById("totalSavings").textContent = totalSavings;
  document.getElementById("totalLoans").textContent = totalLoans;
}

// ---------------------- ADD CUSTOMER ----------------------
async function addCustomer() {
  const name = document.getElementById("customerName").value;
  if (!name) return alert("Enter customer name");

  const user = auth.currentUser;
  await addDoc(collection(db, "customers"), {
    name,
    userId: user.uid,
    balance: 0,
    totalPaid: 0,
    totalLoan: 0,
    createdAt: new Date()
  });

  alert("Customer added!");
  loadCollectorDashboard();
}

// ---------------------- ADD PAYMENT ----------------------
async function addPayment() {
  const name = document.getElementById("payName").value;
  const amount = parseFloat(document.getElementById("payAmount").value);
  if (!name || !amount) return alert("Enter valid data");

  const user = auth.currentUser;
  const customersSnap = await getDocs(query(collection(db, "customers"), where("userId", "==", user.uid)));

  let customerFound = false;
  for (let docItem of customersSnap.docs) {
    const data = docItem.data();
    if (data.name === name) {
      customerFound = true;
      await updateDoc(doc(db, "customers", docItem.id), {
        balance: (data.balance || 0) + amount,
        totalPaid: (data.totalPaid || 0) + amount
      });

      // Add transaction
      await addDoc(collection(db, "transactions"), {
        customerId: docItem.id,
        userId: user.uid,
        type: "payment",
        amount,
        date: new Date()
      });
      alert("Payment recorded!");
      break;
    }
  }
  if (!customerFound) alert("Customer not found");

  loadCollectorDashboard();
}

// ---------------------- GIVE LOAN ----------------------
async function giveLoan() {
  const name = document.getElementById("loanName").value;
  const principal = parseFloat(document.getElementById("loanAmount").value);
  const interest = parseFloat(document.getElementById("interest").value);

  if (!name || !principal || !interest) return alert("Enter valid data");

  const user = auth.currentUser;
  const customersSnap = await getDocs(query(collection(db, "customers"), where("userId", "==", user.uid)));

  let customerFound = false;
  for (let docItem of customersSnap.docs) {
    const data = docItem.data();
    if (data.name === name) {
      customerFound = true;
      const totalPayable = principal + (principal * interest / 100);

      await updateDoc(doc(db, "customers", docItem.id), {
        totalLoan: (data.totalLoan || 0) + totalPayable
      });

      await addDoc(collection(db, "loans"), {
        customerId: docItem.id,
        userId: user.uid,
        principal,
        interest,
        totalPayable,
        amountPaid: 0,
        status: "active",
        createdAt: new Date()
      });

      alert("Loan granted!");
      break;
    }
  }
  if (!customerFound) alert("Customer not found");

  loadCollectorDashboard();
}

// ---------------------- DAILY LOGS ----------------------
async function viewDailyLogs() {
  showScreen("dailyLogsScreen");
  const logsList = document.getElementById("dailyLogsList");
  logsList.innerHTML = "";

  const user = auth.currentUser;
  const logsSnap = await getDocs(query(collection(db, "daily_logs"), where("userId", "==", user.uid)));

  logsSnap.forEach(docItem => {
    const log = docItem.data();
    const li = document.createElement("li");
    li.textContent = `Customer ID: ${log.customerId} | Date: ${log.date} | Paid: ${log.paid} | Amount: ₵${log.amount}`;
    logsList.appendChild(li);
  });
}

// ---------------------- ADMIN DASHBOARD ----------------------
async function loadAdminDashboard() {
  const usersSnap = await getDocs(collection(db, "users"));
  const customersSnap = await getDocs(collection(db, "customers"));
  const transactionsSnap = await getDocs(collection(db, "transactions"));

  let totalMoney = 0;
  transactionsSnap.forEach(docItem => {
    if (docItem.data().type === "payment") totalMoney += docItem.data().amount;
  });

  document.getElementById("totalUsers").textContent = usersSnap.size;
  document.getElementById("adminCustomers").textContent = customersSnap.size;
  document.getElementById("adminMoney").textContent = totalMoney;
}

// ---------------------- VIEW MONTHLY REPORTS ----------------------
async function viewReports() {
  showScreen("reportsScreen");
  const reportsList = document.getElementById("reportsList");
  reportsList.innerHTML = "";

  const reportsSnap = await getDocs(collection(db, "reports"));
  reportsSnap.forEach(docItem => {
    const report = docItem.data();
    const li = document.createElement("li");
    li.textContent = `Collector ID: ${report.userId} | Collected: ₵${report.totalCollected} | Loans: ₵${report.totalLoans} | Period: ${report.dateRange.start} to ${report.dateRange.end}`;
    reportsList.appendChild(li);
  });
}

// ---------------------- EXPORT FUNCTIONS ----------------------
window.showScreen = showScreen;
window.addCustomer = addCustomer;
window.addPayment = addPayment;
window.giveLoan = giveLoan;
window.viewDailyLogs = viewDailyLogs;
window.viewReports = viewReports;
window.login = login;
window.signUp = signUp;