function drawMonthlyChangeBarChart(data) {
  // Group data by month, count distinct Job IDs
  const groupedData = d3.group(data, d => +d.month);
  const barData = [...groupedData.entries()]
    .map(([month, group]) => ({
      month: month,
      count: new Set(group.map(d => d["Job Id"])).size
    }))
    .sort((a, b) => a.month - b.month);

  // Set up SVG dimensions
  const margin = { top: 40, right: 20, bottom: 60, left: 60 };
  const width = 450 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove existing SVG if any
  d3.select("#monthly-change-chart").selectAll("*").remove();

  // Create SVG
  const svg = d3.select("#monthly-change-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(barData.map(d => d.month))
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
    .attr("x", d => x(d.month))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.count))
    .attr("fill", "teal");

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Month");

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