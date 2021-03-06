var buildings = [
    {name: 'Coal Mine'},
    {name: 'Compass Wood Forest'},
    {name: 'Copper Ore Mine'},
    {name: 'Fir Forest'},
    {name: 'Forge'},
    {name: 'Gold Mine'},
    {name: 'Hemp Plantation'},
    {name: 'Iron Ore Mine'},
    {name: 'Lignum Vitae Forest'},
    {name: 'Live Oak Forest'},
    {name: 'Oak Forest'},
    {name: 'Pine Forest'},
    {name: 'Red Wood Forest'},
    {name: 'Shipyard'},
    {name: 'Silver Mine'},
    {name: 'Stone Mine'},
    {name: 'Teak Forest'},
    {name: 'Workshop'}
];
var selectedBuildings = [];
function SwitchToLoadingScreen(message) {
    $("#loading-screen").removeClass("hide");
    $("#data-screen").addClass("hide");
}
function SwitchToDataScreen() {
    $("#loading-screen").addClass("hide");
    $("#data-screen").removeClass("hide");
}
function LoadSelectBuildings() {
    var selectBuildings = $("#select-buildings");
    selectBuildings.empty();
    selectBuildings.append('<option value="" disabled selected>Choisissez vos batiments</option>');
    buildings.forEach(function (building) {
        selectBuildings.append('<option value="' + building.name + '">' + building.name + "</option>");
    });
    selectBuildings.material_select();
    selectBuildings.on('change', function () {
        SelectBuildingsChange($(this).val());
    })
}
function RecoverLevel() {
    selectedBuildings.forEach(function (building, idx) {
        selectedBuildings[idx].lvl = $('#lvl-' + idx).val();
    })
}
function SendToDb(pseudo, infos) {
    var data = {};
    data.pseudo = pseudo;
    var infosString = "";
    infos.forEach(function (info) {
        if (infosString == ""){
            infosString = info.name + "=" + info.lvl;
        } else {
            infosString += "," + info.name + "=" + info.lvl;
        }
    });
    data.infos = infosString;
    $.get('post_users.php',data).done(function () {
        console.log("Done");
    });
}
function SubmitForm(event) {
    event.preventDefault();
    var pseudo = $('#pseudo').val();
    RecoverLevel();
    SendToDb(pseudo, selectedBuildings);
}
function SelectBuildingsChange(buildings) {
    var buildingsLvl = $('#buildings-lvl');
    selectedBuildings = [];
    var options = '<option value="1" selected>Level 1</option><option value="2">Level 2</option><option value="3">Level 3</option>';
    buildingsLvl.empty();
    buildings.forEach(function (building, idx) {
        selectedBuildings.push({name: building});
        buildingsLvl.append('<div class="input-field col s12"><select id="lvl-'+idx+'">'+options+'</select><label>'+building+' Level</label></div>');
    });
    $("select[id!='select-buildings']").material_select();
    if (buildingsLvl.hasClass('hide')){
        buildingsLvl.removeClass("hide");
    }
    if ($("button[type='submit']").hasClass('hide')){
        $("button[type='submit']").removeClass("hide");
    }
}
$(document).ready(function () {
    LoadSelectBuildings();
    SwitchToDataScreen();
    //$.ajax({url:"https://docs.google.com/spreadsheets/d/1jFQNMjbZZWsqqOZTP2HuUPGujgpFbJVgOVCox4ija28/pub?gid=691791079&single=true&output=csv",
    //    accepts:{"Content-Type": "text/csv"}
    //}).always(function (data) {
    //    console.log(data);
    //});
    $('form').submit(SubmitForm);

});