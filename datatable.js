function createTable(tableID, options = {}){

if($.fn.DataTable.isDataTable(tableID)){
$(tableID).DataTable().destroy();
}

let defaultConfig = {

pageLength:10,

lengthMenu:[[10,25,50,100,-1],[10,25,50,100,"All"]],

scrollY:"450px",        // vertical scrollbar
scrollX:true,           // horizontal scroll if needed
scrollCollapse:true,

autoWidth:false,
responsive:false,

orderCellsTop:true,

paging:true,
stateSave:true,

fixedHeader:true,       // header stays visible

dom:'Blfrtip',

buttons:[
'colvis',
{extend:'excel',title:'Report'},
{extend:'csv',title:'Report'},
{extend:'print'}
]

};

let config = {...defaultConfig, ...options};

let table = $(tableID).DataTable(config);

/* column filters */

$(tableID + " thead tr:eq(1) th input").each(function(i){

$(this).off("keyup change").on("keyup change",function(){

table.column(i)
.search(this.value)
.draw();

});

});

/* fix column alignment */

setTimeout(()=>{
table.columns.adjust().draw();
},300);

/* adjust when window resizes */

$(window).on('resize', function(){
table.columns.adjust();
});

return table;

}
