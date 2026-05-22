import { db, ref, set, get, child, update, remove, onValue } from "./firebase.js";

/* ================= STATE ================= */
const state = {
  user: JSON.parse(localStorage.getItem("loginUser") || "{}"),
  taskTable: null
};

window.state = state; // temporary bridge

/* ================= AUTH ================= */

export async function login() {
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  const snapshot = await get(ref(db, "users"));

  if (!snapshot.exists()) return alert("No users");

  const users = Object.values(snapshot.val());

  const found = users.find(u =>
    u.username === username && u.password === password
  );

  if (!found) return alert("Invalid login");

  localStorage.setItem("loginUser", JSON.stringify(found));
  state.user = found;

  window.ui.showDashboard(found);
}

export function logout() {
  localStorage.removeItem("loginUser");
  window.ui.showLogin();
}

/* ================= USERS ================= */

export async function getUsers() {
  const snap = await get(ref(db, "users"));
  return snap.exists() ? Object.values(snap.val()) : [];
}

export async function saveUsers(users) {
  const obj = {};
  users.forEach(u => obj[u.username] = u);
  await set(ref(db, "users"), obj);
}

/* ================= TASKS ================= */

export async function addTask(task) {
  const id = Date.now();
  await set(ref(db, "tasks/" + id), { id, ...task });
}

export async function getTasks() {
  const snap = await get(ref(db, "tasks"));
  return snap.exists() ? Object.values(snap.val()) : [];
}
