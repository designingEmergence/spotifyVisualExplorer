var artistNodeGraph = function(){
	var width = 960,
	height = 500;

	function graph(selection){
		var data = selection.datum();
		var div = selection,
			svg = div.selectAll('svg');

		svg.attr("width", width).attr("height", height);


		var scaleNodeRadius = d3.scaleLinear()
						.domain([d3.min(data, function(d) {return +d.count;}),
								d3.max(data, function(d) {return +d.count;})])
						.range([10,30]);

		var node = svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr('r', function(d) {return scaleNodeRadius(d.count)})
			.style("fill", "rgb(255,40,40)")
			.attr('transform', 'translate(' + [width/2, height/2] + ')');

		var simulation = d3.forceSimulation(data)
			.force("charge", d3.forceManyBody().strength(-150))
			.force("x", d3.forceX())
			.force("y",d3.forceY())
			.on("tick", ticked);

		function ticked(obj){
			node.attr("cx", function(d){return d.x;})
				.attr("cy", function(d){return d.y;});
		}

	}

	graph.width = function(value){
		if(!arguments.length) {return width;}
		width = value;
		return graph;
	};

	graph.height = function(value){
		if(!arguments.length) {return height;}
		height = value;
		return graph;
	};

	return graph;
};