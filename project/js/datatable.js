// DATATABLE UTILITIES

window.initDataTable=function(selector){

if($.fn.DataTable.isDataTable(selector)){

$(selector).DataTable().destroy();

}

return $(selector).DataTable({

pageLength:10,

lengthMenu:[[10,50,100,-1],[10,50,100,"All"]],

scrollY:"400px",

scrollCollapse:true,

paging:true,

fixedHeader:true,

dom:'Blfrtip',

buttons:[

'colvis',

{extend:'excel',title:'Export'},

{extend:'csv',title:'Export'},

{extend:'print'}

]

});

};
