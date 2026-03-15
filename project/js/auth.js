// AUTH MODULE

import {
db,
ref,
set,
get,
child
} from "../firebase/firebase-config.js";



// ----------- GET USERS FROM FIREBASE -----------

window.getUsers = async function(){

try{

const dbRef = ref(db);

const snapshot = await get(child(dbRef,"users"));

if(snapshot.exists()){

return Object.values(snapshot.val());

}

return [];

}catch(error){

console.error("Error getting users:",error);

return [];

}

};



// ----------- SAVE USERS -----------

window.saveUsers = async function(users){

try{

let usersObj={};

users.forEach(u=>{

usersObj[u.username]=u;

});

await set(ref(db,"users"),usersObj);

}catch(error){

console.error("Error saving users:",error);

}

};



// ----------- LOGIN -----------

window.login = async function(){

if(!window.db){

Swal.fire("Error","Firebase not initialized yet. Please refresh.","error");

return;

}

let username=document.getElementById("loginUser").value.trim();

let password=document.getElementById("loginPass").value.trim();

try{

const snapshot=await get(ref(db,"users"));

if(!snapshot.exists()){

Swal.fire("Error","No users found in database","error");

return;

}

let users=snapshot.val();

let foundUser=null;

Object.values(users).forEach(user=>{

if(user.username===username && user.password===password){

foundUser=user;

}

});

if(!foundUser){

Swal.fire("Login Failed","Invalid username or password","error");

return;

}

if(foundUser.status!=="Active"){

Swal.fire("Access Denied","User inactive","error");

return;

}



// SAVE SESSION

localStorage.setItem("loginUser",JSON.stringify(foundUser));



// SHOW DASHBOARD

document.getElementById("loginPage").style.display="none";

document.getElementById("dashboard").style.display="block";

document.getElementById("displayUser").innerHTML=
`${foundUser.username} (${foundUser.role})`;



// UPDATE ACCESS

applyRoleAccess();



// LOAD DASHBOARD

home();



// START NOTIFICATIONS

listenNotifications();

}catch(error){

console.error(error);

Swal.fire("Error",error.message,"error");

}

};



// ----------- LOGOUT -----------

window.logout=function(){

localStorage.removeItem("loginUser");

document.getElementById("loginPage").style.display="block";

document.getElementById("dashboard").style.display="none";

};



// ----------- CHANGE PASSWORD -----------

window.changePassword = async function(){

let loggedUser = JSON.parse(localStorage.getItem("loginUser") || "{}");

if(!loggedUser.username) return;

const { value:newPassword } = await Swal.fire({

title:"Change Password",

input:"password",

inputLabel:"New Password",

inputPlaceholder:"Enter new password",

showCancelButton:true

});

if(newPassword){

let users = await getUsers();

let user = users.find(u=>u.username===loggedUser.username);

if(user){

user.password=newPassword;

user.pwdDate=new Date().toISOString();

await saveUsers(users);

localStorage.setItem("loginUser",JSON.stringify(user));

Swal.fire("Success","Password changed successfully","success");

}

}

};
