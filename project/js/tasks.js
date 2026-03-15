// TASK MANAGER MODULE

import {
db,
ref,
set,
get,
update,
remove
} from "../firebase/firebase-config.js";


let taskTable;


// OPEN TODO PAGE

window.openTodoPage=function(){

contentArea.innerHTML=`

<div class="card">

<div class="card-body">

<h2>Task Manager</h2>

<div class="row mb-3">

<div class="col">
<input id="taskTitle" class="form-control" placeholder="Task Title">
</div>

<div class="col">
<select id="taskPriority" class="form-control">
<option>High</option>
<option>Medium</option>
<option>Low</option>
</select>
</div>

<div class="col">
<input type="date" id="taskDate" class="form-control">
</div>

<div class="col">
<select id="taskUser" class="form-control"></select>
</div>

<div class="col">
<button class="btn btn-primary" onclick="addTask()">Add Task</button>
</div>

</div>

<div class="mb-2">

<input id="taskSearch" class="form-control"
placeholder="Search Task"
onkeyup="searchTasks()">

</div>

<table id="todoTable" class="table table-bordered table-striped w-100">

<thead class="table-dark">

<tr>
<th>Task</th>
<th>Priority</th>
<th>Due Date</th>
<th>Status</th>
<th>Completed Date</th>
<th>Assigned To</th>
<th>Assigned By</th>
<th>No. of Days</th>
<th>Comment</th>
<th>Actions</th>
</tr>

</thead>

<tbody id="taskTable"></tbody>

</table>

</div>

</div>

`;

taskTable=$('#todoTable').DataTable({

pageLength:10,
lengthMenu:[[10,50,100,-1],[10,50,100,"All"]],
scrollY:"400px",
scrollCollapse:true,
paging:true,
fixedHeader:true,
dom:'Blfrtip',
buttons:['colvis','excel','csv','print']

});

loadUsersForAssign();
loadTasks();

};


// LOAD USERS FOR ASSIGN

async function loadUsersForAssign(){

let loggedUser=getLoggedUser();

let select=document.getElementById("taskUser");

if(loggedUser.role!=="Admin"){

select.innerHTML=`<option>${loggedUser.username}</option>`;
select.disabled=true;

return;

}

let users=await getUsers();

let options="";

users.forEach(u=>{
options+=`<option value="${u.username}">${u.username}</option>`;
});

select.innerHTML=options;

}


// ADD TASK

window.addTask=async function(){

let title=document.getElementById("taskTitle").value.trim();

if(!title){

Swal.fire("Validation","Task title required","warning");
return;

}

let priority=document.getElementById("taskPriority").value;
let due=document.getElementById("taskDate").value;

let loggedUser=getLoggedUser();

let assignedUser;

if(loggedUser.role==="Admin")
assignedUser=document.getElementById("taskUser").value;
else
assignedUser=loggedUser.username;

let id=Date.now();

await set(ref(db,"tasks/"+id),{

id,
title,
priority,
due,
status:"Pending",
createdBy:loggedUser.username,
assignedTo:assignedUser,
assignedBy:loggedUser.username,
comments:[]

});

Swal.fire("Success","Task created","success");

loadTasks();

};


// LOAD TASKS

async function loadTasks(){

const snapshot=await get(ref(db,"tasks"));

let data=[];

snapshot.forEach(child=>{

let t=child.val();

let commentCount=t.comments ? t.comments.length : 0;

data.push([

t.title,
t.priority,
t.due||"-",

`<span onclick="changeStatus('${t.id}','${t.status}')"
style="cursor:pointer;${statusColor(t.status)}">
${t.status}
</span>`,

t.completedDate||"-",
t.assignedTo,
t.assignedBy||"-",

calculateDays(t.due,t.completedDate),

`<span onclick="taskComments('${t.id}')"
style="cursor:pointer;color:#2563eb">
<i class="fa fa-comment"></i> ${commentCount}
</span>`,

`
<i class="fa fa-edit action"
onclick="editTask('${t.id}')"></i>

<i class="fa fa-trash action"
onclick="deleteTask('${t.id}')"></i>
`

]);

});

taskTable.clear();
taskTable.rows.add(data);
taskTable.draw();

}


// STATUS CHANGE

window.changeStatus=async function(id,currentStatus){

const { value:status }=await Swal.fire({

title:"Update Status",

input:"select",

inputOptions:{
"Pending":"Pending",
"In-Progress":"In-Progress",
"Completed":"Completed"
},

inputValue:currentStatus,
showCancelButton:true

});

if(!status) return;

let updateData={status};

if(status==="Completed"){

let today=new Date().toISOString().split("T")[0];
updateData.completedDate=today;

}else{

updateData.completedDate="";

}

await update(ref(db,"tasks/"+id),updateData);

loadTasks();

};


// DELETE TASK

window.deleteTask=async function(id){

await remove(ref(db,"tasks/"+id));

Swal.fire("Deleted","Task removed","success");

loadTasks();

};


// TASK COMMENTS

window.taskComments=async function(id){

const snap=await get(ref(db,"tasks/"+id+"/comments"));

let comments=snap.exists()?snap.val():[];

let history="";

comments.forEach(c=>{

history+=`

<div style="border-bottom:1px solid #eee;padding:5px">

<b>${c.user}</b><br>

${c.text}<br>

<small>${c.time}</small>

</div>

`;

});

if(history==="") history="<i>No comments yet</i>";

const { value:comment }=await Swal.fire({

title:"Task Comments",

html:`

<div style="max-height:200px;overflow:auto;text-align:left;margin-bottom:10px">

${history}

</div>

<input id="newComment" class="swal2-input" placeholder="Add new comment">

`,

showCancelButton:true,

preConfirm:()=>document.getElementById("newComment").value

});

if(!comment) return;

comments.push({

user:getLoggedUser().username,
text:comment,
time:new Date().toLocaleString()

});

await set(ref(db,"tasks/"+id+"/comments"),comments);

loadTasks();

};


// SEARCH

window.searchTasks=function(){

let value=document.getElementById("taskSearch").value.toLowerCase();

$("#taskTable tr").filter(function(){

$(this).toggle(

$(this).text().toLowerCase().indexOf(value)>-1

);

});

};


// STATUS COLOR

function statusColor(status){

if(status==="Pending") return "color:red;font-weight:bold";

if(status==="In-Progress") return "color:orange;font-weight:bold";

if(status==="Completed") return "color:green;font-weight:bold";

return "";

}


// CALCULATE DAYS

function calculateDays(dueDateStr,completedDateStr){

if(!dueDateStr) return "-";

let dueDate=new Date(dueDateStr);

let completedDate=completedDateStr ? new Date(completedDateStr) : new Date();

let diffTime=completedDate-dueDate;

let diffDays=Math.floor(diffTime/(1000*60*60*24));

if(!completedDateStr){

if(diffDays>0) return `<span style="color:red">Overdue ${diffDays} days</span>`;

if(diffDays===0) return `<span style="color:orange">Due Today</span>`;

return `<span style="color:green">${Math.abs(diffDays)} days left</span>`;

}

if(diffDays>0)
return `<span style="color:red">Late by ${diffDays} days</span>`;

if(diffDays<0)
return `<span style="color:green">Completed ${Math.abs(diffDays)} days early</span>`;

return `<span style="color:blue">Completed On Time</span>";

}
