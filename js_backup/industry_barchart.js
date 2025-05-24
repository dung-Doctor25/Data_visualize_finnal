function drawIndustryBarChart(data) {
  // Group data by industry, count distinct Job IDs
  const groupedData = d3.group(data, d => d.industry);
  const barData = [...groupedData.entries()]
    .map(([industry, group]) => ({
      industry: industry || "Unknown",
      count: new Set(group.map(d => d["Job Id"])).size
    }))
    .sort((a, b) => b.count - a.count);

  // Set up SVG dimensions
  const margin = { top: 40, right: 20, bottom: 100, left: 60 };
  const width = 450 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove existing SVG if any
  d3.select("#industry-chart").selectAll("*").remove();

  // Create SVG
  const svg = d3.select("#industry-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(barData.map(d => d.industry))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.count)])
    .nice()
    .range([height, 0]);

  // Bars
  svg.selectAll(".bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.industry))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.count))
    .attr("fill", "steelblue");

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Number of Jobs");
}