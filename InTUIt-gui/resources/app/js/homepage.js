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

var areaList = new Array(); //Array of all areas in the Network
var deviceList = new Array(); //Array of all ACUs in the Network

var deviceTable;
var areaTable;
var changesTable;


//script that executes once homepage is fully loaded
$(document).ready(function() {
  var queryString = window.location.search
  username = getQueryVariable('userName', queryString);
  networkName = getQueryVariable('networkName', queryString);
  ndfFilename = username + '-' + networkName + '.ndf'; //file name to write NDF to

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
});
//---end document.ready() calls


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
  setTimeout(function(){ //allow addDevice to execute before refresh
    areaTable.ajax.reload();
  }, 100);
  addArea($('#areaName').val());
  $('#addAreaForm')[0].reset(); //reset form fields
  $('#areaName').focus();
});

//Adding an area into the network
function addArea(areaName) {
  areaList.push(new Area(areaName));
  //update the slectable list of areas in the add acu form
  $('#areaSelect').empty();
  $('#areaSelect').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect2').empty();
  $('#areaSelect2').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect3').empty();
  for (var i = 0; i < areaList.length; i++) {
	  var area = areaList[i];
	  $('#areaSelect').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect3').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
  }

  /*
  var stream = fs.createWriteStream('./resources/app/json/area_devices/' + areaName + '-devices.json');
  stream.write(JSON.stringify({'deviceData':[]}));
  stream.end();

  var date = new Date();
  $.getJSON("./json/areas.json", function(json) {
    var deviceJSON = [date.toLocaleString(), areaName];
    json.areaData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/areas.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });
  */
  //add to current changes table
  var description = 'Name: ' + $('#areaName').val();
  addChange("Area Added", description);
  //add area node to the network visualization
  addAreaNode($('#areaName').val());
}

//********************REMOVING AN AREA **********************//
//Prefires for when user clicks Remove Area button
$('#remove-area-button').click(function() {
  if (areaList.length == 0) {
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
  for(var i = 0; i < this.areaList.length; i++) {
      if(this.areaList[i].areaName == areaName)
          this.areaList.splice(i, 1);
  }

  if(areaList.length == 0){
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
  for (var i = 0; i < areaList.length; i++) {
	  var area = areaList[i];
	  $('#areaSelect').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect3').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
  }

  //add to current changes table
  var description = 'Name: ' + areaName;
  addChange("Area Removed", description);
}


//*********************ADDING AN ACU *********************//
//Create Device Datatable when button to summon modal is clicked
$('#add-device-button').click(function() {
  if (areaList.length == 0) {
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
  addDevice();
$('#deviceName').focus();
});

//Adding a device into the network
function addDevice() {
  var tempDevice = new ACU($('#deviceName').val(), $('#deviceStates').val(), $('#deviceDependencies').val(), $('#deviceActions').val(), $('#areaSelect').val());
  var deviceArea = findArea($('#areaSelect').val());
  deviceArea.addACU(tempDevice);

  var date = new Date();

  //function call to add the device to the stored json of devices
  $.getJSON("./json/area_devices/" + deviceArea.areaName + "-devices.json", function(json) {
    var deviceJSON = [date.toLocaleString(), $('#deviceName').val(), $('#deviceStates').val(), $('#deviceActions').val(), $('#deviceDependencies').val()];
    json.deviceData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/area_devices/' + deviceArea.areaName + '-devices.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });
  //add to current changes table
  var description = 'Name: ' + $('#deviceName').val() + '<br/>States: ' + $('#deviceStates').val() +
                    '<br/>Actions: ' + $('#deviceActions').val() + '<br/>Dependencies: ' + $('#deviceDependencies').val();
  addChange("Device Added", description);
  //add acu node to the network visualization
  addDeviceNode($('#deviceName').val(), $('#areaSelect').val());
}


//*************************REMOVING AN ACU ********************//
//Prefires for when user clicks Remove Device button
$('#remove-device-button').click(function() {
  if (areaList.length == 0) {
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
  //remove acu node from network visualization
  deleteDeviceNode(device, area.areaName);
}


//********************ADDING A POLICY TO AN ACU*********************//
//Prefires for when user clicks Add Policy button
$('#add-policy-button').click(function() {
  if (areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#create-policy-modal').modal({
      focus: true
    });
  }
});

//event fires upon adding a policy
$('#createPolicyForm').submit(function(e){
  e.preventDefault();
  addPolicy();
  this.reset();
  $('#policyArea').focus();
});

//Adding a policy to an existing ACU
function addPolicy() {
  var tempPolicy = new Policy($('#policyArea').val(), $('#policyDevice').val(), $('#givenStates').val(), $('#associatedCommand').val());
  var policyArea = findArea($('#policyArea').val());
  var policyACU = findACU($('#policyDevice').val(), policyArea);
  policyACU.addPolicy(tempPolicy);
  //add to current changes table
  var description = 'Policy: Given ' + $('#givenStates').val() + ' associate ' + $('#associatedCommand').val()
                    '<br/>Area: ' + $('#policyArea').val() + '<br/>Device: ' + $('#policDevice').val();
  addChange("Policy Added", description);
}


//*****************REMOVING A POLICY FROM AN ACU***************//
//Prefires for when user clicks Add Policy button
$('#remove-policy-button').click(function() {
  if (areaList.length == 0) {
    alert("No areas have been created. Please create one");
  }
  else {
    $('#remove-policy-modal').modal({
      focus: true
    });
  }
});

//event fires upon removing a policy
$('#removePolicyForm').submit(function(e){
  e.preventDefault();

});

//****************END NETWORK EDITING MODALS BEHAVIOR*****************//

//****************CURRENT NETWORK CHANGES TAB*****************************************************/
//updates the current changes table
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
    }, 100);
}

//****************END CURRENT NETWORK CHANGES TAB*************************************************//

//Function to construct the NDF file for a user network
$('#submitNDF').click(function buildNDF() {
  var stream = fs.createWriteStream('./resources/app/' + ndfFilename);
  stream.write(username + ',' + networkName + '\n{');
  for (var i = 0; i < areaList.length; i++) {
    stream.write(areaList[i].printArea());
  }
  stream.write('}\n{');
  for (var i = 0; i < areaList.length; i++) {
	  stream.write(areaList[i].printAreaPolicies());
  }
  stream.write('}')
  stream.end();

  //visual update of submit below submit button
  var date = new Date();
  $('#ndfUpdateTime').html('<span class="white">NDF for ' + networkName + " updated on " + date.toLocaleString() + "</span>");
});


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

//Prefires for when user clicks Logout button
$('#logout-button').click(function() {
  if (confirm('Are you sure you want to logout?')) {
    if (confirm('Warning: any unsaved changes will be lost')){
      username = "";
      networkName = "";
      window.location.href="./loginIndex.html";
    }
  }
});

/********************** GENERAL PROGRAM METHOD CALLS ***********************/
//Finds a created area in the list of areas
function findArea(name) {
	for (var i = 0; i < areaList.length; i++) {
		if (areaList[i].areaName == name){
			return areaList[i];
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
