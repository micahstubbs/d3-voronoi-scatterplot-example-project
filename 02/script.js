//
// Set-up
//

// map variables to our dataset
const xVariable = 'GDP_perCapita';
const yVariable = 'lifeExpectancy';
const rVariable = 'GDP';
const idVariable = 'CountryCode';
const groupByVariable = 'Region';
const tooltipVariable = 'Country';

// set label text
const xLabel = 'GDP per capita [US $] - Note the logarithmic scale';
const yLabel = 'Life expectancy';

// vanilla JS window width and height
const wV = window;
const dV = document;
const eV = dV.documentElement;
const gV = dV.getElementsByTagName('body')[0];
const xV = wV.innerWidth || eV.clientWidth || gV.clientWidth;
const yV = wV.innerHeight || eV.clientHeight || gV.clientHeight;

// Quick fix for resizing some things for mobile-ish viewers
const mobileScreen = (xV < 500);

// Scatterplot
const margin = { left: 30, top: 20, right: 20, bottom: 20 };
const chartWidth = document.getElementById('chart').offsetWidth; 
const width = Math.min(chartWidth, 800) - margin.left - margin.right;
const height = width * 2 / 3;
// const maxDistanceFromPoint = 50;

const svg = d3.select('svg')
  .attr('width', (width + margin.left + margin.right))
  .attr('height', (height + margin.top + margin.bottom));

const wrapper = svg.append('g').attr('class', 'chordWrapper')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//
// Initialize Axes & Scales
//

const opacityCircles = 0.7;

// Set the color for each region
const color = d3.scaleOrdinal()
  .range([
    '#EFB605',
    '#E58903',
    '#E01A25',
    '#C20049',
    '#991C71',
    '#66489F',
    '#2074A0',
    '#10A66E',
    '#7EB852'
  ]);
 
d3.json('data.json', (error, data) => {
	// get values for color domain from the data
	const uniqueGroupByVariables = d3.set(data, d => d[groupByVariable])
		.values()
		.sort((a, b) => a > b); // ascending alphabetical sort

	// set the domain of the color scale
	// we use this later for the legend
	color.domain(uniqueGroupByVariables);

	// Set the new x axis range
	const xScale = d3.scaleLog()
	  .range([0, width])
	  .domain([100, 2e5]);
	  // I prefer this exact scale over the true range and then using "nice"
	  // .domain(d3.extent(data, function(d) { return d[xVariable]; }))
	  // .nice();

	// Set new x-axis
	const xAxis = d3.axisBottom()
	  .ticks(10)
	  .tickFormat(d => // Difficult function to create better ticks
	    xScale.tickFormat((mobileScreen ? 4 : 8), e => {
	      const prefix = d3.format(",.0s");
	      return `$${prefix(e)}`;
	    })(d))
	    .scale(xScale);

	// Append the x-axis
	wrapper.append('g')
	  .attr('class', 'x axis')
	  .attr('transform', `translate(${0},${height})`)
	  .call(xAxis);

	// Set the new y axis range
	const yScale = d3.scaleLinear()
	  .range([height, 0])
	  .domain(d3.extent(data, d => d[yVariable]))
	  .nice();

	const yAxis = d3.axisLeft()
	  .ticks(6)  // Set rough # of ticks
	  .scale(yScale);

	// Append the y-axis
	wrapper.append('g')
	    .attr('class', 'y axis')
	    .attr('transform', `translate(${0}, ${0})`)
	    .call(yAxis);

	// Scale for the bubble size
	const rScale = d3.scaleSqrt()
	      .range([
	        mobileScreen ? 1 : 2,
	        mobileScreen ? 10 : 16
	      ])
	      .domain(d3.extent(data, d => d[rVariable]));

	//
	// Scatterplot Circles
	//

	// Initiate a group element for the circles
	const circleGroup = wrapper.append('g')
	  .attr('class', 'circleWrapper');

	// Place the country circles
	circleGroup.selectAll('marks')
	  .data(data.sort((a, b) => b[rVariable] > a[rVariable])) // Sort so the biggest circles are below
	  .enter().append('circle')
	    .attr('class', (d) => `marks ${d[idVariable]}`)
	    .style('opacity', opacityCircles)
	    .style('fill', d => color(d[groupByVariable]))
	    .attr('cx', d => xScale(d[xVariable]))
	    .attr('cy', d => yScale(d[yVariable]))
	    .attr('r', d => rScale(d[rVariable]));

	//
	// Tooltips
	//

	const tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(d => {
			return `<div style='background-color: white; padding: 5px; border-radius: 6px;
				border-style: solid; border-color: #D1D1D1; border-width: 1px;'>
				<span style='font-size: 11px; text-align: center;'>${d.datum[tooltipVariable]}</span>
				</div>`
		});

	svg.call(tip);

	//
	// distance-limited Voronoi
	//

	/*
	  Initiate the voronoi function
	  Use the same variables of the data in the .x and .y as used
	  in the cx and cy of the circle call
	  The clip extent will make the boundaries end nicely along
	  the chart area instead of splitting up the entire SVG
	  (if you do not do this it would mean that you already see
	  a tooltip when your mouse is still in the axis area, which
	  is confusing)
	*/

	const xAccessor = d => xScale(d[xVariable]);
	const yAccessor = d => yScale(d[yVariable]);

	const limitedVoronoi = d3.distanceLimitedVoronoi()
	  .x(xAccessor)
	  .y(yAccessor)
	  .limit(50)
	  .extent([[0, 0], [width, height]]);

	const limitedVoronoiCells = limitedVoronoi(data);

	// Initiate a group element to place the voronoi diagram in
	const limitedVoronoiGroup = wrapper.append('g')
	  .attr('class', 'voronoiWrapper');

	// Create the distance-limited Voronoi diagram
	limitedVoronoiGroup.selectAll('path')
	  .data(limitedVoronoiCells) // Use vononoi() with your dataset inside
	  .enter().append('path')
	    // .attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
	    .attr('d', (d, i) => d.path)
	    // Give each cell a unique class where the unique part corresponds to the circle classes
	    .attr('class', d => `voronoi ${d.datum[idVariable]}`)
	    .style('stroke', 'lightblue') // I use this to look at how the cells are dispersed as a check
	    .style('fill', 'none')
	    .style('pointer-events', 'all')
	    .on('mouseover', tip.show)
	    .on('mouseout', tip.hide);

	//
	// Initialize Labels
	//

	const xlabelText = xLabel || xVariable;
	const yLabelText = yLabel || yVariable;

	// Set up X axis label
	wrapper.append('g')
	  .append('text')
	  .attr('class', 'x title')
	  .attr('text-anchor', 'end')
	  .style('font-size', `${mobileScreen ? 8 : 12}px`)
	  .attr('transform', `translate(${width},${height - 10})`)
	  .text(xlabelText);

	// Set up y axis label
	wrapper.append('g')
	  .append('text')
	  .attr('class', 'y title')
	  .attr('text-anchor', 'end')
	  .style('font-size', `${mobileScreen ? 8 : 12}px`)
	  .attr('transform', 'translate(18, 0) rotate(-90)')
	  .text(yLabelText);

	//
	// Create the Legend
	//

	if (!mobileScreen) {
	  // Legend
	  const legendMargin = { left: 5, top: 10, right: 5, bottom: 10 };
	  const legendWidth = 160;
	  const legendHeight = 270;

	  const svgLegend = d3.select('#legend').append('svg')
	    .attr('width', (legendWidth + legendMargin.left + legendMargin.right))
	    .attr('height', (legendHeight + legendMargin.top + legendMargin.bottom));

	  const legendWrapper = svgLegend.append('g').attr('class', 'legendWrapper')
	    .attr('transform', `translate(${legendMargin.left},${legendMargin.top})`);

	  // dimensions of the colored square
	  const rectSize = 16;

	  // height of a row in the legend
	  const rowHeight = 22;

	  // width of each row
	  // const maxWidth = 125

	  // Create container per rect/text pair
	  const legend = legendWrapper.selectAll('.legendSquare')
	    .data(color.range())
	    .enter().append('g')
	    .attr('class', 'legendSquare')
	    .attr('transform', (d, i) => `translate(${0},${i * rowHeight})`);

	  // Append small squares to Legend
	  legend.append('rect')
	    .attr('width', rectSize)
	    .attr('height', rectSize)
	    .style('fill', d => d);

	  // Append text to Legend
	  legend.append('text')
	    .attr('transform', `translate(${25},${rectSize / 2})`)
	    .attr('class', 'legendText')
	    .style('font-size', '11px')
	    .attr('dy', '.35em')
	    .text((d, i) => color.domain()[i]);

	// if !mobileScreen
	} else {
	  d3.select('#legend').style('display', 'none');
	}
})
