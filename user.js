const scriptURL = "https://script.google.com/macros/s/AKfycbwkEUG9zs731jYlx1YuN4JTHvXjlJ0fTPpQkIPhhaz48Cs9OLDz9W6h4TSt9gh9mia4Cg/exec";
// =========================================================
// 🌐 GOOGLE SCRIPT URL
// =========================================================


// =========================================================
// 🔐 USER LOGIN CHECK
// =========================================================
const userEmail = localStorage.getItem("email");
const userName = localStorage.getItem("realUserName") || localStorage.getItem("name");

if (!userEmail) {
  alert("⚠️ Please login first!");
  window.location.href = "login.html";
}

document.getElementById("userName").textContent = userName;


// =========================================================
// 🔄 LOAD ALL SECTIONS WHEN PAGE OPENS
// =========================================================
window.addEventListener("DOMContentLoaded", () => {
  loadAvailableCourses();
  loadUserRequests();
  loadPurchasedCourses();
  loadCertificates();
});


// =========================================================
// 📘 LOAD AVAILABLE COURSES
// =========================================================
async function loadAvailableCourses() {
  const box1 = document.getElementById("availableCourses");
  const box2 = document.getElementById("allCourses");

  box1.innerHTML = "Loading...";
  box2.innerHTML = "Loading...";

  try {
    const allRes = await fetch(`${scriptURL}?action=getCourses`);
    const allCourses = await allRes.json();

    const purRes = await fetch(`${scriptURL}?action=getPurchasedCourses&email=${userEmail}`);
    const purchased = await purRes.json();

    const purchasedNames = purchased.map(p => p.name);

    const available = allCourses.filter(c => !purchasedNames.includes(c.name));

    if (!available.length) {
      box1.innerHTML = "<p>No new courses available.</p>";
      box2.innerHTML = "<p>No new courses available.</p>";
      return;
    }

    const html = available.map(c => `
      <div class="card">
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
        <p><b>Price:</b> ₹${c.price}</p>
        <button class="btn small" onclick="requestCourse('${c.name}')">Enroll</button>
      </div>
    `).join("");

    box1.innerHTML = html;
    box2.innerHTML = html;

  } catch (err) {
    console.error("Available Courses Error:", err);
  }
}


// =========================================================
// 🧾 LOAD USER REQUESTS
// =========================================================
async function loadUserRequests() {
  const box = document.getElementById("myRequests");
  const table = document.getElementById("requestTable");

  try {
    const res = await fetch(`${scriptURL}?action=getUserRequests&email=${userEmail}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Invalid request response", data);
      return;
    }

    if (data.length === 0) {
      box.innerHTML = "<p>No requests yet.</p>";
      table.innerHTML = "<tr><td colspan='3'>No requests found.</td></tr>";
      return;
    }

    // Dashboard cards
    box.innerHTML = data.map(r => `
      <div class="card">
        <h4>${r.course}</h4>
        <p>Status: <span class="status ${r.status.toLowerCase()}">${r.status}</span></p>
        <p><small>${new Date(r.date).toLocaleDateString()}</small></p>
      </div>
    `).join("");

    // Full requests table
    table.innerHTML = data.map(r => `
      <tr>
        <td>${r.course}</td>
        <td><span class="status ${r.status.toLowerCase()}">${r.status}</span></td>
        <td>${new Date(r.date).toLocaleDateString()}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Requests Error:", err);
  }
}


// =========================================================
// 🎓 LOAD PURCHASED COURSES
// =========================================================
async function loadPurchasedCourses() {
  const box = document.getElementById("certList");

  try {
    const res = await fetch(`${scriptURL}?action=getPurchasedCourses&email=${userEmail}`);
    const data = await res.json();

    if (!data.length) {
      box.innerHTML = "<p>No purchased courses.</p>";
      return;
    }

    box.innerHTML = data.map(c => `
      <div class="card">
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
        <button class="btn small" onclick="requestCertificate('${c.name}')">Request Certificate</button>
      </div>
    `).join("");

  } catch (err) {
    console.error("Purchased Courses Error:", err);
  }
}


// =========================================================
// 🏅 LOAD CERTIFICATES (FINAL UPDATED)
// =========================================================
async function loadCertificates() {
  const box = document.getElementById("certificateSection");

  try {
    const res = await fetch(`${scriptURL}?action=getCertificates&email=${userEmail}`);
    const data = await res.json();

    if (!data.length) {
      box.innerHTML = "<p>No certificates yet.</p>";
      return;
    }

    box.innerHTML = data.map(c => `
      <div class="card">
        <h4>${c.course}</h4>
        <p>Status: <span class="status ${c.status.toLowerCase()}">${c.status}</span></p>

        ${
          // 1️⃣ IF APPROVED → Show open certificate button
          c.status === "Approved"
          ? `<button class="btn small" onclick="openCertificate('${c.course}')">Open Certificate</button>`

          // 2️⃣ IF REJECTED → Show red rejected message
          : c.status === "Rejected"
          ? `<p class="danger-text">Request Rejected</p>`

          // 3️⃣ IF REQUESTED → Show request certificate button
          : `<button class="btn small" onclick="requestCertificate('${c.course}')">Request Certificate</button>`
        }
      </div>
    `).join("");

  } catch (err) {
    console.error("Certificates Error:", err);
  }
}


// =========================================================
// 📄 OPEN CERTIFICATE PAGE
// =========================================================
async function openCertificate(courseName) {

  // Check certificate status from backend
  const res = await fetch(`${scriptURL}?action=getCertificates&email=${userEmail}`);
  const data = await res.json();

  const cert = data.find(c => c.course === courseName);

  if (!cert) {
    alert("No certificate request found!");
    return;
  }

  if (cert.status !== "Approved") {
    alert("Certificate not approved yet!");
    return;
  }

  // Save course and proceed to certificate page
  localStorage.setItem("certificateCourse", courseName);
  window.location.href = "certificate.html";
}


// =========================================================
// 📨 SEND COURSE REQUEST
// =========================================================
async function requestCourse(courseName) {
  if (!confirm(`Enroll in ${courseName}?`)) return;

  const res = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "addCourseRequest",
      name: userName,
      email: userEmail,
      course: courseName
    })
  });

  const data = await res.json();

  if (data.status === "success") {
    alert("✔ Course request sent!");
    loadUserRequests();
    loadAvailableCourses();
  }
}


// =========================================================
// 🎓 REQUEST CERTIFICATE
// =========================================================
async function requestCertificate(courseName) {
  if (!confirm(`Request certificate for ${courseName}?`)) return;

  const res = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "requestCertificate",
      email: userEmail,
      course: courseName
    })
  });

  const data = await res.json();

  if (data.status === "success") {
    alert("📩 Certificate request sent!");
    loadCertificates();
  }
}


// =========================================================
// 🚪 LOGOUT
// =========================================================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// =========================================================
// 🧭 SECTION SWITCHING
// =========================================================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden-section"));
  document.getElementById(id).classList.remove("hidden-section");

  document.querySelectorAll(".user-sidebar li").forEach(li => li.classList.remove("active"));
  const match = [...document.querySelectorAll(".user-sidebar li")].find(li =>
    li.textContent.includes(id.charAt(0).toUpperCase() + id.slice(1))
  );
  if (match) match.classList.add("active");
}
