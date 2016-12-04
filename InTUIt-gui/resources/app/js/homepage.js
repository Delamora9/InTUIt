/*****************************************************************************************************************
Programmed by: Christopher Franklyn, Jess Geiger, Nick Delamora, Keith Cissell
Description: This file contains important functions and resources for the entire UI
Last Modified: 11/16/2016
******************************************************************************************************************/

//this command loads jquery properly
window.$ = window.jQuery = require('./js/jquery.min.js');
//for file system reading/writing
var fs = require('fs');
//for query string parsing
var qs = require('querystring');

var username = 'generic'; //Variable for logged in user. Default is 'generic'
var networkName = 'network'; //Variable for current network. Default is 'network'
var ndfFilename = username + networkName + '.ndf';
var ndfFilePath;

var currentNetwork; //Holds the entire network structure

var ndfLoaded = false; //Variable to hold the load status of NDF

var deviceTable;
var areaTable;
var changesTable;


//script that executes once homepage is fully loaded
$(document).ready(function() {
  var queryString = window.location.search
  username = getQueryVariable('userName', queryString);
  networkName = getQueryVariable('networkName', queryString);
  ndfFilename = username + '-' + networkName + '.ndf'; //file name to write NDF to
  ndfFilePath = "./ndf/" + ndfFilename;
  currentNetwork = new Network(networkName, username);

  //Populate the Username and Network Fields bassed on Login
  $('#user-name').html('User: ' + username);
  $('#network-name').html('Network: ' + networkName);
  $('#displayTitle').html('Network: ' + networkName);

  //Creates the changes datatable
  changesTable = $('#changesTable').DataTable({
    "paging": true,
    "iDisplayLength": 10,
    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
    "responsive": true,
    "autoWidth": false,
    "language": {"emptyTable": "No changes have been made"},
    "order": [[0, 'desc']],
    "columns": [
        { "width": "33%" },
        { "width": "33%" },
        { "width": "33%" }
    ],
    "ajax": {
      "url": './json/changes.json',
      "dataSrc": 'changeData'
    }
  });

  //read the user's ndf file
  readNDF();

});
//---end document.ready() calls

//********************BUILDING NETWORK UPON LOGGIN**********************//
//function to read NDF upon homepage load
function readNDF() {
    //put NDF data into json files
    var lines;
    $.get(ndfFilePath, function(txt) {
        lines = txt.split("\n");
    });
    setTimeout(function() {
        readNSDO(lines[1]);
        readOPD(lines[2]);
        setTimeout(function() {ndfLoaded = true;}, 1000);
    }, 1000);
}

//reads the NSDO
function readNSDO(data) {
  var nsdo = JSON.parse(data);
  for (var a in nsdo) {
      var area = nsdo[a];
      var areaName = a.toString();
      addArea(areaName);
      for (var d in area) {
          var device = area[d];
          var deviceName = d.toString();
          var dependencies = JSON.stringify(device["Dependencies"]);
          dependencies = dependencies.replace('[','');
          dependencies = dependencies.replace(']','');
          var states = JSON.stringify(device["States"]);
          states = states.replace('[','');
          states = states.replace(']','');
          var actions = JSON.stringify(device["Actions"]);
          actions = actions.replace('[','');
          actions = actions.replace(']','');
          addDevice(deviceName, dependencies, states, actions, areaName)
      }
  }
}

//reads the OPD
function readOPD(data) {
  var opd = JSON.parse(data);
  for (var a in opd) {
      var area = opd[a];
      var areaName = a.toString();
      for (var d in area) {
          var device = area[d];
          var deviceName = d.toString();
          for (var p in device) {
              var policy = JSON.stringify(device[p]);
              addPolicy(areaName, deviceName, policy);
          }
      }
  }
}
//********************End NETWORK BUILD *****************//


//********************ADDING AN AREA *****************//
//Prefires for when user clicks Add Area button
$('#add-area-button').click(function() {
  if (!($.fn.dataTable.isDataTable('#areaTable'))){ //if the datatable isn't created, make it
    areaTable = $('#areaTable').DataTable({
      "paging": true,
      "iDisplayLength": 5,
      "lengthMenu": [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
      "responsive": true,
      "autoWidth": false,
      "language": {"emptyTable": "No Areas have been created"},
      "order": [[0, 'desc']],
      "columns": [
          { "width": "50%" },
          { "width": "50%"}
      ],
      "ajax": {
        "url": './json/areas.json',
        "dataSrc": 'areaData'
      }
    });
  }
  else {
    areaTable.ajax.reload();
  }
});

//event fires upon adding an area
$('#addAreaForm').submit(function(e){
  e.preventDefault(); //prevent form from redirect
  setTimeout(function(){ //allow addArea to execute before refresh
    areaTable.ajax.reload();
  }, 100);
  addArea($('#areaName').val());
  $('#addAreaForm')[0].reset(); //reset form fields
  $('#areaName').focus();
});

//Adding an area into the network
function addArea(areaName) {
  currentNetwork.areaList.push(new Area(areaName));
  //update the slectable list of areas in the add acu form
  $('#areaSelect').empty();
  $('#areaSelect').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect2').empty();
  $('#areaSelect2').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect3').empty();
  $('#policyArea').empty();
  $('#policyArea').append('<option value=\"none\" selected>Select an Area</option>');
  $('#policyArea2').empty();
  $('#policyArea2').append('<option value=\"none\" selected>Select an Area</option>');
  for (var i = 0; i < currentNetwork.areaList.length; i++) {
	  var area = currentNetwork.areaList[i];
	  $('#areaSelect').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect3').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#policyArea').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#policyArea2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
  }

  console.log("Creating Area File");
  var stream = fs.createWriteStream('./resources/app/json/area_devices/' + areaName + '-devices.json');
  stream.write(JSON.stringify({'deviceData':[]}));
  stream.end();
  console.log("Area File Created");

  var date = new Date();
  $.getJSON("./json/areas.json", function(json) {
    var deviceJSON = [date.toLocaleString(), areaName];
    json.areaData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/areas.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });

  //add to current changes table
  if (ndfLoaded) {
      var description = 'Name: ' + areaName;
      addChange("Area Added", description);
  };
  //add area node to the network visualization
  addAreaNode(areaName);
}

//********************REMOVING AN AREA **********************//
//Prefires for when user clicks Remove Area button
$('#remove-area-button').click(function() {
  if (currentNetwork.areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#remove-area-modal').modal({
      focus: true
    });
  }
});

//event fires upon removing an area
$('#removeAreaForm').submit(function(e){
  e.preventDefault(); //prevent form from redirect
  if (confirm('Are you sure you want to remove ' + $('#areaSelect3').val() + ' and all of its ACUs?')) {
    removeArea($('#areaSelect3').val());
    $('#removeAreaForm')[0].reset(); //reset form fields
  }
});

//Removing an Area from the network
function removeArea(areaName) {
  //remove area from network visualization
  removeAreaNode(areaName);
  for(var i = 0; i < this.currentNetwork.areaList.length; i++) {
      if(this.currentNetwork.areaList[i].areaName == areaName)
          this.currentNetwork.areaList.splice(i, 1);
  }

  if(currentNetwork.areaList.length == 0){
    alert("no more areas");
    $('#remove-area-modal').modal('hide');
  }

  $.getJSON("./json/areas.json", function(json) {
    for (var i = 0; i < json.areaData.length; i++){
      if(areaName == json.areaData[i][1]){
        json.areaData.splice(i, 1); //this part is not working yet and needs to be modified
      }
    }
    var stream = fs.createWriteStream('./resources/app/json/areas.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });

  $('#areaSelect').empty();
  $('#areaSelect2').empty();
  $('#areaSelect2').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect3').empty();
  $('#policyArea').empty();
  $('#policyArea').append('<option value=\"none\" selected>Select an Area</option>');
  $('#policyArea2').empty();
  $('#policyArea2').append('<option value=\"none\" selected>Select an Area</option>');
  for (var i = 0; i < currentNetwork.areaList.length; i++) {
	  var area = currentNetwork.areaList[i];
	  $('#areaSelect').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect3').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#policyArea').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#policyArea2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
  }

  //add to current changes table
  var description = 'Name: ' + areaName;
  addChange("Area Removed", description);

}


//*********************ADDING AN ACU *********************//
//Create Device Datatable when button to summon modal is clicked
$('#add-device-button').click(function() {
  if (currentNetwork.areaList.length == 0) {
    //e.preventDefault();
    alert("No areas have been created. Please create one");
  }
  else {
    $('#add-device-modal').modal({
      focus: true
    });
    $('#areaDeviceDisplay').hide();
  }
});

//event fires upon adding a device
$('#addDeviceForm').submit(function(e){
  e.preventDefault(); //prevent form from redirect
  setTimeout(function(){ //allow addDevice to execute before refresh
    deviceTable.ajax.reload();
    $('#addDeviceForm')[0].reset(); //reset form fields
  }, 100);

  var deviceName = $('#deviceName').val();
  var dependencies = $('#deviceDependencies').val();
  var states = $('#deviceStates').val();
  var actions = $('#deviceActions').val();
  var areaSelect = $('#areaSelect').val();

  addDevice(deviceName, dependencies, states, actions, areaSelect);
$('#deviceName').focus();
});

//Adding a device into the network
function addDevice(deviceName, dependencies, states, actions, areaSelect) {
  var tempDevice = new ACU(deviceName, dependencies, states, actions, areaSelect);
  var deviceArea = findArea(areaSelect);
  deviceArea.addACU(tempDevice);

  var date = new Date();
console.log(deviceArea.areaName);
  //function call to add the device to the stored json of devices
  $.getJSON("./json/area_devices/" + deviceArea.areaName + "-devices.json", function(json) {
    console.log("test");
    var deviceJSON = [date.toLocaleString(), deviceName, states, actions, dependencies];
    json.deviceData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/area_devices/' + deviceArea.areaName + '-devices.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });
  console.log("After json call");
  //add to current changes table
    if (ndfLoaded) {
        var description = 'Name: ' + deviceName + '<br/>States: ' + states + '<br/>Actions: '
                        + actions + '<br/>Dependencies: ' + dependencies;
        addChange("Device Added", description);
    };
  //add acu node to the network visualization
  addDeviceNode(deviceName, areaSelect);
}


//*************************REMOVING AN ACU ********************//
//Prefires for when user clicks Remove Device button
$('#remove-device-button').click(function() {
  if (currentNetwork.areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#remove-device-modal').modal({
      focus: true
    });
  }
});

//event fires upon removing a device
$('#removeDeviceForm').submit(function(e){
  e.preventDefault(); //prevent form from redirect
  if (confirm('Are you sure you want to remove ' + $('#deviceSelect').val() + ' from ' + $('#areaSelect2').val() + '?')) {
    var area = findArea($('#areaSelect2').val());
    removeDevice(area, $('#deviceSelect').val());
  }
});

//function to remove a device
function removeDevice(area, device) {
  area.removeACU(device);
  //remove acu node from network visualization
  removeDeviceNode(device, area.areaName);

  $.getJSON("./json/area_devices/" + area.areaName + "-devices.json", function(json) {
    for (var i = 0; i < json.deviceData.length; i++){
      if(device == json.deviceData[i][1]){
        json.deviceData.splice(i, 1); //this part is not working yet and needs to be modified
      }
    }
    var stream = fs.createWriteStream('./resources/app/json/area_devices/' + area.areaName + '-devices.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });

  $('#deviceSelect').empty();
  $('#deviceSelect').append('<option value=\"none\" selected>Select a Device</option>');
  for (var i = 0; i < area.acuList.length; i++) {
    var curDevice = area.acuList[i];
    $('#deviceSelect').append('<option value="' + curDevice.acuName + '">' + curDevice.acuName +'</option>');
  }
  //add to current changes table
  var description = 'Name: ' + device;
  addChange("Device Removed", description);
}


//********************ADDING A POLICY TO AN ACU*********************//
//Prefires for when user clicks Add Policy button
$('#add-policy-button').click(function() {
  if (currentNetwork.areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#policyInfo').hide();
    $('#policyDeviceArea').hide();
    $('#create-policy-modal').modal({
      focus: true
    });
  }
});

$('#policyArea').change(function(){
  if($('#policyArea').val() == "none"){
    $('#policyDeviceArea').hide();
    $('#policyInfo').hide();
    $('#policyDevice').empty();
    $('#policyDevice').append('<option value=\"none\" selected>Select a Device</option>');
  }
  else{
    $('#policyDevice').empty();
    var area = findArea($('#policyArea').val());
    if(area.acuList.length == 0){
      alert("There are not yet devices in this area.");
    }
    for(var i = 0; i < area.acuList.length; i++){
      var device = area.acuList[i];
      $('#policyDevice').append('<option value="' + device.acuName + '">' + device.acuName +'</option>');
    }
    $('#policyDeviceArea').show();
  }
});

$('#policyDevice').change(function(){
  $('#policyInfo').show();
});

//event fires upon adding a policy
$('#createPolicyForm').submit(function(e){
  e.preventDefault();
  if($('#policyArea').val() == "none"){
    alert("Please select an area before submitting");
  }
  else if($('policyDevice').val() == "none"){
    alert("Please select a device before submitting");
  }
  else{
    var policyArea = $('#policyArea').val();
    var policyDevice = $('#policyDevice').val();
    var policy = "Given {" + $('#givenStates').val().strip(' ') + "} associate " + $('#associatedCommand').val();
    addPolicy(policyArea, policyDevice, policy);
    this.reset();
    $('#policyArea').focus();
  }
});

//Adding a policy to an existing ACU
function addPolicy(policyArea, policyDevice, policy) {
  var tempPolicy = new Policy(policyArea, policyDevice, policy);
  var area = findArea(policyArea);
  var device = findACU(policyDevice, area);
  device.addPolicy(tempPolicy);
  //add to current changes table
  if (ndfLoaded) {
      var description = 'Policy: ' + policy + '<br/>Device: ' + policyDevice + '<br/>Area: ' + policyArea;
      addChange("Policy Added", description);
  };
}


//*****************REMOVING A POLICY FROM AN ACU***************//
//Prefires for when user clicks Add Policy button
$('#remove-policy-button').click(function() {
  if (currentNetwork.areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#policyInfo').hide();
    $('#policyDeviceArea').hide();
    $('#remove-policy-modal').modal({
      focus: true
    });
  }
});

$('#policyArea2').change(function(){
  if($('#policyArea2').val() == "none"){
    $('#policyDeviceArea').hide();
    $('#policyInfo').hide();
    $('#policyDevice2').empty();
    $('#policyDevice2').append('<option value=\"none\" selected>Select a Device</option>');
    $('#policyToRemove').empty();
    $('#policyToRemove').append('<option value=\"none\" selected>Select a Policy</option>');
  }
  else{
    $('#policyDeviceArea').show();
    $('#policyDevice2').empty();
    var area = findArea($('#policyArea2').val());
    for(var i = 0; i < area.acuList.length; i++){
      var device = area.acuList[i];
      $('#policyDevice2').append('<option value="' + device.acuName + '">' + device.acuName +'</option>');
    }
  }
});

$('#policyDevice2').change(function(){
  $('#policyToRemove').empty();
  var acu = findACU($('#policyDevice2').val(), $('#policyArea2').val());
  if(acu.policyList.length == 0){
    alert("The selected device has no policies.")
  }
  for(var i = 0; i < acu.policyList.length; i++){
    var policy = acu.policyList[i];
    $('#policyDevice').append('<option value="' + policy.policy + '">' + policy.policy +'</option>');
  }
});

//event fires upon removing a policy
$('#removePolicyForm').submit(function(e){
  e.preventDefault();
  if($('#policyArea2').val() == "none"){
    alert("Please select an area.");
  }
  else if($('#policyDevice2').val() == "none"){
    alert("Please select a device.");
  }
  else if($('#policyToRemove').val() == "none"){
    alert("Please select a policy.");
  }
  else{
    removePolicy($('#policyArea2').val(), $('#policyDevice2').val(), $('#policyToRemove').val());
  }
});

function removePolicy(area, device, policy){
  var removalArea = findArea(area);
  var acu = findACU(device, removalArea);
  for(var i = 0; i < acu.policyList.length; i++) {
      if(acu.policyList[i].policy == policy){
          acu.policyList.splice(i, 1);
      }
  }
  if (ndfLoaded) {
      var description = 'Policy: ' + policy + '<br/>Device: ' + device + '<br/>Area: ' + area;
      addChange("Policy Removed", description);
  };
}


//****************END NETWORK EDITING MODALS BEHAVIOR*****************//

//function to update the current changes table
function addChange(type, description) {
    var date = new Date();
    $.getJSON("./json/changes.json", function(json) {
      var changeJSON = [date.toLocaleString(), type, description];
      json.changeData.push(changeJSON);
      var stream = fs.createWriteStream('./resources/app/json/changes.json');
      stream.write(JSON.stringify(json));
      stream.end();
    });
    setTimeout(function(){ //allow addChange to execute before refresh
      changesTable.ajax.reload();
    }, 150);
}

//*********************BUILDING AND SHIPPING OF NDF****************************//
//Function to construct the NDF file for a user network
$('#submitNDF').click(function buildNDF() {
  var stream = fs.createWriteStream('./resources/app/' + ndfFilePath);
  stream.write(username + ',' + networkName + '\n')
  stream.write(currentNetwork.printNetwork() + '\n');
  stream.write(currentNetwork.printNetworkPolicies());
  stream.end();
  //clear the current changes table
  clearChangesTable();
  setTimeout(function(){ //allow addChange to execute before refresh
    changesTable.ajax.reload();
    sendNDF(); //Send constructed NDF to compess
  }, 100);

  //visual update of submit below submit button
  var date = new Date();
  $('#ndfUpdateTime').html('<span class="white">NDF for ' + networkName + " updated on " + date.toLocaleString() + "</span>");
});

//Function to ship constructed NDF to CoMPES
function sendNDF(){
  	var ndfVar;
  	fs.readFile("./resources/app/ndf/" + ndfFilename, 'utf8', function(err, txt)  {
  		if (err) throw err;
  		console.log(txt);
  		ndfVar = txt;
  		postNDF();
  	});

  	//posts NDF to compes. tie it to the "submit" button
  	function postNDF() {
  		$.ajax({
  			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": networkName}), //put network ID here
  			method:'POST',
  			data: {NDF: ndfVar}, //this will be the actual NDF file (all the 3 arrays)
  			success: function(data, status, xhr){
  				alert(data);
  			},
  			error: function(data, status, xhr)
  			{
  				alert(data);
  			}
  		});
  	}
}

//**************END BUILDING AND SHIPPING OF NDF**************************//

//********************CLEAN WORKSPACE ******************//
//function to clear any data before the session ends
window.onunload = function(){
  clearAreas();
  clearChangesTable();
  deleteAreaFiles("./resources/app/ndf");
  deleteAreaFiles("./resources/app/json/area_devices");
}

//emptys the areas.json file
function clearAreas() {
    $.getJSON("./json/areas.json", function(json) {
        json.areaData = [];
        var stream = fs.createWriteStream('./resources/app/json/areas.json');
        stream.write(JSON.stringify(json));
        stream.end();
    });
}

//emptys the current changes table
function clearChangesTable() {
    $.getJSON("./json/changes.json", function(json) {
        json.changeData = [];
        var stream = fs.createWriteStream('./resources/app/json/changes.json');
        stream.write(JSON.stringify(json));
        stream.end();
    });
}

//deletes all files in the ./json/area_devices folder
function deleteAreaFiles(dirPath) {
  try { var files = fs.readdirSync(dirPath); }
  catch(e) { return; }
  if (files.length > 0){
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        deleteAreaFiles(filePath);
    }
  }
};
//********************END CLEAN WORKSPACE **************//

$('#areaSelect').change(function() {
  loadAreaDeviceTable($('#areaSelect').val());
  $('#areaDeviceDisplay').show();
});

function loadAreaDeviceTable(areaName){
  if ($.fn.dataTable.isDataTable('#deviceTable')){ //if the datatable is created, destroy it
    $('#deviceTable').dataTable().fnDestroy();
  }
  deviceTable = $('#deviceTable').DataTable({
    "paging": true,
    "iDisplayLength": 5,
    "lengthMenu": [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
    "responsive": true,
    "autoWidth": false,
    "language": {"emptyTable": "No ACUs have been created"},
    "order": [[0, 'desc']],
    "columns": [
        { "width": "12%" },
        { "width": "15%" },
        { "width": "20%" },
        { "width": "28%" },
        { "width": "25%" }
    ],
    "ajax": {
      "url": './json/area_devices/' + areaName + '-devices.json',
      "dataSrc": 'deviceData'
    }
  });
}


//event triggered by selecting an area in remove device modal
$('#areaSelect2').change(function() {
  $('#deviceSelect').empty();
  $('#deviceSelect').append('<option value=\"none\" selected>Select a Device</option>');
  var removeACUArea = findArea($('#areaSelect2').val());
  for (var i = 0; i < removeACUArea.acuList.length; i++) {
    var device = removeACUArea.acuList[i];
    $('#deviceSelect').append('<option value="' + device.acuName + '">' + device.acuName +'</option>');
  }
});


/********************** GENERAL PROGRAM METHOD CALLS ***********************/
//Finds a created area in the list of areas
function findArea(name) {
	for (var i = 0; i < currentNetwork.areaList.length; i++) {
		if (currentNetwork.areaList[i].areaName == name){
			return currentNetwork.areaList[i];
		}
	}
	console.log("findArea: Could not find area specified")
}

//Finds an ACU in a given Area
function findACU(name, Area) {
	var acuList = Area.acuList;
	for (var i = 0; i < acuList.length; i++) {
		if (acuList[i].acuName == name){
			return acuList[i];
		}
	}
	console.log("findACU: Could not find ACU specified")
}

//Returns query string value given
function getQueryVariable(variable, queryString) {
  var query = queryString.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
       return decodeURIComponent(pair[1]);
    }
  }
  console.log('Query variable %s not found', variable);
}

//load user profile ajax call
$('#logout-button').click(function(event) {
  if (confirm('Are you sure you want to logout?')) {
    if (confirm('Warning: any unsaved changes will be lost')){
    	$.ajax({
    		url: 'http://146.7.44.180:8080/users',
    		method:'GET',
    		success: function(data, xhr){
    			var userprof = JSON.parse(data);
    			var pass = (userprof["Password"]);
    			logout(pass); //Calls loggout function with pass retrieved from ComPES
    		},
    		error: function(data, status, xhttp)
    		{
    			alert(data); //all these error throws will just be debugging. the user should never see them
    		}
    	});
    }
  }
});

function logout(password) {
	$.ajax({
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": username, "mode": "Lout"}),
		method:'PUT',
		data: {userPass: password},
		success: function(data, status, xhttp){
			alert(data); //tells you that you logged out
			window.location.href="./loginIndex.html";
		},
		error: function(data, status, xhttp)
		{
			alert(data);
		}
	});

}
