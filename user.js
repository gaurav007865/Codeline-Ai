const scriptURL = "https://script.google.com/macros/s/AKfycbxgckpORReKcOaHSoftN4HpJTvC9l4_LTOv5WnTuSWKGWLBrUV4wV3aaox6tlJXGyXBQg/exec";
// Replace with your script URL

const userEmail = localStorage.getItem("email");
const userName = userEmail ? userEmail.split("@")[0] : "User";
document.getElementById("userName").innerText = userName;

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Load Dashboard Stats
async function loadStats() {
  const res = await fetch(`${scriptURL}?action=getUserStats&email=${userEmail}`);
  const stats = await res.json();
  document.getElementById("totalCourses").innerText = stats.totalCourses;
  document.getElementById("purchasedCourses").innerText = stats.purchasedCourses;
  document.getElementById("pendingRequests").innerText = stats.pendingRequests;
}

// Load Courses
async function loadCourses() {
  const container = document.getElementById("courseContainer");
  container.innerHTML = "Loading...";
  const res = await fetch(`${scriptURL}?action=getCourses`);
  const data = await res.json();

  container.innerHTML = data.map(c => `
    <div class="course-card">
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <p><strong>Duration:</strong> ${c.duration} Days</p>
      <button class="btn" onclick="requestCourse('${c.name}')">Request Course</button>
    </div>
  `).join("");
}

function requestCourse(course) {
  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "addCourseRequest",
      name: userName,
      email: userEmail,
      course
    })
  }).then(() => {
    alert("✅ Request sent successfully!");
    loadRequests();
  });
}

// Load Requests
async function loadRequests() {
  const res = await fetch(`${scriptURL}?action=getUserRequests&email=${userEmail}`);
  const data = await res.json();
  const div = document.getElementById("requestTable");
  div.innerHTML = `
    <table>
      <tr><th>Course</th><th>Status</th><th>Date</th></tr>
      ${data.map(r => `
        <tr>
          <td>${r.course}</td>
          <td>${r.status}</td>
          <td>${r.date}</td>
        </tr>`).join("")}
    </table>`;
}

// Purchased Courses
async function loadPurchased() {
  const res = await fetch(`${scriptURL}?action=getPurchasedCourses&email=${userEmail}`);
  const data = await res.json();
  const div = document.getElementById("purchasedContainer");
  div.innerHTML = data.length === 0 ? "No purchased courses yet." :
  data.map(c => `
    <div class="course-card">
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <button class="btn small" onclick="completeCourse('${c.name}')">Mark Completed</button>
    </div>`).join("");
}

function completeCourse(course) {
  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "markCourseComplete",
      email: userEmail,
      course
    })
  }).then(() => {
    alert(`🎉 ${course} marked as completed! Certificate will be emailed.`);
    fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "generateCertificate",
        email: userEmail,
        name: userName,
        course
      })
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadCourses();
  loadRequests();
  loadPurchased();
});
