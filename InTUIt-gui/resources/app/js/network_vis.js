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
      $('#editAreaName').empty();
      $('#editDeviceName').empty();
      $('#editDeviceStates').empty();
      $('#editDeviceActions').empty();
      $('#editDeviceDependencies').empty();
      if(params.nodes.length > 0){
        if(findArea(nodes.get(params.nodes)[0].label) != null){
          currentNode = findArea(nodes.get(params.nodes)[0].label);
          $('#selection').append("Area: " + currentNode.areaName + "<button type=\"button\" id=\"edit-area-button\" class=\"btn btn-primary btn-sm btn-block\"data-toggle=\"modal\" data-target=\"#edit-area-modal\">Edit Area</button>");
          $('#editAreaName').append("<label for=\"areaNameOptions\">AreaName:</label><select class=\"form-control\" id=\"areaNameOptions\"><option value=\"" + currentNode.areaName + "\"selected>" + currentNode.areaName + "</option><option>Other</option><br><div id=\"newAreaName\"></div>");
        }
        else {
          currentNode = findACU(nodes.get(params.nodes)[0].label, findArea(getNodeArea(nodes.get(params.edges)[0].id)));
          $('#selection').append("Area: " + currentNode.area + "\t ACU: " + currentNode.acuName + "<button type=\"button\" id=\"edit-device-button\" class=\"btn btn-primary btn-sm btn-block\"data-toggle=\"modal\" data-target=\"#edit-device-modal\">Edit Device</button>");
          $('#editDeviceName').append("<label for=\"deviceNameOptions\">Device Name:</label><select class=\"form-control\" id=\"deviceNameOptions\"><option value=\"" + currentNode.acuName + "\" selected>" + currentNode.acuName + "</option><option value=\"Other\">Other</option></select><br><div id=\"newName\"></div>");
          $('#editDeviceStates').append("<label for=\"deviceStatesOptions\">Possible Device States:</label><select class=\"form-control\" id=\"deviceStatesOptions\"><option value = \"" + currentNode.states + "\" selected>" + currentNode.states + "</option><option value=\"Other\">Other</option></select><br><div id=\"newStates\"></div>");
          $('#editDeviceActions').append("<label for=\"deviceActionsOptions\">Device Actions:</label><select class=\"form-control\" id=\"deviceActionsOptions\"><option value = \"" + currentNode.actions + "\" selected>" + currentNode.actions + "</option><option value=\"Other\">Other</option></select><br><div id=\"newActions\"></div>");
          $('#editDeviceDependencies').append("<label for=\"deviceDependenciesOptions\">Functional Dependencies:</label><select class=\"form-control\" id=\"deviceDependenciesOptions\"><option value = \"" + currentNode.dependencies + "\" selected>" + currentNode.dependencies + "</option><option value=\"Other\">Other</option></select><br><div id=\"newDependencies\"></div>");
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
    nodes.remove({id: area.acuList[i].acuName});
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
