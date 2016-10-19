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

var username = 'generic'; //Variable for logged in user. Default is 'generic'
var networkName = 'network'; //Variable for current network. Default is 'network'
var ndfFile = username + '-' + networkName + '.ndf';
var area = "Area1";
var devices = []; //array to store ACU objects
var areas = []; //array to store ACU objects
console.log(ndfFile); //should show the expected file name in the chrome console


//script that executes once index page is fully loaded
$('document').ready(function() {
  //Populate the Username and Network Fields bassed on Login
  $('#user-name').html('User: ' + username);
  $('#network-name').html('Network: ' + networkName);
});

//class to represent a device that has been added to the network
function Area(name){
  this.name = name;
}

//class to represent a device that has been added to the network
function ACU(name, states, actions, dependencies){
  this.name = name;
  this.states = states;
  this.actions = actions;
  this.dependencies = dependencies;
  //method that prints the info of an added device to the ndf file
  this.printInfo = function printName(stream){
    var info = '\"' + this.name + '\": {\"Dependencies\": [' + this.dependencies + '], \"States\": [' + this.states
    + '], \"Actions\": [' + this.actions + ']}';
    stream.write(info);
  }
}

//Function to construct the NDF file for a user network
function buildNDF(device) {
  var stream = fs.createWriteStream('./Applications/InTUIt/InTUIt.app/Contents/Resources/app/ndf/' + ndfFile);
  stream.write('NDF, ' + username + ', ' + networkName + '\n' + '{\"' + area + '\": {');
  device.printInfo(stream);
  stream.write('}}');
  stream.end();
}

//ADDING A DEVICE INTO NETWORK
function addDevice() {
  var device = new ACU($('#deviceName').val(), $('#deviceStates').val(), $('#deviceActions').val(), $('#deviceDependencies').val());
  devices.push(device);
  buildNDF(device);
}

//ADDING AN AREA INTO NETWORK
function addArea() {
  var area = new Area($('#areaName').val());
  areas.push(area);
}
