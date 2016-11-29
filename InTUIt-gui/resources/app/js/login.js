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
		login();
	});
});

//modal function to log user into system
function login() {
  userName = $('#userName').val();
  password = $('#password').val();
  	$('#homepage-redirect').click(function() {
		networkName = document.getElementById('networks').value;
		window.location='./homepage.html?userName=' + userName +'&networkName=' + networkName
	});
}

//Function to create new account
$(document).on('click', '#newAccount-redirect', function() {
	userName = $('#newUser').val();
	password = $('#newPassword').val();
	networkName = $('#newNetwork').val();
	window.location='homepage.html?userName=' + userName +'&networkName=' + networkName;
});

//Function to log out user
$(document).on('click', '#logout-redirect', function(event) {
	userName="";
	networkName="";
	window.location.reload(false);
});