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
		console.log('new');
		document.getElementById('newNetwork').disabled=false;
	} else {
		console.log('not new');
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
			//ajax call to create network
			/*
				window.location='homepage.html?userName=' + userName +'&networkName=' + networkName;
			*/
		},
		error: function(data, status, xhttp)
		{
			//alert(data);
		}
	});
});

//Function to log out user
$(document).on('click', '#logout-redirect', function(event) {
	$.ajax({
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": "user", "mode": "Lout"}),
		method:'PUT',
		data: {userPass: '12345'},
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
	//WORKING AJAX --SIGN UP
	$.ajax({
		url: 'http://146.7.44.180:8080/signIn?' + $.param({"userID": "Team05", "mode": "Lin"}),
		method: 'PUT',
		data: {userPass: 'csc450'},
		success: function(data, status, xhttp){
			alert(data);
		},
		error: function(data, status, xhttp)
		{
			alert(data);
		}
	});
	//AJAX --USER PROFILE
	$.ajax({
		url: 'http://146.7.44.180:8080/users',
		method: 'GET',
		success: function(data, xhttp) {
			alert(data);
		},
		error: function(data, xhttp)
		{
			alert(data);
		}
	});
	//Function to call and populate dropdown list of networks
	function listNetworks() {
		//get user profile. an associative array that has userID, networkID, etc
		$.ajax({
			url: 'http://146.7.44.180:8080/users',
			method:'GET',
			success: function(data, xhr){
				alert(data); //returns a JSON array that has all the user's credentials and network info
			},
			error: function(xhr, data, errorThrown)
			{
				alert(data); //all these error throws will just be debugging. the user should never see them
			}
		});
		var networks[] = data["Provisioned-Networks"];
		for (int i = 0; i < networks.length(); i++)
		{
			var name = networks[i];
			var x = document.getElementById("networks");
			var c = document.createElement("option");
			c.text = name;
			x.options.add(c, (i-1));
		}
		$("#network-modal").modal();
	}
	
	//set networkName
	networkName = document.getElementById('networks').value;
	if (networkName == 'new') {
		//create network function
		/*
		*/
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	} else {
		//get NDF based on networkName
		$.ajax({
			url: 'http://146.7.44.180:8080/NDF?' + $.param({"netID": networkName}), //put network ID here
			method:'GET',
			success: function(data, xhr){
				alert(data);
				//data is the received NDF. it's a giant string (with newline characters)
			},
			error: function(xhr, data, errorThrown)
			{
				alert(data);
			}
		});
		//redirect to page
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	}	
}