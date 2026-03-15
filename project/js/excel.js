// EXCEL MODULE

function formatDate(value){

let d=new Date(value);

if(isNaN(d)) return value;

return ("0"+d.getDate()).slice(-2)+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+d.getFullYear();

}


window.openExcelPage=function(){

contentArea.innerHTML=`

<div class="card">

<div class="card-body">

<h2>Excel Viewer</h2>

<input type="file" id="excelFile" class="form-control mb-3">

<ul class="nav nav-tabs mb-3" id="sheetTabs"></ul>

<div class="tab-content" id="tabContent"></div>

</div>

</div>

`;

document.getElementById('excelFile').addEventListener('change',function(e){

let file=e.target.files[0];

if(!file) return;

let reader=new FileReader();

reader.onload=function(evt){

let data=new Uint8Array(evt.target.result);

let workbook=XLSX.read(data,{type:"array",cellDates:true});

const sheetTabs=document.getElementById("sheetTabs");

const tabContent=document.getElementById("tabContent");

sheetTabs.innerHTML="";

tabContent.innerHTML="";



workbook.SheetNames.forEach((name,index)=>{

let active=index===0?"active":"";

sheetTabs.innerHTML+=`

<li class="nav-item">

<button class="nav-link ${active}"

data-bs-toggle="tab"

data-bs-target="#tab${index}">

${name}

</button>

</li>

`;



let sheet=workbook.Sheets[name];

let json=XLSX.utils.sheet_to_json(sheet,{header:1,defval:"",blankrows:true});

if(json.length===0) return;

let headers=json[0];

let rows=json.slice(1);



let table=`<table id="tbl${index}" class="table table-bordered table-hover table-striped w-100"><thead><tr>`;


headers.forEach(h=>table+=`<th>${h||""}</th>`);

table+="</tr><tr>";

headers.forEach(()=>table+=`<th><input class="form-control form-control-sm" placeholder="Filter"></th>`);

table+="</tr></thead><tbody>";



rows.forEach((r,rowIndex)=>{

table+="<tr>";

for(let colIndex=0;colIndex<headers.length;colIndex++){

let val=r[colIndex]||"";

let cell=XLSX.utils.encode_cell({r:rowIndex+1,c:colIndex});

let c=sheet[cell];

if(c && c.t==="d") val=formatDate(c.v);

if(c && c.l && c.l.Target)

table+=`<td><a href="${c.l.Target}" target="_blank">Link</a></td>`;

else

table+=`<td>${val}</td>`;

}

table+="</tr>";

});



table+="</tbody></table>";

let show=index===0?"show active":"";



tabContent.innerHTML+=`

<div class="tab-pane fade ${show}" id="tab${index}">

${table}

</div>

`;



});



$("table").each(function(){

if($.fn.DataTable.isDataTable(this))

$(this).DataTable().destroy();



let table=$(this).DataTable({

pageLength:10,

orderCellsTop:true,

lengthMenu:[[10,50,100,-1],[10,50,100,"All"]],

scrollY:"400px",

scrollCollapse:true,

paging:true,

fixedHeader:true,

dom:'Blfrtip',

buttons:['colvis','excel','csv','print']

});



$(this)

.closest('.dataTables_wrapper')

.find("thead tr:eq(1) th input")

.each(function(i){

$(this).on("keyup change",function(){

if(table.column(i).search()!==this.value)

table.column(i).search(this.value).draw();

});

});

});

};

reader.readAsArrayBuffer(file);

});

};
