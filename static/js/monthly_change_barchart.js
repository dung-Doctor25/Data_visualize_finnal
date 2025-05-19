function drawMonthlyChangeBarChart(data) {
  // Group data by month, count distinct Job IDs
  const jobCounts = d3.group(data, d => +d.month);
  const monthlyData = [...jobCounts.entries()]
    .map(([month, group]) => ({
      month: +month,
      count: new Set(group.map(d => d["Job Id"])).size
    }))
    .sort((a, b) => a.month - b.month);

  // Calculate percentage change
  const changeData = monthlyData.map((d, i) => {
    if (i === 0) {
      return { month: d.month, percentage: 0, count: d.count };
    }
    const prev = monthlyData[i - 1];
    const change = ((d.count - prev.count) / prev.count) * 100;
    return { month: d.month, percentage: isFinite(change) ? change : 0, count: d.count };
  });

  // Calculate mean percentage (excluding first month if percentage=0)
  const validPercentages = changeData.filter(d => d.month !== changeData[0].month).map(d => d.percentage);
  const meanPercentage = validPercentages.length > 0 ? d3.mean(validPercentages) : 0;

  // Set up SVG dimensions
  const margin = { top: 30, right: 40, bottom: 60, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

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
    .domain(changeData.map(d => d.month))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([d3.min(changeData, d => d.percentage) - 5, d3.max(changeData, d => d.percentage) + 5])
    .nice()
    .range([height, 0]);

  // Dashed mean line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(meanPercentage))
    .attr("y2", y(meanPercentage))
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,4");

  // Label for mean line
  svg.append("text")
    .attr("x", width + 5)
    .attr("y", y(meanPercentage))
    .attr("dy", "0.35em")
    .attr("fill", "red")
    .style("font-size", "7px")
    .text(`Mean: ${meanPercentage.toFixed(1)}%`);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(month => d3.format("02d")(month)))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "7px");

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
    .selectAll("text")
    .style("font-size", "7px");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .text("Month");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -35)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .text("Percentage Change");

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "3px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Bars
  svg.selectAll(".bar")
    .data(changeData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.month))
    .attr("y", d => y(Math.max(0, d.percentage)))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.abs(y(d.percentage) - y(0)))
    .attr("fill", d => d.percentage >= 0 ? "steelblue" : "red")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", "orange");
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(`Month: ${d.month}<br>Jobs: ${d.count}<br>Change: ${d.percentage.toFixed(2)}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("fill", d.percentage >= 0 ? "steelblue" : "red");
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}