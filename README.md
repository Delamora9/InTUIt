# InTUIt User Interface


## Technologies
	*Electron 1.40: This is the executable framework that we used to create InTUIt
		**All associated codes that we wrote can be found in electron's source folder: 
			InTUIt/InTuit-gui/resources/app
	*Bootstrap v4.0.1 Alpha
	*jQuery v3.0.0
	*jQuery DataTables 1.10.12: for data display
	*vis.js v4.17.0: For network visualization

	
## Setup

InTUIt is only operable from a windows machine. No other operating system is supported at this time.
To properly run InTUIt, direct to the InTUIt/InTUIt-gui folder in the project directory and select InTUIt.exe

InTUIt can be distributed through a hosted download, or copied onto another machine.


## Logging in to InTUIt

This UI is dependent on the CoMPES server; therefore a loggin is required to provision a netowrk over
the IoT. Upon firing of InTUIt.exe, you will be brought to the loggin page to either create a new user
or loggin to an existing user. 

Once you have created an account and are logged in, a modal will pop up prompting you to either select
a network that you have already made, or create a new one and type in the desired name for that network.

You should recieve an alert that the network has been created (new network) or that the 
network definition file (ndf) has been recieved for the network that you have already made.
	*The ndf file will be created and stored in InTUIt/InTuit-gui/resources/app/ndf


## Editing of Network

Once logged in, you will be redirected to the homepage of InTUIt in which a blank slate network will be
created or your existing network will load into the visualization.

To edit the network, there will be a sidebar of buttons available to edit the network as you would like.
When they are clicked, a modal will appear with the steps of necessary input to create a new network object
or delete one.
	*NOTE: As of this version of InTUIt, there is no limit to characters or string checking that takes 
	       place on user input. The user must know the capabilities of their devices


Once an edit is put through the Current Changes tab located in the main window will update the table with
your last change, you should also see that chage represented in the visualization.

In order for the chage to be provisioned by CoMPES, the user must hit the submit button to submit the new
NDF file to CoMPES for provisioning. The Current Changes tab will then be cleared of its data and a 
timestamp will be provided for the user below the submit button.


## Visualization

The visualization of the network is done through the view network tab. Areas and ACUs are represented
as nodes on a graph. When you click on one of the area's or ACUs, the information about that network
object will be displayed below the network graph.

*Current Status: The current status and last action of the devices that are provisioned within the 
network are being pulled through the Network State Representational Object (NSRO) that InTUIt requests 
from CoMPES every second. This information is also displayed below the network graph.


## Logging Out

When the user is inactive on the homepage for 15 minutes, they are automatically logged out, otherwise
the user will need to select the log out button in the top right of the UI to log out fully. Closing
the window will not log the user out from CoMPES.

InTUIt will prompt the user to submit any unsaved changes before they log out of the UI.


## Deleting A User or Network

From the settings drop down below the edit buttons, a user can delete the network they are on, or 
delete the entire user from the CoMPES system.


#Known Bugs/Limitations

-Currently, there is a bug in switching between networks when logged in to the homepage of another
network. Variables are not passed correctly and it throws the program into an error state.

-Within the internal JSON file storage, there is a bug where the files do not get cleared upon log out,
 they only get cleared when the window is closed out of on the homepage.
 
-There is no fast way to edit added devices and areas without deleting and re-creating them. This was
 an original endeavor, but turned out to be a very large task and had to be struck out in order for 
 us to finish.
 
-There are times when the delay put on our synchronus calls are not enough depending on the speed of
 the user's machine. This can cause reload notifications for the DataTables, and they upon the next
 refresh, the data will be accurate.