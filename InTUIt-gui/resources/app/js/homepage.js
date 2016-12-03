/*****************************************************************************************************************
Programmed by: Christopher Franklyn
Description: This file contains important functions and resources for the entire UI, including cloud storage info,
             functions for interacting with the cloud service, and code dealing with IPMS settings (interval, etc.
Last Modified: 9/19/2016
******************************************************************************************************************/

//this command loads jquery properly
window.$ = window.jQuery = require('./js/jquery.min.js');
//for file system reading/writing
var fs = require('fs');
//for query string parsing
var qs = require('querystring');

var username = 'generic'; //Variable for logged in user. Default is 'generic'
var networkName = 'network'; //Variable for current network. Default is 'network'

var areaList = new Array(); //Array of all areas in the Network
var deviceList = new Array(); //Array of all ACUs in the Network

var deviceTable;


//Network Class----------------------------------------------------------------
var Network = function (networkName) {
    this.networkName = networkName;
    this.areaList = new Array(); //Array of all areas in the Network

    this.addArea = function addArea(Area) {
        this.areaList.push(Area);
    }

    this.printNetwork = function printNetwork() {
        var areaString = "{"
        for (var i; i < currentNetwork.areaList.length; i++) {
            areaString += this.areaList[i].printArea();
        }
        areaString += "}";
    }

    this.printNetworkPolicies = function printNetworkPolicies() {
        var areaString = "{"
        for (var i; i < currentNetwork.areaList.length; i++) {
            areaString += this.areaList[i].printAreaPolicies();
        }
        areaString += "}";
    }
}
//-----------------------------------------------------------------------------

//Area Class-------------------------------------------------------------------
var Area = function (areaName) {
    this.areaName = areaName;

    this.acuList = new Array(); //Array of all ACUs in the Area


    this.addACU = function addACU(acu) {
        this.acuList.push(acu);
    }

    this.printArea = function printArea() {
        var areaString = "\"" + this.areaName + "\" :{";
        for(var i = 0; index < acuList.length; i++){
            areaString += acuList[i].printACU();
        }
        areaString += "}"
        return areaString;
    }

    this.printAreaPolicies = function printAreaPolicies() {
        var areaString = "\"" + this.areaName + "\" :{";
        for(var i = 0; index < acuList.length; i++){
            areaString += acuList[i].printACUPolicies();
        }
        areaString += "}"
        return areaString;
    }
}
//-----------------------------------------------------------------------------

//ACU Class--------------------------------------------------------------------
var ACU = function (name, states, dependencies, actions) {
    this.name = name;
    this.states = states;
    this.dependencies = dependencies;
    this.actions = actions;
    this.area = 'areaName'; //temporarily hard coded in

    this.policyList = new Array(); //Array of all Policies associated to ACU

    this.addPolicy = function addPolicy(Policy) {
        this.policyList.push(Policy);
    }

    this.printACU = function printACU(){
        return "\"" + this.name + "\":{\"states\": [" + this.states + "], \"actions\": [" + this.actions +
		"], \"dependencies\": [" + this.dependencies + "]}";
    }

    this.printACUPolicies = function printACUPolicies() {
        var ACUString = "\"" + this.name + "\" :[";
        for(var i = 0; index < policyList.length; i++){
            ACUString += policyList[i].printPolicy();   //*****Coma Syntax Error for NDF*****
        }
        ACUString += "]"
        return areaString;
    }
}
//-----------------------------------------------------------------------------

//Policy Class-----------------------------------------------------------------
var Policy = function (area, device, givenStates, command) {
    this.area = area;
    this.device = device;
    this.givenStates, givenStates;
    this.command = command;

    this.printPolicy = function printPolicy() {
        return "\"Given {" + givenStates + "} associate " + command + "\"";
    }

    //Display function for possible 'Pending Commands' implimentation
    this.displayPolicy = function displayPolicy(){
        return "\"" + area + "\" :{\"" + device + "\": [\"Given {" + givenStates +
            "} associate " + command + "\"]}";
    }
}
//-----------------------------------------------------------------------------


//script that executes once index page is fully loaded
$(document).ready(function() {
  var queryString = window.location.search
  username = getQueryVariable('userName', queryString);
  networkName = getQueryVariable('networkName', queryString);
  var ndfFilename = username + '-' + networkName + '.ndf'; //file name to write NDF to

  
  //Populate the Username and Network Fields bassed on Login
  $('#user-name').html('User: ' + username);
  $('#network-name').html('Network: ' + networkName);
  $('#changes').load('./html/current_changes.html');
  $('#add-area-load').load('./html/modals/add_area.html');
  $('#add-device-load').load('./html/modals/add_device.html');
  $('#add-policy-load').load('./html/modals/create_policy.html');
  $('#rm-area-load').load('./html/modals/remove_area.html');
  $('#logout-modal-load').load('./html/modals/logout-modal.html');
  $('#network-modal-load').load('./html/modals/login_network.html');
  $('#delete-modal-load').load('./html/modals/delete_modal.html');
  
  $('#offcanvasleft').click(function() {
  $('.row-offcanvas-left').toggleClass('active');
});

$('[data-toggle=offcanvasright]').click(function() {
  $('.row-offcanvas-right').toggleClass('active');
});

  $('#addDeviceFor').submit(function(e){
    console.log('test');
    e.preventDefault(); //prevent form from redirect
    setTimeout(function(){ //allow addDevice to execute before refresh
      deviceTable.ajax.reload();
      $('#addDeviceForm')[0].reset();
    }, 100);
    addDevice();
  });

  $('#addAreaForm').submit(function(e){
    console.log("test");
    e.preventDefault(); //prevent form from redirect
    this.reset(); //resets the fields within the form
  });
});

//Function to construct the NDF file for a user network
$('#submitNDF').click(function buildNDF() {
  console.log("button works");
  var stream = fs.createWriteStream('./resources/app/ndf/' + ndfFilename);
  stream.write(username + ', ' + networkName + '\n');
  for (var i; i < areaList.length; i++) {
    stream.write(i.printArea());
  }
  stream.end();
});

//Function to change network
$(document).on('click', '#networkQuery', function(event) {
	var queryString = window.location.search;
	userName = getQueryVariable('userName', queryString);
	networkName = document.getElementById('networks').value;	
	if (networkName == 'new') {
		var networkName = document.getElementById('newNetwork').value;
		//AJAX CALL TO CREATE NETWORK
		/*
		*/
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	} else {
		//AJAX TO GET NEW NDF
		$.ajax({
			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": "currentSelectedNetworkName"}), //put network ID here
			method:'GET',
			success: function(data, xhr){
				alert(data);
				//data is the recieved NDF. it's a giant string (with newline characters)
			},
			error: function(xhr, data, errorThrown)
			{
				alert(data);
			}
		});
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
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

//ADDING A DEVICE INTO NETWORK
function addDevice() {
  var tempDevice = new ACU($('#deviceName').val(), $('#deviceStates').val(), $('#deviceDependencies').val(), $('#deviceActions').val());
  deviceList.push(tempDevice); //Adds device to JS array of device objects
  var date = new Date();

  //function call to add the device to the stored json of devices
  $.getJSON("./json/devices.json", function(json) {
    console.log(json); // this will show the info it in firebug console
    var deviceJSON = [date.toLocaleString(), $('#deviceName').val(), $('#deviceStates').val(), $('#deviceActions').val(), $('#deviceDependencies').val()];
    json.tableData.push(deviceJSON);
    var stream = fs.createWriteStream('./resources/app/json/devices.json');
    stream.write(JSON.stringify(json));
    stream.end();
  });
}

//ADDING AN AREA INTO NETWORK
function addArea() {
  var tempArea = new Area($('#areaName').val());
  areaList.push(tempArea); //Adds area to JS array of area objects
}

//Create Device Datatable when button to summon modal is clicked
$('#add-device-button').click(function() {
  if (!($.fn.dataTable.isDataTable('#deviceTable'))){ //if the datatable isn't created, make it
    deviceTable = $('#deviceTable').DataTable({
  	  "paging": true,
  	  "iDisplayLength": 5,
      "lengthMenu": [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
      "responsive": true,
      "autoWidth": false,
      "order": [[0, 'desc']],
      "columns": [
          { "width": "12%" },
          { "width": "15%" },
          { "width": "20%" },
          { "width": "28%" },
          { "width": "25%" }
      ],
  	  "ajax": {
  	    "url": './json/devices.json',
  		  "dataSrc": 'tableData'
  	  }
    });
  }
});

//enables-disables the new network name field
function enableNewNetwork()
{
	if (document.getElementById('networks').value === 'new') {
		document.getElementById('newNetwork').disabled=false;
	} else {
		document.getElementById('newNetwork').disabled=true;
	}
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

//Function to call and populate dropdown list of networks
function listNetworks() {
	//get user profile. an associative array that has userID, networkID, etc
	var networks;
	$.ajax({
		url: 'http://146.7.44.180:8080/users',
		method:'GET',
		success: function(data, xhr){
			alert(data); //returns a JSON array that has all the user's credentials and network info
			var userprof = JSON.parse(data);
			console.log(userprof["Provisioned-Networks"][0]);
			networks = userprof["Provisioned-Networks"];
			console.log(networks);
			selectNetwork(networks);
			/*for (var i = 0; i < userprof["Provisioned-Networks"].length; i++)
			{
				networks[i] = userprof["Provisioned-Networks"][i];
			}*/
		},
		error: function(xhr, data, errorThrown)
		{
			alert(data); //all these error throws will just be debugging. the user should never see them
		}
	});
}


//FUNCTION TO DELETE USER/NETWORK
function deleteSomething() {
	//Delete current network
	if ($("input[name=deleteObj]:checked").val() == 'network')
	{
		//delete NDF. reminder that the user is assumed to be logged in
		$.ajax({
			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": "currentSelectedNetworkName"}), //put network ID here
			method:'DELETE',
			success: function(data, status, xhttp){
				alert(data); //tells the user that the NDF was de-provisioned
				window.location.href="./loginIndex.html";
			},
			error: function(xhr, data, errorThrown)
			{
				alert(data);
			}
		});
	}
	//AJAX to delete current user
	else if ($("input[name=deleteObj]:checked").val() == 'user') {
		console.log('delete a user!');
		$.ajax({
			url: 'http://146.7.44.180:8080/signIn',
			method:'DELETE',
			success: function(data, status, xhttp){
				alert(data); //the user was deleted
				window.location.href="./loginIndex.html";
			},
			error: function(data, status, xhttp)
			{
				alert(data);
			}
		});
	} else {
		console.log('dont touch me!');
		//error
	}
};

//load user profile ajax call
$(document).on('click', '#logout-redirect', function(event) {
	$.ajax({
		url: 'http://146.7.44.180:8080/users',
		method:'GET',
		success: function(data, status, xhttp){
			alert(data); //returns a JSON array that has all the user's credentials and network info
			var userprof = JSON.parse(data);
			var pass = (userprof["Password"]);
			console.log(pass);
			logout(pass);
		},
		error: function(data, status, xhttp)
		{
			alert(data); //all these error throws will just be debugging. the user should never see them
		}
	});
});