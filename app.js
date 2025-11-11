const scriptURL = "https://script.google.com/macros/s/AKfycbx_tdZxPiF5PZhPUUmtloTdsgEUO425yd-LyxOvrwwCetsZqFIgYeNaQv82RBZo5PZaBQ/exec"; // paste your web app URL here

// === REGISTER ===
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    action: "register",
  };

  await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(data),
  });

  alert("Registration successful!");
  window.location.href = "login.html";
});

// === LOGIN ===
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
    action: "login",
  };

  const res = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(data),
  });

  const role = await res.text();

  if (role === "Admin") {
    alert("Welcome Admin!");
    localStorage.setItem("role", "Admin");
    localStorage.setItem("loggedIn", "true");
    window.location.href = "admin-dashboard.html";
  } 
  else if (role === "User") {
    alert("Login successful!");
    localStorage.setItem("role", "User");
    localStorage.setItem("loggedIn", "true");
    window.location.href = "courses.html";
  } 
  else {
    alert("Invalid credentials. Try again!");
  }
});

// === LOAD ADS ON HOMEPAGE ===
async function loadAds() {
  const adsContainer = document.getElementById("ads-container");
  if (!adsContainer) return;

  try {
    const res = await fetch(`${scriptURL}?action=getAds`);
    const ads = await res.json();

    if (ads.length === 0) {
      adsContainer.innerHTML = `<p>No sponsored ads right now.</p>`;
      return;
    }

    adsContainer.innerHTML = ads
      .map(
        (ad) => `
        <div class="ad-card">
          <img src="${ad.image || 'https://via.placeholder.com/250x150'}" alt="Ad Image" style="width:100%; border-radius:10px;">
          <h3>${ad.title}</h3>
          <p>${ad.desc}</p>
          <a href="${ad.link}" target="_blank" class="btn">View More</a>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading ads:", err);
    adsContainer.innerHTML = `<p>Failed to load ads.</p>`;
  }
}

// Call when homepage loads
window.addEventListener("DOMContentLoaded", loadAds);


// === GOOGLE SCRIPT BACKEND URL ===
//const scriptURL = "https://script.google.com/macros/s/AKfycbw0-GOMDAvEiyOZ9zvkjS7bDDgtG-W5OSkV3dljUZ5cTVRka3TpEjR1cTZkCGXsjHaKWg/exec";

// === LOAD COURSES FROM SHEET ===
async function loadCourses() {
  const container = document.getElementById("courseContainer");
  if (!container) return;

  container.innerHTML = "<p>Loading courses...</p>";

  try {
    const res = await fetch(`${scriptURL}?action=getCourses`);
    const courses = await res.json();

    if (!courses || courses.length === 0) {
      container.innerHTML = "<p>No courses available right now.</p>";
      return;
    }

    container.innerHTML = courses
      .map(course => `
        <div class="course-card">
          <h3>${course.name}</h3>
          <p>${course.desc}</p>
          <p><strong>Price:</strong> ₹${course.price}</p>
          <p><strong>Duration:</strong> ${course.duration} Days</p>
          <button class="btn" onclick="buyCourse('${course.name}')">Buy Now</button>
        </div>
      `)
      .join("");
  } catch (err) {
    console.error("Error loading courses:", err);
    container.innerHTML = "<p>Failed to load courses.</p>";
  }
}

// === BUY COURSE ===
function buyCourse(selectedCourse) {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  if (!userName || !userEmail) {
    alert("⚠️ Please login first to buy a course!");
    window.location.href = "login.html";
    return;
  }

  const confirmBuy = confirm(`Do you want to request this course: ${selectedCourse}?`);
  if (!confirmBuy) return;

  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "addCourseRequest",
      name: userName,
      email: userEmail,
      course: selectedCourse
    }),
  })
    .then(res => res.text())
    .then(data => {
      if (data === "success") {
        alert("✅ Your course request has been sent successfully!");
      } else {
        alert("❌ Something went wrong. Try again later.");
      }
    })
    .catch(err => {
      console.error("Error sending request:", err);
      alert("⚠️ Network error! Please try again later.");
    });
}

// === CALL ON PAGE LOAD ===
window.addEventListener("DOMContentLoaded", loadCourses);
