/*****************************************************************************************************************
Programmed by: Nick Delamora, Keith Cissell
Description: This file contains the behavior for the visualization of the network
Last Modified: 12/12/2016
******************************************************************************************************************/

// create an array with nodes
var nodes = new vis.DataSet([
]);

var currentNode;

// create an array with edges
var edges = new vis.DataSet([
]);

// create a network
var container = document.getElementById('mynetwork');
var data = {
  nodes: nodes,
  edges: edges
};

//assign behavior and attributes to nodes,edges, and groups
var options = {
  nodes: {
    color: {hover: {border: 'red'}}
  },
  edges: {
    color: 'white',
    width: 3
  },
  groups: {
    acu: {
      shape: 'oval',
      color: {background:'#0275d8',border:'white'},
      font: {}
    },
    areas: {
      shape: 'circle',
      color: {background:'#666666',border:'white',
                highlight: {background:'white',border:'#666666'}
              },
      font: {size: 25, color: 'black'}
    }
  },
  interaction: {
    hover: true,
    keyboard: true,
    navigationButtons: true
  }
};

var network = new vis.Network(container, data, options);

//function that reacts to selecting a node
network.on('select', function(params) {
      $('#selection').empty();
      if(params.nodes.length > 0){
        if(findArea(nodes.get(params.nodes)[0].label) != null){
          currentNode = findArea(nodes.get(params.nodes)[0].label);
          $('#selection').append("Area Name: " + currentNode.areaName + "<br>Number of ACUS: " + currentNode.acuList.length);
        }
        else {
          currentNode = findACU(nodes.get(params.nodes)[0].label, findArea(getNodeArea(nodes.get(params.edges)[0].id)));
          var info = "Area: " + currentNode.area + "<br>ACU: " + currentNode.acuName + "<br>Current State: " + currentNode.currentState + "<br>Last Action: " + currentNode.lastAction + "<br>Policies:";
          for (var p in currentNode.policyList) {
            info = info + "<br>" + currentNode.policyList[p].policy;
          }
          $('#selection').append(info);
        }
      }
      else if(params.edges.length > 0) {
        $('#selection').append('Edge: ' + params.edges);
      }
});

function addDeviceNode(name, area){
  nodes.add({id:area + '-' + name, label:name, group:'acu'});
  edges.add({from: area + '-' + name, to: area, id:area + '-' + name})
  network.redraw();
  network.fit();
}

function addAreaNode(name){
  nodes.add({id:name, label:name, group:'areas'});
  network.redraw();
  network.fit();
}

function removeDeviceNode(name, area){
  nodes.remove({id:area + '-' + name});
  edges.remove({id:area + '-' + name})
  network.redraw();
  network.fit();
  $('#selection').empty();
}

function removeAreaNode(name){
  var area = findArea(name);
  for (var i = 0; i < area.acuList.length; i++){
    nodes.remove({id: name + '-' + area.acuList[i].acuName});
    edges.remove({id: name + '-' + area.acuList[i].acuName})
  }
  nodes.remove({id: name});
  network.redraw();
  network.fit();
  $('#selection').empty();
}

function getNodeArea(string){
  var area = "";
  for(var i = 0; string[i] != "-"; i++){
    area += string[i];
  }
  return area;
}
