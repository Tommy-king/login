import { login, logout, getUsers, saveUsers, getTasks, addTask } from "./app.js";

window.ui = {};

/* ================= LOGIN ================= */

window.ui.showLogin = function () {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
};

window.ui.showDashboard = function (user) {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  document.getElementById("displayUser").innerText =
    `${user.username} (${user.role})`;

  window.ui.home();
};

/* ================= DASHBOARD ================= */

window.ui.home = function () {
  document.getElementById("contentArea").innerHTML = `
    <div class="card"><h2>Dashboard</h2></div>
  `;
};
