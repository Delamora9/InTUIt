/*****************************************************************************************************************
Programmed by: Christopher Franklyn, Jess Geiger
Description: This file contains important functions and resources for the entire UI, including cloud storage info,
             functions for interacting with the cloud service, and code dealing with IPMS settings (interval, etc.
Last Modified: 10/14/2016
******************************************************************************************************************/

//this command loads jquery properly
window.$ = window.jQuery = require('./js/jquery.min.js');
//for file system reading/writing
var fs = require('fs');

var compesIP = 'http://146.7.44.180:8080'; //vGV for the current IP of compes

var userName; //Variable for logged in user. Default is 'generic'
var networkName; //Variable for current network. Default is 'network'
var formData;
var password; //Password of user for login


$(document).ready(function() {
	$('#choose-network-load').load('./html/login_network.html');
	$('#new-account-load').load('./html/new_account.html');
	$("#login").submit(function(e) {
		e.preventDefault();
	});
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

//Function to create new account
$(document).on('click', '#newAccount-redirect', function() {
	userName = $('#newUser').val();
	password = $('#newPassword').val();
	//ajax call to create user/password pair
	$.ajax({
		url: compesIP + '/signIn?' + $.param({"userID": userName, "mode": "Sup"}),
		method:'PUT',
		data: {userPass: password},
		success: function(data, status, xhttp){
			alert(data);
			window.location.reload(false);
		},
		error: function(data, status, xhttp)
		{
			alert(data);
		}
	});
});

//Function to log out user
$(document).on('click', '#logout-redirect', function(event) {
	$.ajax({
		url: compesIP + '/signIn?' + $.param({"userID": userName, "mode": "Lout"}),
		method:'PUT',
		data: {userPass: password},
		success: function(data, xhr){
			alert(data); //tells you that you logged out
			window.location.reload(false);
		},
		error: function(xhr, data, errorThrown)
		{
			alert(data);
		}
	});
});

//Start of Function calls to log in user
function loginQuery() {
	userName = $('#userName').val();
	password = $('#password').val();

	//WORKING AJAX --SIGN in
	$.ajax({
		url: compesIP + '/signIn?' + $.param({"userID": userName, "mode": "Lin"}),
		method: 'PUT',
		data: {userPass: password},
		success: function(data, status, xhttp){
			if (data == "Invalid User-ID: Either not logged in or not registered") {
				alert("Incorrect username or password");
				window.location.reload(false);
			} else {
				alert(data);
				listNetworks();
			}
		},
		error: function(data, status, xhttp)
		{
			alert('no login work');
		}
	});
	//Function to call and populate dropdown list of networks

}

function listNetworks() {
	//get user profile. an associative array that has userID, networkID, etc
	var networks;
	$.ajax({
		url: compesIP + '/users',
		method:'GET',
		success: function(data, xhr){
			var userprof = JSON.parse(data);
			networks = userprof["Provisioned-Networks"];
			selectNetwork(networks);
		},
		error: function(xhr, data, errorThrown)
		{
			alert(data); //all these error throws will just be debugging. the user should never see them
		}
	});
}

function selectNetwork(networks){
	$('#networks').empty();
	$('#networks').append('<option value="new">Create New...</option>');
	for (i = 0; i < networks.length; i++)
	{
		var name = networks[i];
		var x = document.getElementById("networks");
		var c = document.createElement("option");
		c.text = name;
		x.options.add(c, (i-1));
	}
	$('#networks>option[value=new]').insertBefore($('select[id=networks]').find('option:eq(0)'))
	$("#network-modal").modal({backdrop: 'static', keyboard: false});
}

function ndfQuery() {
	//set networkName
	var networkName = document.getElementById('networks').value;
	if (networkName == 'new') {
		networkName = $('#newNetwork').val();
		alert('create new network!');
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName + '&newUser=true';
	} else {
		//get NDF based on networkName
		$.ajax({
			url: compesIP + '/NDF?' + $.param({"netID": networkName}), //put network ID here
			method:'GET',
			success: function(data, xhr){
				var ndfData = data.split('\n');
				var stream = fs.createWriteStream('./resources/app/ndf/' + userName + "-" + networkName + '.ndf');
				for (var i = 0; i < ndfData.length; i++) {
					stream.write(ndfData[i] + '\n');
				}
				stream.end();
				alert('NDF recieved. Redirecting to network!');
									window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName + '&newUser=false';
			},
			error: function(data, status, xhr)
			{
				alert('no redirect no network!');
				alert((data));
			}
		});
	}
}
