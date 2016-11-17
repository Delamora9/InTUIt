  // create an array with nodes
  var nodes = new vis.DataSet([
    /*{id: 'Area1', label: 'Area1', group: 'areas'},
    {id: 'Area2', label: 'Area2', group: 'areas'},
    {id: 'Area3', group: 'areas'},
		{id: 'ACU1', group: 'acu'},
		{id: 'ACU2', group: 'acu'},
		{id: 'ACU3', group: 'acu'},
		{id: 'ACU4', group: 'acu'},
		{id: 'ACU5', group: 'acu'},
		{id: 'ACU6', group: 'acu'},
		{id: 'ACU7', group: 'acu'},
		{id: 'ACU8', group: 'acu'},
		{id: 'ACU9', group: 'acu'},
		{id: 'ACU10', group: 'acu'},
		{id: 'ACU11', group: 'acu'},
		{id: 'ACU12', group: 'acu'}*/
  ]);

  // create an array with edges
  var edges = new vis.DataSet([
    {from: 'Area1', to: 'Area2', id: 'Area1-Area2'},
    /*{from: 1, to: 3, id: 'Area1-Area3'},
    {from: 2, to: 3, id: 'Area2-Area3'},
   	{from: 1, to: 4, id: 'Area1-ACU1'},
		{from: 1, to: 5, id: 'Area1-ACU2'},
		{from: 1, to: 6, id: 'Area1-ACU3'},
		{from: 2, to: 7, id: 'Area2-ACU4'},
		{from: 2, to: 8, id: 'Area2-ACU5'},
		{from: 2, to: 9, id: 'Area2-ACU6'},
		{from: 2, to: 10, id: 'Area2-ACU7'},
		{from: 2, to: 11, id: 'Area2-ACU8'},
		{from: 2, to: 12, id: 'Area2-ACU9'},
		{from: 3, to: 13, id: 'Area3-ACU10'},
		{from: 3, to: 14, id: 'Area3-ACU11'},
		{from: 3, to: 15, id: 'Area3-ACU12'},*/
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
          $('#selection').append('Node: ' + nodes.get(params.nodes)[0].label);
        }
        else if(params.edges.length > 0) {
          $('#selection').append('Edge: ' + params.edges);
        }
        else {
          $('#selection').append($('#panelTitle').html());
        }
  });

  function addDeviceNode(name, area){
    nodes.add({id:name, label:name, group:'acu'});
    edges.add({from: name, to: area, id:area + '-' + name})
    network.redraw();
    network.fit();
  }

  function addAreaNode(name){
    nodes.add({id:name, label:name, group:'areas'});
    network.redraw();
    network.fit();
  }
