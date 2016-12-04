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

var username; //Variable for logged in user.
var networkName; //Variable for current network.
var ndfFilePath;
var nsroFilePath;

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
  ndfFilePath = './NDF/' + username + '-' + networkName + '.ndf'; //file name to write NDF to
  nsroFilePath = './NSRO/' + username + '-' + networkName + '.nsro';
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
        { "width": "20%" },
        { "width": "20%" },
        { "width": "60%" }
    ],
    "ajax": {
      "url": './json/changes.json',
      "dataSrc": 'changeData'
    }
  });

  //read the user's ndf file
  readNDF();

  //test call of the readNSRO
  setTimeout(readNSRO, 3000);

});
//---end document.ready() calls

//********************LOADING NDF **********************//
//function to read NDF
function readNDF() {
    //put NDF data into json files
    $.get(ndfFilePath, function(txt) {
        var lines = txt.split("\n");
        $.getJSON("./NDF/NSDO.json", function(json) {
            json.NSDOdata = JSON.parse(lines[1]);
            var stream = fs.createWriteStream('./resources/app/NDF/NSDO.json');
            stream.write(JSON.stringify(json));
            stream.end();
        });
        $.getJSON("./NDF/OPD.json", function(json) {
            json.OPDdata = JSON.parse(lines[2]);
            var stream = fs.createWriteStream('./resources/app/NDF/OPD.json');
            stream.write(JSON.stringify(json));
            stream.end();
        });
    });
    setTimeout(function() {                     //ONLY ISSUE with async functions*****************************************************************
        readNSDO();
        setTimeout(function() {readOPD();}, 2000);
        //setTimeout(function() {ndfLoaded = true;}, 1000);
    }, 2000);
}

//reads the NSDO
function readNSDO() {
    $.getJSON("./NDF/NSDO.json", function(json) {
        var nsdo = json["NSDOdata"];
        for (var a in nsdo) {
            var area = nsdo[a];
            var areaName = a.toString();
            addArea(areaName, false);
            setTimeout(function() { //timeout to let the creation of the area-devices.json complete first
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
                    addDevice(deviceName, dependencies, states, actions, areaName, false);
                }
            }, 200);
        }
    });
}

//reads the OPD
function readOPD() {
    $.getJSON("./NDF/OPD.json", function(json) {
        var opd = json["OPDdata"];
        for (var a in opd) {
            var area = opd[a];
            var areaName = a.toString();
            for (var d in area) {
                var device = area[d];
                var deviceName = d.toString();
                for (var p in device) {
                    var policy = JSON.stringify(device[p]);
                    addPolicy(areaName, deviceName, policy, false);
                }
            }
        }
    });
}
//********************End Loading NDF *****************//

//********************Reading NSRO ********************//
//function to read an NSRO
function readNSRO() {
    $.getJSON(nsroFilePath, function(json) {
        for (var a in json) {
            var area = json[a];
            var areaName = a.toString();
            for (var d in area) {
                var device = area[d];
                var deviceName = d.toString();
                var lastAction = JSON.stringify(device["Last-action"]);
                lastAction = lastAction.replace('\"', '')
                lastAction = lastAction.replace('\"', '')
                var currentState = JSON.stringify(device["State"]);
                currentState = currentState.replace('\"', '')
                currentState = currentState.replace('\"', '')
                updateACU(areaName, deviceName, lastAction, currentState);
            }
        }
    });
}

//update ACU's lastAction and currentState
function updateACU(areaName, deviceName, lastAction, currentState) {
    var area = findArea(areaName);
    var device = findACU(deviceName, area);
    device.lastAction = lastAction;
    device.currentState = currentState;
    alert("Device: " + deviceName + "\nLast Action: " + device.lastAction + "\nCurrent State: " + device.currentState);
}

//********************End Reading NSRO ****************//

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
  addArea($('#areaName').val(), true);
  $('#addAreaForm')[0].reset(); //reset form fields
  $('#areaName').focus();
});

//Adding an area into the network
function addArea(areaName, ndfLoaded) {
  currentNetwork.areaList.push(new Area(areaName));
  //update the slectable list of areas in the add acu form
  $('#areaSelect').empty();
  $('#areaSelect').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect2').empty();
  $('#areaSelect2').append('<option value=\"none\" selected>Select an Area</option>');
  $('#areaSelect3').empty();
  for (var i = 0; i < currentNetwork.areaList.length; i++) {
	  var area = currentNetwork.areaList[i];
	  $('#areaSelect').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect2').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
    $('#areaSelect3').append('<option value="' + area.areaName + '">' + area.areaName +'</option>');
  }

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
  for (var i = 0; i < currentNetwork.areaList.length; i++) {
	  var area = currentNetwork.areaList[i];
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
  var dependencyList = dependencies.split(",");
  var dependenciesReformat = "";
  for (var i = 0; i < dependencyList.length; i++) {
      var dependency = dependencyList[i];
      dependency = dependency.trim();
      dependency = "\"" + dependency + "\"";
      dependenciesReformat += dependency;
      if(i + 1 != dependencyList.length) { dependenciesReformat += ","};
  }
  dependencies = dependenciesReformat;

  var states = $('#deviceStates').val();
  var stateList = states.split(",");
  var statesReformat = "";
  for (var i = 0; i < stateList.length; i++) {
      var state = stateList[i];
      state = state.trim();
      state = "\"" + state + "\"";
      statesReformat += state;
      if(i + 1 != stateList.length) { statesReformat += ","};
  }
  states = statesReformat;

  var actions = $('#deviceActions').val();
  var actionList = actions.split(",");
  var actionsReformat = "";
  for (var i = 0; i < actionList.length; i++) {
      var action = actionList[i];
      action = action.trim();
      action = "\"" + action + "\"";
      actionsReformat += action;
      if(i + 1 != actionList.length) { actionsReformat += ","};
  }
  actions = actionsReformat;

  var areaSelect = $('#areaSelect').val();

  addDevice(deviceName, dependencies, states, actions, areaSelect, true);
$('#deviceName').focus();
});

//Adding a device into the network
function addDevice(deviceName, dependencies, states, actions, areaSelect, ndfLoaded) {
  var tempDevice = new ACU(deviceName, dependencies, states, actions, areaSelect);
  var deviceArea = findArea(areaSelect);
  deviceArea.addACU(tempDevice);

  var date = new Date();
  //function call to add the device to the stored json of devices
  $.getJSON("./json/area_devices/" + deviceArea.areaName + "-devices.json", function(json) {
    var deviceJSON = [date.toLocaleString(), deviceName, states, actions, dependencies];
    json.deviceData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/area_devices/' + deviceArea.areaName + '-devices.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });

  //add to current changes table
    if (ndfLoaded) {
        var description = 'Name: ' + deviceName + '<br/>Area: ' + areaSelect + '<br/>States: ' + states
                        + '<br/>Actions: ' + actions + '<br/>Dependencies: ' + dependencies;
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
  if (currentNetwork.areaList.length == 0) {
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
  var policyArea = $('#policyArea').val();
  var policyDevice = $('#policyDevice').val();
  var policy = "\"Given {" + $('#givenStates').val() + "} associate " + $('#associatedCommand').val() + "\"";
  addPolicy(policyArea, policyDevice, policy, true);
  this.reset();
  $('#policyArea').focus();
});

//Adding a policy to an existing ACU
function addPolicy(policyArea, policyDevice, policy, ndfLoaded) {
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
    }, 100);
}

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
  }, 100);
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

//********************CLEAN WORKSPACE ******************//
//function to clear any data before the session ends
window.onunload = function(){
  clearAreas();
  clearChangesTable();
  clearNSDO();
  clearOPD();
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

//emptys the NSDO json
function clearNSDO() {
    $.getJSON("./NDF/NSDO.json", function(json) {
        json.NSDOdata = [];
        var stream = fs.createWriteStream('./resources/app/NDF/NSDO.json');
        stream.write(JSON.stringify(json));
        stream.end();
    });
}

//emptys the OPD json
function clearOPD() {
    $.getJSON("./NDF/OPD.json", function(json) {
        json.OPDdata = [];
        var stream = fs.createWriteStream('./resources/app/NDF/OPD.json');
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
