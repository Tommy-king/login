// USER MANAGEMENT MODULE

import {
db,
ref,
set,
get,
update,
remove
} from "../firebase/firebase-config.js";



// ---------------- CREATE USER PAGE ----------------

window.createUserPage = function(){

if(!isAdmin()){

Swal.fire("Access Denied","Admin only feature","error");

return;

}

contentArea.innerHTML = `

<div class="card mb-3">

<div class="card-body">

<h2>Create User</h2>

<input id="newUsername" placeholder="Username"><br>

<input id="newUserID" placeholder="User ID"><br>

<input id="newDepartment" placeholder="Department"><br>

<input id="newPassword" type="password" placeholder="Password"><br>

<select id="newRole">

<option value="Admin">Admin</option>

<option value="User">User</option>

</select><br>

<select id="newStatus">

<option value="Active">Active</option>

<option value="Inactive">Inactive</option>

</select><br>

<button class="create-btn" onclick="createUser()">Create</button>

</div>

</div>

`;

};



// ---------------- CREATE USER ----------------

window.createUser = async function(){

let user = getLoggedUser();

if(user.role!=="Admin"){

Swal.fire("Access Denied","Admin only feature","error");

return;

}

let username=document.getElementById("newUsername").value.trim();

let userID=document.getElementById("newUserID").value.trim();

let dept=document.getElementById("newDepartment").value.trim();

let password=document.getElementById("newPassword").value.trim();

let role=document.getElementById("newRole").value;

let status=document.getElementById("newStatus").value;

if(!username || !userID || !dept || !password){

Swal.fire("Error","All fields are required","error");

return;

}

let users=await getUsers();

if(users.find(u=>u.username===username || u.userID===userID)){

Swal.fire("Error","Username or User ID already exists","error");

return;

}

users.push({

username,
userID,
department:dept,
password,
role,
status,
pwdDate:new Date().toISOString()

});

await saveUsers(users);

Swal.fire("Success","User created successfully","success");

createUserPage();

};



// ---------------- VIEW USERS ----------------

window.viewUsers = async function(){

let user=getLoggedUser();

if(user.role!=="Admin"){

Swal.fire("Access Denied","Admin only feature","error");

return;

}

let users=await getUsers();

let rows=users.map(u=>`

<tr>

<td>${u.username}</td>

<td>${u.userID}</td>

<td>${u.department}</td>

<td>${u.role}</td>

<td>${u.status}</td>

<td>

<span class="action" onclick="editUser('${u.username}')">

<i class="fa fa-edit"></i>

</span>

<span class="action" onclick="deleteUser('${u.username}')">

<i class="fa fa-trash"></i>

</span>

<span class="action" onclick="changeUserPassword('${u.username}')">

<i class="fa fa-key"></i>

</span>

</td>

</tr>

`).join("");

contentArea.innerHTML=`

<div class="card">

<div class="card-body">

<h2>User Management</h2>

<table id="userTable" class="table table-bordered table-striped w-100">

<thead class="table-dark">

<tr>

<th>Username</th>

<th>User ID</th>

<th>Department</th>

<th>Role</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</div>

</div>

`;

setTimeout(()=>{

$("#userTable").DataTable({

pageLength:10,

orderCellsTop:true,

lengthMenu:[[10,50,100,-1],[10,50,100,"All"]],

scrollY:"400px",

scrollCollapse:true,

paging:true,

fixedHeader:true

});

},200);

};



// ---------------- EDIT USER ----------------

window.editUser = async function(username){

let users=await getUsers();

let user=users.find(u=>u.username===username);

if(!user) return;

const { value } = await Swal.fire({

title:`Edit User: ${username}`,

html:`

<input id="editDepartment" value="${user.department}" class="swal2-input">

<select id="editRole" class="swal2-input">

<option value="Admin" ${user.role==="Admin"?"selected":""}>Admin</option>

<option value="User" ${user.role==="User"?"selected":""}>User</option>

</select>

<select id="editStatus" class="swal2-input">

<option value="Active" ${user.status==="Active"?"selected":""}>Active</option>

<option value="Inactive" ${user.status==="Inactive"?"selected":""}>Inactive</option>

</select>

`,

showCancelButton:true,

preConfirm:()=>({

department:document.getElementById("editDepartment").value,

role:document.getElementById("editRole").value,

status:document.getElementById("editStatus").value

})

});

if(value){

user.department=value.department;

user.role=value.role;

user.status=value.status;

await saveUsers(users);

Swal.fire("Success","User updated","success");

viewUsers();

}

};



// ---------------- DELETE USER ----------------

window.deleteUser = async function(username){

const result=await Swal.fire({

title:`Delete user ${username}?`,

icon:'warning',

showCancelButton:true,

confirmButtonText:'Yes, delete'

});

if(result.isConfirmed){

let users=await getUsers();

users=users.filter(u=>u.username!==username);

await saveUsers(users);

Swal.fire("Deleted!","User deleted","success");

viewUsers();

}

};



// ---------------- CHANGE USER PASSWORD ----------------

window.changeUserPassword = async function(username){

let users=await getUsers();

let user=users.find(u=>u.username===username);

if(!user) return;

const { value:newPassword } = await Swal.fire({

title:`Change Password for ${username}`,

input:"password",

inputLabel:"New Password",

inputPlaceholder:"Enter new password",

showCancelButton:true

});

if(newPassword){

user.password=newPassword;

user.pwdDate=new Date().toISOString();

await saveUsers(users);

Swal.fire("Success","Password changed successfully","success");

if(username===JSON.parse(localStorage.getItem("loginUser")).username){

localStorage.setItem("loginUser",JSON.stringify(user));

}

}

};
