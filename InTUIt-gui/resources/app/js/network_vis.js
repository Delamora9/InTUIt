
  // create an array with nodes
  var nodes = new vis.DataSet([
    {id: 1, label: 'Area1', group: 'areas'},
    {id: 2, label: 'Area2', group: 'areas'},
    {id: 3, label: 'Area3', group: 'areas'},
		{id: 4, label: 'ACU1', group: 'acu'},
		{id: 5, label: 'ACU2', group: 'acu'},
		{id: 6, label: 'ACU3', group: 'acu'},
		{id: 7, label: 'ACU4', group: 'acu'},
		{id: 8, label: 'ACU5', group: 'acu'},
		{id: 9, label: 'ACU6', group: 'acu'},
		{id: 10, label: 'ACU7', group: 'acu'},
		{id: 11, label: 'ACU8', group: 'acu'},
		{id: 12, label: 'ACU9', group: 'acu'},
		{id: 13, label: 'ACU10', group: 'acu'},
		{id: 14, label: 'ACU11', group: 'acu'},
		{id: 15, label: 'ACU12', group: 'acu'}
  ]);


  // create an array with edges
  var edges = new vis.DataSet([
    {from: 1, to: 2},
    {from: 1, to: 3},
    {from: 2, to: 3},
   	{from: 1, to: 4},
		{from: 1, to: 5},
		{from: 1, to: 6},
		{from: 2, to: 7},
		{from: 2, to: 8},
		{from: 2, to: 9},
		{from: 2, to: 10},
		{from: 2, to: 11},
		{from: 2, to: 12},
		{from: 3, to: 13},
		{from: 3, to: 14},
		{from: 3, to: 15},
  ]);

  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: nodes,
    edges: edges
  };

  var options = {
		nodes: {
			color: {hover: {border: 'red'}}
		},
		edges: {
			color: 'white'
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


	network.on('select', function(params) {
        document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes;
      });
