/*****************************************************************************************************************
Programmed by: Ketih Cissell
Description: This file contains the class structure that makes up a Network. There are 4 classes: Network, Area,
             ACU, Policy. The classes are structured as objects which contain other objects. A Network contains
             Areas; Areas contain ACUs; ACUs contain Policies.
Last Modified: 11/5/2016
******************************************************************************************************************/


/*Network Class*****************************************************************
This class represents the currently chosen Network. It is the highest container
in the class structure. Its primary purpose is to hold any Areas of the Network.
*******************************************************************************/
var Network = function (networkName, userName) {
  // VARIABLES
    this.networkName = networkName;
    this.userName = userName;
    this.areaList = new Array(); //Array of all areas in the Network

  // METHODS
    this.addArea = function addArea(Area) {
        this.areaList.push(Area);
    }

    this.removeArea = function removeArea(areaName) {
        for(var i = 0; i < this.areaList.length; i++) {
            if(this.areaList[i].areaName == areaName)
                this.areaList.splice(i, 1);
        }
    }

    /* Unsure if this will be possible
    this.getArea = function getArea(areaName) {
        for(var i = 1; i < this.areaList.length; i++) {
            if(this.areaList[i].areaName == areaName)
                return this.areaList[i];
        }
    }
    */

    this.hasPolicy = function hasPolicy() {
        for(var i = 0; i < this.areaList.length; i++) {
            if(this.areaList[i].hasPolicy()) { return true; }
        }
        return false;
    }

    this.printNetwork = function printNetwork() {
        var networkString = "";
        if (this.areaList.length > 0) {
            networkString += "{";
            for (var i; i < this.areaList.length; i++) {
                networkSting += this.areaList[i].printArea();
                if (i + 1 != this.areaList.length) { networkString += ', '; }
            }
            networkString += "}";
        }
        return networkString;
    }

    this.printNetworkPolicies = function printNetworkPolicies() {
        var networkPolicyString = "";
        if (this.hasPolicy()) {
            networkPolicyString = "{";
            for (var i; i < this.areaList.length; i++) {
                if(this.areaList[i].hasPolicy()) {
                    networkPolicyString += this.areaList[i].printAreaPolicies();
                }
                if(this.areaList[i+1].hasPolicy()) { networkPolicyString += ", "; }
            }
            networkPolicyString += "}";
        }
        return networkPolicyString;
    }
}


/*Area Class*******************************************************************
This class represents an Area contained within a Netowrk. Its primary purpose
is to hold any ACUs within the Area.
******************************************************************************/
var Area = function (areaName) {
  // VARIABLES
    this.areaName = areaName;
    this.acuList = new Array(); //Array of all ACUs in the Area

  // METHODS
    this.addACU = function addACU(acu) {
        this.acuList.push(acu);
    }

    this.removeACU = function removeACU(acuName) {
        for(var i = 0; i < this.acuList.length; i++) {
            if(this.acuList[i].acuName == acuName)
                this.acuList.splice(i, 1);
        }
    }

    this.hasPolicy = function hasPolicy() {
        for (var i = 0; i < this.acuList.length; i++) {
            if (this.acuList[i].hasPolicy()) { return true; }
        }
        return false;
    }

    this.printArea = function printArea() {
        var areaString = "\"" + this.areaName + "\" :{";
        for (var i = 0; i < this.acuList.length; i++) {
            areaString += this.acuList[i].printACU();
            if (i + 1 < this.acuList.length) { areaString += ", "; }
        }
        areaString += "}";
        return areaString;
    }

    this.printAreaPolicies = function printAreaPolicies() {
        var areaPolicyString = "\"" + this.areaName + "\": {";
        for (var i = 0; i < this.acuList.length; i++) {
            if(this.acuList[i].hasPolicy()) {
                areaPolicyString += this.acuList[i].printACUPolicies();
            }
            //if(this.acuList[i+1].hasPolicy()){ areaPolicyString += ", "; } errors out the build of ndf
        }
        areaPolicyString += "}"
        return areaPolicyString;
    }
}



/*ACU Class********************************************************************
(ACU) This class represents a device that is connected to the Network. An ACU
has the ability to hold any Policies that are associated to it.
******************************************************************************/
var ACU = function (acuName, dependencies, states, actions, area) {
  // VARIABLES
    this.acuName = acuName;
    this.dependencies = dependencies;
    this.states = states;
    this.actions = actions;
    this.area = area;
    this.policyList = new Array(); //Array of all Policies associated to ACU

  // METHODS
    this.addPolicy = function addPolicy(Policy) {
        this.policyList.push(Policy);
    }

    //this.removePolicy = function removePolicy(policyName...

    this.hasPolicy = function hasPolicy() {
        return this.policyList.length > 0;
    }

    this.printACU = function printACU() {
        return "\"" + this.acuName + "\": {\"Dependencies\": [" +
               this.dependencies + "], \"States\": [" + this.states +
               "], \"Actions\": [" + this.actions + "]},";
    }

    this.printACUPolicies = function printACUPolicies() {
        var acuPolicyString = "\"" + this.acuName + "\": [";
        for (var i = 0; i < this.policyList.length; i++) {
            acuPolicyString += this.policyList[i].printPolicy();
            if (i + 1 == this.policyList.length) { acuPolicyString += ", "; }
        }
        acuPolicyString += "]"
        return acuPolicyString;
    }
}



/*Policy Class*****************************************************************
This class represents a Policy that is being enforced on the Network. A Policy
is associated to a specific ACU.
******************************************************************************/
var Policy = function (area, device, givenStates, command) {
  // VARIABLES
    this.area = area;
    this.device = device;
    this.givenStates, givenStates;
    this.command = command;

  // METHODS
    this.printPolicy = function printPolicy() {
        return "\"Given {" + givenStates + "} associate " + command + "\"";
    }
}
