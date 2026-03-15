// ==============================
// TASK MODULE
// ==============================

// Firebase imports assumed in main.js
// import { ref, set, get, update, remove, onValue } from firebase/database
// import { uploadBytes, getDownloadURL } from firebase/storage

let taskTable;


// ==============================
// OPEN TASK PAGE
// ==============================

function openTodoPage(){

contentArea.innerHTML = `

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
<input type="file" id="taskFile" class="form-control">
</div>

<div class="col">
<button class="btn btn-primary" onclick="addTask()">Add Task</button>
</div>

</div>


<table id="todoTable" class="table table-bordered">

<thead class="table-dark">
<tr>
<th>Task</th>
<th>Priority</th>
<th>Due</th>
<th>Status</th>
<th>Assigned</th>
<th>Days</th>
<th>Comments</th>
<th>File</th>
<th>Actions</th>
</tr>
</thead>

<tbody></tbody>

</table>

</div>
</div>
`;

taskTable = $('#todoTable').DataTable();

loadUsersForAssign();

listenTasks();

}


// ==============================
// LOAD USERS
// ==============================

async function loadUsersForAssign(){

let users = await getUsers();

let html="";

users.forEach(u=>{
html+=`<option value="${u.username}">
${u.username}
</option>`;
});

document.getElementById("taskUser").innerHTML=html;

}


// ==============================
// ADD TASK
// ==============================

async function addTask(){

let title=document.getElementById("taskTitle").value;

if(!title) return alert("Task title required");

let priority=document.getElementById("taskPriority").value;
let due=document.getElementById("taskDate").value;
let assigned=document.getElementById("taskUser").value;

let user=getLoggedUser();

let id=Date.now();

let fileUrl="";

let file=document.getElementById("taskFile").files[0];

if(file){

const storageRef = ref(storage,"tasks/"+id+"/"+file.name);

await uploadBytes(storageRef,file);

fileUrl = await getDownloadURL(storageRef);

}

await set(ref(db,"tasks/"+id),{

id,
title,
priority,
due,
status:"Pending",
assignedTo:assigned,
createdBy:user.username,
file:fileUrl,
comments:[]

});

logActivity("Created task: "+title);

}


// ==============================
// REALTIME TASK LISTENER
// ==============================

function listenTasks(){

onValue(ref(db,"tasks"),(snapshot)=>{

let data=[];

snapshot.forEach(child=>{

let t=child.val();

let commentCount=t.comments ? t.comments.length : 0;

data.push([

t.title,
t.priority,
t.due,

`<span onclick="changeStatus('${t.id}','${t.status}')"
style="${statusColor(t.status)}">
${t.status}
</span>`,

t.assignedTo,

calculateDays(t.due,t.completedDate),

`<span onclick="taskComments('${t.id}')">
💬 ${commentCount}
</span>`,

t.file ? `<a href="${t.file}" target="_blank">File</a>`:"-",

`
<button onclick="editTask('${t.id}')">Edit</button>
<button onclick="deleteTask('${t.id}')">Delete</button>
`

]);

});

taskTable.clear();
taskTable.rows.add(data);
taskTable.draw();

});

}


// ==============================
// EDIT TASK
// ==============================

async function editTask(id){

const snap=await get(ref(db,"tasks/"+id));

let t=snap.val();

let title=prompt("Edit Task",t.title);

if(!title) return;

await update(ref(db,"tasks/"+id),{title});

logActivity("Edited task "+id);

}


// ==============================
// DELETE TASK
// ==============================

async function deleteTask(id){

if(!confirm("Delete task?")) return;

await remove(ref(db,"tasks/"+id);

logActivity("Deleted task "+id);

}


// ==============================
// STATUS CHANGE
// ==============================

async function changeStatus(id,current){

let status=prompt(
"Enter status (Pending / In-Progress / Completed)",
current
);

if(!status) return;

let data={status};

if(status==="Completed")
data.completedDate=new Date().toISOString().split("T")[0];

await update(ref(db,"tasks/"+id),data);

logActivity("Changed status "+id+" to "+status);

}


// ==============================
// COMMENTS
// ==============================

async function taskComments(id){

const snap=await get(ref(db,"tasks/"+id+"/comments"));

let comments=snap.exists()?snap.val():[];

let text=prompt("Add comment");

if(!text) return;

comments.push({

user:getLoggedUser().username,
text,
time:new Date().toLocaleString()

});

await set(ref(db,"tasks/"+id+"/comments"),comments);

}


// ==============================
// ACTIVITY LOG
// ==============================

async function logActivity(action){

let id=Date.now();

let user=getLoggedUser();

await set(ref(db,"logs/"+id),{

user:user.username,
action,
time:new Date().toLocaleString()

});

}


// ==============================
// TASK ANALYTICS
// ==============================

async function openTaskDashboard(){

const snapshot = await get(ref(db,"tasks"));

let pending=0,progress=0,completed=0;

snapshot.forEach(child=>{

let t=child.val();

if(t.status=="Pending") pending++;
if(t.status=="In-Progress") progress++;
if(t.status=="Completed") completed++;

});

new Chart(document.getElementById("taskChart"),{

type:"doughnut",

data:{
labels:["Pending","In Progress","Completed"],
datasets:[{
data:[pending,progress,completed]
}]
}

});

}


// ==============================
// KANBAN BOARD
// ==============================

async function openKanban(){

contentArea.innerHTML=`

<h2>Kanban</h2>

<div class="row">

<div class="col" id="pendingCol"></div>
<div class="col" id="progressCol"></div>
<div class="col" id="doneCol"></div>

</div>
`;

const snapshot = await get(ref(db,"tasks"));

snapshot.forEach(child=>{

let t=child.val();

let card=document.createElement("div");

card.className="kanban-card";

card.dataset.id=t.id;

card.innerHTML=`<b>${t.title}</b><br>${t.assignedTo}`;

if(t.status=="Pending")
pendingCol.appendChild(card);

else if(t.status=="In-Progress")
progressCol.appendChild(card);

else
doneCol.appendChild(card);

});

initDrag();

}


// ==============================
// DRAG SYSTEM
// ==============================

function initDrag(){

["pendingCol","progressCol","doneCol"].forEach(col=>{

new Sortable(document.getElementById(col),{

group:"tasks",

animation:150,

onEnd: async function(evt){

let id=evt.item.dataset.id;

let status="Pending";

if(evt.to.id=="progressCol") status="In-Progress";
if(evt.to.id=="doneCol") status="Completed";

await update(ref(db,"tasks/"+id),{status});

}

});

});

}


// ==============================
// STATUS COLORS
// ==============================

function statusColor(s){

if(s=="Pending") return "color:red";
if(s=="In-Progress") return "color:orange";
if(s=="Completed") return "color:green";

return "";

}


// ==============================
// DATE CALCULATION
// ==============================

function calculateDays(due,completed){

if(!due) return "-";

let dueDate=new Date(due);

let done=completed?new Date(completed):new Date();

let diff=Math.floor((done-dueDate)/(1000*60*60*24));

if(!completed){

if(diff>0) return "Overdue "+diff;
if(diff==0) return "Due Today";
return Math.abs(diff)+" days left";

}

return diff>0 ? "Late "+diff : "On time";

}
