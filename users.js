// ===============================
// USERS MODULE
// ===============================

// Get logged user
function getLoggedUser(){
    return JSON.parse(localStorage.getItem("loginUser") || "{}");
}

// Check admin
function isAdmin(){
    let user = getLoggedUser();
    return user.role === "Admin";
}


// ===============================
// LOAD USERS FROM FIREBASE
// ===============================
async function getUsers(){

    try{

        const snapshot = await get(ref(db,"users"));

        if(snapshot.exists()){
            return Object.values(snapshot.val());
        }

        return [];

    }
    catch(err){
        console.error("Error loading users:",err);
        return [];
    }

}


// ===============================
// SAVE USERS
// ===============================
async function saveUsers(users){

    let obj={};

    users.forEach(u=>{
        obj[u.username]=u;
    });

    await set(ref(db,"users"),obj);

}


// ===============================
// CREATE USER PAGE
// ===============================
function createUserPage(){

if(!isAdmin()){
Swal.fire("Access Denied","Admin only","error");
return;
}

contentArea.innerHTML = `
<div class="card">
<div class="card-body">

<h2>Create User</h2>

<input id="newUsername" class="form-control mb-2" placeholder="Username">

<input id="newUserID" class="form-control mb-2" placeholder="User ID">

<input id="newDepartment" class="form-control mb-2" placeholder="Department">

<input id="newPassword" type="password" class="form-control mb-2" placeholder="Password">

<select id="newRole" class="form-control mb-2">
<option value="Admin">Admin</option>
<option value="User">User</option>
</select>

<select id="newStatus" class="form-control mb-2">
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>

<button class="btn btn-primary" onclick="createUser()">Create</button>

</div>
</div>
`;

}


// ===============================
// CREATE USER
// ===============================
async function createUser(){

let username = document.getElementById("newUsername").value.trim();
let userID = document.getElementById("newUserID").value.trim();
let dept = document.getElementById("newDepartment").value.trim();
let password = document.getElementById("newPassword").value.trim();
let role = document.getElementById("newRole").value;
let status = document.getElementById("newStatus").value;

if(!username || !userID || !dept || !password){

Swal.fire("Validation","All fields required","warning");
return;

}

let users = await getUsers();

if(users.find(u=>u.username===username || u.userID===userID)){

Swal.fire("Error","User already exists","error");
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

Swal.fire("Success","User created","success");

createUserPage();

}


// ===============================
// VIEW USERS
// ===============================
async function viewUsers(){

if(!isAdmin()){
Swal.fire("Access Denied","Admin only","error");
return;
}

let users = await getUsers();

let rows = users.map(u=>`
<tr>

<td>${u.username}</td>
<td>${u.userID}</td>
<td>${u.department}</td>
<td>${u.role}</td>
<td>${u.status}</td>

<td>

<i class="fa fa-edit action"
onclick="editUser('${u.username}')"></i>

<i class="fa fa-trash action"
onclick="deleteUser('${u.username}')"></i>

<i class="fa fa-key action"
onclick="changeUserPassword('${u.username}')"></i>

</td>

</tr>
`).join("");

contentArea.innerHTML=`

<div class="card">

<div class="card-body">

<h2>User Management</h2>

<table id="userTable" class="table table-bordered table-striped">

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
pageLength:10
});
},200);

}


// ===============================
// EDIT USER
// ===============================
async function editUser(username){

let users = await getUsers();

let user = users.find(u=>u.username===username);

if(!user) return;

const {value}=await Swal.fire({

title:"Edit User",

html:`

<input id="editDept" class="swal2-input"
value="${user.department}">

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

preConfirm:()=>{

return{

department:document.getElementById("editDept").value,
role:document.getElementById("editRole").value,
status:document.getElementById("editStatus").value

};

}

});

if(!value) return;

user.department=value.department;
user.role=value.role;
user.status=value.status;

await saveUsers(users);

Swal.fire("Updated","User updated","success");

viewUsers();

}


// ===============================
// DELETE USER
// ===============================
async function deleteUser(username){

const confirm=await Swal.fire({

title:"Delete user?",
text:username,
icon:"warning",
showCancelButton:true

});

if(!confirm.isConfirmed) return;

let users = await getUsers();

users = users.filter(u=>u.username!==username);

await saveUsers(users);

Swal.fire("Deleted","User removed","success");

viewUsers();

}


// ===============================
// CHANGE USER PASSWORD
// ===============================
async function changeUserPassword(username){

let users = await getUsers();

let user = users.find(u=>u.username===username);

if(!user) return;

const {value:newPassword} = await Swal.fire({

title:"New Password",
input:"password",
showCancelButton:true

});

if(!newPassword) return;

user.password=newPassword;
user.pwdDate=new Date().toISOString();

await saveUsers(users);

Swal.fire("Success","Password updated","success");

}
