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


/* JESS's NEW CODE
//call function to 
$(document).ready(function() {
	$('#choose-network-load').load('./html/modals/login_network.html');
	$("#login").submit(function(e) {
    e.preventDefault();
	userName = $('#userName').val();
	password = $('#password').val();
	//formData = {user_id: userName, password: password, mode: "Lin"};
	});
});

 JESS's New Code
//ReST API sign in calls
$("#loginQuery").click(function(){
	$.ajax({
		type: "PUT",
		url: "http://146.7.11.65:8080/signIn",
		data: formData,
		success: function(data, textStatus, jqXHR){
			if (xhr.status == 200)
			{
				networkSelect();
			}
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
		}
	});
});

//redirect to network selection modal
function networkSelect() {
	//open modal
	$('#login-modal').modal({
		focus: true
	});
	//redirect to home page upon choosing network
	networkName = $('#chooseNetwork').val();
  	$('#homepage-redirect').click(function() {
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	});
	$('#logout').click(function() {
		window.location.reload(true);
	});
}
*/

$(document).ready(function() {
	$('#choose-network-load').load('./html/modals/login_network.html');
	$('#new-account-load').load('./html/modals/new_account.html');
	$("#login").submit(function(e) {
    e.preventDefault();
		login();
	});
});

//modal function to log user into system
function login() {
  userName = $('#userName').val();
  password = $('#password').val();
  networkName = $('#chooseNetwork').val();
  	$('#homepage-redirect').click(function() {
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	});
}


//JESS WORK POINT 11/26
/*
-Do account creation modal
-get temp code for ajax calls
-set network val throughout
*/


/*function network() {
	
	networkName = $('#chooseNetwork').val();
  	$('#homepage-redirect').click(function() {
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	});
}*/

//Function to log out user
$(document).on('click', '#logout-redirect', function(event) {
	userName="";
	networkName="";
	window.location.reload(false);
});