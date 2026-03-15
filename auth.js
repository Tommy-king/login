async function login(){

let username = document.getElementById("loginUser").value;

let password = document.getElementById("loginPass").value;

const snapshot = await get(ref(db,"users"));

let users = snapshot.val();

let found = Object.values(users).find(
u => u.username===username && u.password===password
);

if(!found){

Swal.fire("Login Failed");

return;

}

localStorage.setItem("loginUser",JSON.stringify(found));

document.getElementById("loginPage").style.display="none";

document.getElementById("dashboard").style.display="block";

document.getElementById("displayUser").innerHTML =
found.username+" ("+found.role+")";

}
