// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right; // Increased width
  const height = 600 - margin.top - margin.bottom; // Increased height

  // Create the SVG container
  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales for x and y axes
  const xScale = d3.scaleBand()
    .domain([...new Set(data.map(d => d.Platform))])
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Likes)])
    .nice()
    .range([height, 0]);

  // Add scales
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text("Platform");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .style("text-anchor", "middle")
    .text("Number of Likes");

  // Define a rollup function to calculate min, q1, median, q3, and max
  const rollupFunction = function (groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const min = d3.min(values);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  // Calculate quartiles by platform
  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
  // This line groups the data by the 'species' column and applies the `rollupFunction`
  // to calculate the quartiles (min, q1, median, q3, max) for each group.

  // Draw the boxplot
  quantilesByGroups.forEach((quantiles, Platform) => {
    const x = xScale(Platform);
    const boxWidth = xScale.bandwidth();
    // This line iterates over each group and calculates the x-position and width
    // of the boxplot based on the scale.

    // Draw vertical line from min to max
    svg.append("line")
      .attr("x1", x + boxWidth / 2)
      .attr("x2", x + boxWidth / 2)
      .attr("y1", yScale(quantiles.min))
      .attr("y2", yScale(quantiles.max))
      .attr("stroke", "black");

    // Draw the box (q1 to q3)
    svg.append("rect")
      .attr("x", x)
      .attr("y", yScale(quantiles.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
      .attr("fill", "pink")
      .attr("stroke", "black");

    // Draw the median line
    svg.append("line")
      .attr("x1", x)
      .attr("x2", x + boxWidth)
      .attr("y1", yScale(quantiles.median))
      .attr("y2", yScale(quantiles.median))
      .attr("stroke", "black");
  });
});

// Prepare your data and load the data again.
// SEE IPYNB FOR DATA PREP 
// This data should contain three columns: platform, post type, and average number of likes.
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function (data) {
  // Convert string values to numbers
  data.forEach(d => d.AvgLikes = +d.AvgLikes);

  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const x0 = d3.scaleBand()
    .domain([...new Set(data.map(d => d.Platform))])
    .range([0, width])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain([...new Set(data.map(d => d.PostType))])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.PostType))])
    .range(["#e377c2", "#ff9896", "#c5b0d5"]);

  // Add x and y axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text("Platform");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .style("text-anchor", "middle")
    .text("Average Likes");

  // Group data by platform
  const barGroups = svg.selectAll(".barGroup")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
  barGroups.append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));

  // Add the legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 50}, ${margin.top})`);

  const types = [...new Set(data.map(d => d.PostType))];

  types.forEach((type, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 15)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(type));

    legend.append("text")
      .attr("x", 15)
      .attr("y", i * 15 + 8)
      .text(type)
      .attr("font-size", "10px")
      .attr("alignment-baseline", "middle");
  });
});


// Prepare you data and load the data again. 
// SEE IPYNB FOR DATA PREP 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function (data) {
  // Convert string values to numbers and parse dates
  data.forEach(function (d) {
    console.log("date", d.Date); 
    const cleanDateString = d.Date.trim().replace(/\s\([a-zA-Z]+\)$/, '');
    d.date = d3.timeParse("%m/%d/%Y")(cleanDateString);
    d.likes = +d.Likes; 
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 50, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set up scales for x and y axes
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date)) 
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.likes)]) 
    .nice()
    .range([height, 0]);

  // Custom format for x-axis labels (e.g., "Sun 3")
  const formatDay = d3.timeFormat("%a %-d"); 

  // Draw the x and y axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .ticks(d3.timeDay.every(1))
      .tickFormat(formatDay)
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-25)"); // Rotate x-axis labels

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Date");

  // Add y-axis label
  svg.append("text")
    .attr("class", "y-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Average Number of Likes");

  // Create the line path (use curveNatural for a smooth curve)
  const line = d3.line()
    .x(d => x(d.date)) 
    .y(d => y(d.likes)) 
    .curve(d3.curveNatural); // Smooth curve

  // Draw the line path
  svg.append("path")
    .datum(data) 
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", "steelblue")
    .style("fill", "none")
    .style("stroke-width", 2);
});