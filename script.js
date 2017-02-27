;(function(w, d3, undefined){
    "use strict";

    var width, height;
    function getSize(){
        width = w.innerWidth,
        height = w.innerHeight;

        if(width === 0 || height === 0){
            setTimeout(function(){
                getSize();
            }, 100);
        }
        else {
            init();
        }
    }

    function init(){

        //Setup path for outerspace
        var space = d3.geo.azimuthal()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 3);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        //Setup path for globe
        var projection = d3.geo.azimuthal()
            .mode("orthographic")
            .translate([width / 2, height / 2]);

        var scale0 = projection.scale();

        var path = d3.geo.path()
            .projection(projection)
            .pointRadius(2);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 800])
            .on("zoom", move);

        var circle = d3.geo.greatCircle();

        var svg = d3.select("body")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

        //Create a list of random stars and add them to outerspace
        var starList = createStars(300);
                
        var stars = svg.append("g")
            .selectAll("g")
            .data(starList)
            .enter()
            .append("path")
                .attr("class", "star")
                .attr("d", function(d){
                    spacePath.pointRadius(d.properties.radius);
                    return spacePath(d);
                });


        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);

        //Create the base globe
        var backgroundCircle = svg.append("circle")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', projection.scale())
            .attr('class', 'globe')
            .attr("filter", "url(#glow)")
            .attr("fill", "url(#gradBlue)");

        var g = svg.append("g"),
            features;
        // Append Div for tooltip to SVG
        var div = d3.select("body")
		    .append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);

        var colors = d3.scale.linear().
        range(["#6363FF", "#6373FF", "#63A3FF", "#63E3FF", "#63FFFB", "#63FFCB",
               "#63FF9B", "#63FF6B", "#7BFF63", "#BBFF63", "#DBFF63", "#FBFF63", 
               "#FFD363", "#FFB363", "#FF8363", "#FF7363", "#FF6364"]);
        //colors.domain([0,17])
        var options = Array.from(Array(17).keys())
        var legendText = ["< 0.1", "0.1-1", "1-5", "5-10", '10-15','15-20','20-25','25-30','30-35','35-40','40-45','45-50','50-55','55-60','60-65','65-70','70-75','> 75']

        console.log(colors);
        //Add all of the countries to the globe
        d3.json("world-countries.json", function(collection) {
            d3.csv("internetaccess.csv", function(data) { 

                features = g.selectAll(".feature").data(collection.features);


                for (var j = 0; j < collection.features.length; j++){
                    var countryName = collection.features[j].properties.name;

                    for (var i = 0; i < data.length; i++) {
                        if (countryName == data[i].country) {
                            collection.features[j].properties.percentage = data[i].percentage;
                            //console.log(countryName + " has " + data[i].percentage + "% internet access");
                            break;
                        }
                    }
                }

                features.enter().append("path")
                    .attr("class", "feature")
                    .attr("d", function(d){ return path(circle.clip(d)); })
                    .style("fill", function(d){

                        var per = d.properties.percentage;
                        if (per) {
                            if (per < 0.1) {
                                return colors(0)
                            }
                            else if (per < 1) {
                                return colors(1)
                            }
                            else if (per < 5) {
                                return colors(2)
                            }
                            else if (per < 10) {
                                return colors(3)
                            }
                            else if (per < 15) {
                                return colors(4)
                            }
                            else if (per < 20) {
                                return colors(5)
                            }
                            else if (per < 25) {
                                return colors(6)
                            }
                            else if (per < 30) {
                                return colors(7)
                            }
                            else if (per < 35) {
                                return colors(8)
                            }
                            else if (per < 40) {
                                return colors(9)
                            }
                            else if (per < 45) {
                                return colors(10)
                            }
                            else if (per < 50) {
                                return colors(11)
                            }
                            else if (per < 55) {
                                return colors(12)
                            }
                            else if (per < 60) {
                                return colors(13)
                            }
                            else if (per < 65) {
                                return colors(14)
                            }
                            else if (per < 70) {
                                return colors(15)
                            }
                            else if (per < 75) {
                                return colors(16)
                            }
                            else {
                                return colors(17)
                            }
                        }
                        else {
                            return "rgb(213,222,217)";
                        }
                    })
                    .style("stroke", "black")
                    .style("stroke-width", 0.4)
                    .on("mouseover", function(d) {      
                        div.transition()        
                           .duration(200)      
                           .style("opacity", .9);     

                           div.text(d.properties.percentage)
                           .style("left", (d3.event.pageX) + "px")     
                           .style("top", (d3.event.pageY - 28) + "px");    
                    })

                    .on("mouseout", function(d) {       
                        div.transition()        
                           .duration(500)      
                           .style("opacity", 0);   
                    });

            });
            
        });

        //Redraw all items with new projections
        function redraw(){
            features.attr("d", function(d){
                return path(circle.clip(d));
            });

            stars.attr("d", function(d){
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });
        }


        function move() {
            if(d3.event){
                var scale = d3.event.scale;
                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
                
                projection.scale(scale);
                space.scale(scale * 3);
                backgroundCircle.attr('r', scale);
                path.pointRadius(2 * scale / scale0);

                projection.origin(origin);
                circle.origin(origin);
                
                //globe and stars spin in the opposite direction because of the projection mode
                var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                space.origin(spaceOrigin);
                redraw();
            }
        }


        function createStars(number){
            var data = [];
            for(var i = 0; i < number; i++){
                data.push({
                    geometry: {
                        type: 'Point',
                        coordinates: randomLonLat()
                    },
                    type: 'Feature',
                    properties: {
                        radius: Math.random() * 1.5
                    }
                });
            }
            return data;
        }

        function randomLonLat(){
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }
    }

    getSize();

}(window, d3));