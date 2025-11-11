const scriptURL = "https://script.google.com/macros/s/AKfycbx0IMc-0G41hv0zRIWTS4vXumb_M3ojuwvklP-LGljc8POJhb9y-CNLTAr0waxIDJmP1g/exec";

// ================================
// 🔗 CONNECT YOUR SCRIPT URL HERE
// ================================
//const scriptURL = "https://script.google.com/macros/s/AKfycbwJg3CX9oeoPl3wkYqZyvslkchKE_b9CcdkY_7ya6XQJH1fGz20jRsdP-PeS2qjPwXJ0Q/exec";

// ================================
// 🔐 ACCESS CONTROL
// ================================
const role = localStorage.getItem("role");
if (role !== "Admin") {
  alert("Access Denied! Admins only.");
  window.location.href = "login.html";
}

// ================================
// 🚪 LOGOUT
// ================================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ================================
// 🧭 SIDEBAR NAVIGATION
// ================================
const sidebarItems = document.querySelectorAll(".sidebar-menu li");
const contentArea = document.getElementById("content-area");
const pageTitle = document.getElementById("page-title");

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    loadSection(item.dataset.section);
  });
});

// ================================
// 🧩 SECTION LOADER
// ================================
async function loadSection(section) {
  switch (section) {
    case "overview":
      pageTitle.innerText = "Dashboard Overview";
      loadDashboardOverview();
      break;

    case "users":
      pageTitle.innerText = "All Registered Users";
      loadUsers();
      break;

    case "ads":
      pageTitle.innerText = "Manage Ads";
      loadAdsForm();
      break;

    case "courses":
      pageTitle.innerText = "Manage Courses";
      loadCoursesForm();
      break;

    case "requests":
      pageTitle.innerText = "Course Requests";
      loadRequests();
      break;

    case "videos":
      pageTitle.innerText = "Manage Videos";
      loadVideosForm();
      break;

    default:
      pageTitle.innerText = "Dashboard Overview";
      loadDashboardOverview();
  }
}

// ================================
// 📊 DASHBOARD OVERVIEW (STATS)
// ================================
async function loadDashboardOverview() {
  contentArea.innerHTML = `
    <div class="overview-cards">
      <div class="card"><h3 id="userCount">0</h3><p>Users</p></div>
      <div class="card"><h3 id="courseCount">0</h3><p>Courses</p></div>
      <div class="card"><h3 id="reqCount">0</h3><p>Requests</p></div>
      <div class="card"><h3 id="adCount">0</h3><p>Ads</p></div>
      <div class="card"><h3 id="videoCount">0</h3><p>Videos</p></div>
    </div>`;

  try {
    const res = await fetch(`${scriptURL}?action=getStats`);
    const data = await res.json();
    document.getElementById("userCount").innerText = data.users;
    document.getElementById("courseCount").innerText = data.courses;
    document.getElementById("reqCount").innerText = data.requests;
    document.getElementById("adCount").innerText = data.ads;
    document.getElementById("videoCount").innerText = data.videos;
  } catch (err) {
    console.error("Error loading overview stats:", err);
  }
}

// ================================
// 👥 LOAD USERS
// ================================
async function loadUsers() {
  contentArea.innerHTML = `<h3>All Registered Users</h3><div id="usersTable">Loading...</div>`;
  try {
    const res = await fetch(`${scriptURL}?action=getUsers`);
    const users = await res.json();

    if (!users || users.length === 0) {
      document.getElementById("usersTable").innerHTML = "<p>No users found.</p>";
      return;
    }

    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>`;
    
    users.forEach(u => {
      tableHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td><span class="status ${u.status.toLowerCase()}">${u.status}</span></td>
          <td>${u.date}</td>
        </tr>`;
    });
    
    tableHTML += "</tbody></table>";
    document.getElementById("usersTable").innerHTML = tableHTML;
  } catch (err) {
    console.error("Error loading users:", err);
    document.getElementById("usersTable").innerHTML = "<p style='color:red;'>Failed to load users.</p>";
  }
}

// ================================
// 📢 ADS MANAGEMENT
// ================================
function loadAdsForm() {
  contentArea.innerHTML = `
    <form id="adForm" class="admin-form">
      <h3>Add New Ad</h3>
      <input type="text" id="adTitle" placeholder="Ad Title" required>
      <input type="text" id="adDesc" placeholder="Ad Description" required>
      <input type="text" id="adImage" placeholder="Image URL (optional)">
      <input type="text" id="adLink" placeholder="Redirect Link (optional)">
      <button class="btn">Add Ad</button>
    </form>`;
  document.getElementById("adForm").addEventListener("submit", addAd);
}

async function addAd(e) {
  e.preventDefault();
  const data = {
    action: "addAd",
    title: document.getElementById("adTitle").value,
    description: document.getElementById("adDesc").value,
    image: document.getElementById("adImage").value,
    link: document.getElementById("adLink").value
  };
  await fetch(scriptURL, { method: "POST", body: new URLSearchParams(data) });
  alert("✅ Ad added successfully!");
  e.target.reset();
}

// ================================
// 🎓 COURSE MANAGEMENT
// ================================
function loadCoursesForm() {
  contentArea.innerHTML = `
    <form id="courseForm" class="admin-form">
      <h3>Add New Course</h3>
      <input type="text" id="courseName" placeholder="Course Name" required>
      <textarea id="courseDesc" placeholder="Description" required></textarea>
      <input type="number" id="coursePrice" placeholder="Price (₹)" required>
      <input type="number" id="courseDuration" placeholder="Duration (Days)" required>
      <button class="btn">Add Course</button>
    </form>`;
  document.getElementById("courseForm").addEventListener("submit", addCourse);
}

async function addCourse(e) {
  e.preventDefault();
  const data = {
    action: "addCourse",
    name: document.getElementById("courseName").value,
    desc: document.getElementById("courseDesc").value,
    price: document.getElementById("coursePrice").value,
    duration: document.getElementById("courseDuration").value
  };
  await fetch(scriptURL, { method: "POST", body: new URLSearchParams(data) });
  alert("✅ Course Added Successfully!");
  e.target.reset();
}

// ================================
// 💳 REQUEST MANAGEMENT
// ================================
async function loadRequests() {
  contentArea.innerHTML = `<h3>Course Requests</h3><div id="requestsTable">Loading...</div>`;
  try {
    const res = await fetch(`${scriptURL}?action=getRequests`);
    const requests = await res.json();

    if (!requests || requests.length === 0) {
      document.getElementById("requestsTable").innerHTML = "<p>No requests yet.</p>";
      return;
    }

    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Course</th><th>Status</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>`;

    requests.forEach(req => {
      tableHTML += `
        <tr>
          <td>${req.id}</td>
          <td>${req.name}</td>
          <td>${req.email}</td>
          <td>${req.course}</td>
          <td>${req.status}</td>
          <td>${req.date}</td>
          <td>
            <button class="btn small" onclick="updateStatus('${req.id}', 'Approved')">✅ Approve</button>
            <button class="btn small" onclick="updateStatus('${req.id}', 'Rejected')">❌ Reject</button>
          </td>
        </tr>`;
    });

    tableHTML += "</tbody></table>";
    document.getElementById("requestsTable").innerHTML = tableHTML;
  } catch (err) {
    console.error("Error loading requests:", err);
    document.getElementById("requestsTable").innerHTML = "<p style='color:red;'>Failed to load requests.</p>";
  }
}

async function updateStatus(id, status) {
  const data = { action: "updateRequestStatus", id, status };
  await fetch(scriptURL, { method: "POST", body: new URLSearchParams(data) });
  alert(`✅ Request ${status}!`);
  loadRequests();
}

// ================================
// 🎥 VIDEO MANAGEMENT
// ================================
function loadVideosForm() {
  contentArea.innerHTML = `
    <form id="videoForm" class="admin-form">
      <h3>Add New Video</h3>
      <input type="text" id="videoCourse" placeholder="Course ID or Name" required>
      <input type="text" id="videoTitle" placeholder="Video Title" required>
      <input type="text" id="videoDesc" placeholder="Video Description" required>
      <input type="text" id="videoLink" placeholder="YouTube or Drive Link" required>
      <button class="btn">Add Video</button>
    </form>`;
  document.getElementById("videoForm").addEventListener("submit", addVideo);
}

async function addVideo(e) {
  e.preventDefault();
  const data = {
    action: "addVideo",
    course: document.getElementById("videoCourse").value,
    title: document.getElementById("videoTitle").value,
    desc: document.getElementById("videoDesc").value,
    link: document.getElementById("videoLink").value
  };
  await fetch(scriptURL, { method: "POST", body: new URLSearchParams(data) });
  alert("✅ Video Added Successfully!");
  e.target.reset();
}

// ================================
// 🚀 DEFAULT LOAD
// ================================
window.addEventListener("DOMContentLoaded", () => loadSection("overview"));
