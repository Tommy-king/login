// NOTIFICATION MODULE

import {
db,
ref,
onValue,
update,
get
} from "../firebase/firebase-config.js";



// LISTEN NOTIFICATIONS

window.listenNotifications=function(){

const user=getLoggedUser().username;

onValue(ref(db,"tasks"),snapshot=>{

let count=0;

let html="";

snapshot.forEach(child=>{

let t=child.val();

if(t.assignedTo===user && t.status==="Pending"){

count++;

html+=`

<div style="padding:10px;border-bottom:1px solid #eee">

<b>To-Do</b><br>

Task: ${t.title}

<div style="margin-top:5px">

<button class="btn btn-sm btn-primary"
onclick="openTodoPage()">
Open
</button>

<button class="btn btn-sm btn-danger"
onclick="deleteNotification('${t.id}')">
Clear
</button>

</div>

</div>

`;

}

});

document.getElementById("notifyCount").innerText=count;

document.getElementById("notificationList").innerHTML=

html || "<div style='padding:10px'>No Notifications</div>";

});

};


// TOGGLE BOX

window.toggleNotifications=function(){

let box=document.getElementById("notificationBox");

box.style.display=box.style.display==="block"?"none":"block";

};


// DELETE NOTIFICATION

window.deleteNotification=async function(id){

await update(ref(db,"tasks/"+id),{

status:"Viewed"

});

};


// CLEAR ALL

window.clearAllNotifications=async function(){

const user=getLoggedUser().username;

const snapshot=await get(ref(db,"tasks"));

snapshot.forEach(child=>{

let t=child.val();

if(t.assignedTo===user && t.status==="Pending"){

update(ref(db,"tasks/"+t.id),{

status:"Viewed"

});

}

});

};
