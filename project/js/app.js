// MAIN APP CONTROLLER

import {
db,
ref,
set,
get,
child,
update,
remove,
onValue
} from "../firebase/firebase-config.js";


// IMPORT MODULES
import "./auth.js";
import "./users.js";
import "./tasks.js";
import "./excel.js";
import "./datatable.js";
import "./notifications.js";


// GLOBALS
window.db = db;
window.ref = ref;
window.set = set;
window.get = get;
window.child = child;
window.update = update;
window.remove = remove;
window.onValue = onValue;

window.contentArea = document.getElementById("contentArea");


// SESSION SETTINGS
const AUTO_LOGOUT_MINUTES = 15;
const PASSWORD_EXPIRY_DAYS = 30;

let timer;


// GET LOGGED USER
window.getLoggedUser = function(){

return JSON.parse(localStorage.getItem("loginUser") || "{}");

};


// CHECK ADMIN
window.isAdmin = function(){

let user = getLoggedUser();

return user.role === "Admin";

};


// AUTO LOGOUT TIMER

function resetTimer(){

clearTimeout(timer);

timer = setTimeout(() => {

Swal.fire("Session Timeout","Auto logout","info");

logout();

}, AUTO_LOGOUT_MINUTES * 60000);

}


// ACTIVITY LISTENERS
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);


// DASHBOARD HOME
window.home = function(){

contentArea.innerHTML = `

<div class="card mb-3">

<div class="card-body">

<h2>Dashboard</h2>

<p>Welcome to the Admin Dashboard</p>

</div>

</div>

`;

};


// OPEN EXTERNAL WEBSITE
window.openWebInteraction = function(url){

window.open(url,"_blank");

};


// ROLE ACCESS CONTROL
window.applyRoleAccess = function(){

let role = getLoggedUser().role;

document.querySelectorAll("[data-role]").forEach(btn => {

let roles = btn.getAttribute("data-role").split(",");

if(!roles.includes(role)){

btn.style.display="none";

}

});

};


// AUTO ROLE WATCHER
(function(){

const checkRoles = () => {

const role = getLoggedUser().role;

document.querySelectorAll("[data-role]").forEach(btn => {

const roles = btn.getAttribute("data-role").split(",").map(r=>r.trim());

btn.style.display = roles.includes(role) ? "inline-block" : "none";

});

};

checkRoles();

const observer = new MutationObserver(checkRoles);

observer.observe(document.body,{childList:true,subtree:true});

})();


// AUTO LOGIN ON PAGE LOAD

window.onload = () => {

let user = JSON.parse(localStorage.getItem("loginUser"));

if(user && user.username){

document.getElementById("loginPage").style.display="none";
document.getElementById("dashboard").style.display="block";

document.getElementById("displayUser").innerHTML =
`${user.username} (${user.role})`;

resetTimer();

home();

listenNotifications();

}
else{

document.getElementById("loginPage").style.display="block";
document.getElementById("dashboard").style.display="none";

}

};
