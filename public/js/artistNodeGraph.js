var artistNodeGraph = function(){
	var width = 960,
	height = 500;

	function graph(selection){
		var data = selection.datum();
		var div = selection,
			svg = div.selectAll('svg');

		svg.attr("width", width).attr("height", height);


		var scaleNodeRadius = d3.scaleLinear()
						.domain([d3.min(data, function(d) {return +d.count}),
								d3.max(data, function(d) {return +d.count})])
						.range([10,30]);

		var colorNodes = d3.scaleOrdinal(d3.schemeCategory10);

		var node = svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr('r', function(d) {return scaleNodeRadius(d.count);})
			.style("fill", function(d,i){return colorNodes(i)})
			.attr('transform', 'translate(' + [width/2, height/2] + ')')
			.on("mouseover", function(d){
				tooltip.html(d.name+"<br>"+"Tracks: " + d.count);
				return tooltip.style("visibility", "visible");})
			.on("mousemove", function(){
				return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px");})
			.on("mouseout", function(){
				return tooltip.style("visibility", "hidden");
			});

		var simulation = d3.forceSimulation(data)
			.force("charge", d3.forceManyBody().strength(-150))
			.force("x", d3.forceX())
			.force("y",d3.forceY())
			.on("tick", ticked);

		var tooltip = selection
			.append("div")
			.style("position", "absolute")
			.style("visibility", "hidden")
			.style("color", "white")
			.style("padding", "8px")
			.style("background-color", "rgb(120,120,120)")
			.style("text-align", "center")
			.style("width", "150px")
			.text("");

		function ticked(obj){
			node.attr("cx", function(d){return d.x})
				.attr("cy", function(d){return d.y});
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