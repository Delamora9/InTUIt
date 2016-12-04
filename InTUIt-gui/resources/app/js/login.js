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

var userName; //Variable for logged in user. Default is 'generic'
var networkName; //Variable for current network. Default is 'network'
var formData;
var password; //Password of user for login


$(document).ready(function() {
	$('#choose-network-load').load('./html/modals/login_network.html');
	$('#new-account-load').load('./html/modals/new_account.html');
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
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": userName, "mode": "Sup"}),
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
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": userName, "mode": "Lout"}),
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

function loginQuery() {
	userName = $('#userName').val();
	password = $('#password').val();
	
	//WORKING AJAX --SIGN in
	$.ajax({
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": userName, "mode": "Lin"}),
		method: 'PUT',
		data: {userPass: password},
		success: function(data, status, xhttp){
			console.log(data);
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
	$("#network-modal").modal();
}

function ndfQuery() {
	//set networkName
	var networkName = document.getElementById('networks').value;
	console.log(networkName + '!');
	if (networkName == 'new') {
		networkName = $('#newNetwork').val();
		$.ajax({
			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": networkName}), //put network ID here
			method:'GET',
			success: function(data, status, xhttp){
				window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
			},
			error: function(data, status, xhttp)
			{
				alert('There has been an Ajax error');
			}
		});
	} else {
		//get NDF based on networkName
		$.ajax({
			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": networkName}), //put network ID here
			method:'GET',
			success: function(data, status, xhttp){
				var ndfData = data.split('\n');	
				var stream = fs.createWriteStream('./resources/app/ndf/' + userName + "-" + networkName);
				for (var i = 0; i < ndfData.length; i++) {
					stream.write(ndfData[i] + '\n');
				}
				stream.end();
				//data is the received NDF. it's a giant string (with newline characters)
				window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
			},
			error: function(data, status, xhttp)
			{
				console.log(typeof data);
				alert((data));
			}
		});
		//redirect to page
		//
	}
}