function drawIndustryBarChart(data) {
  // Group data by industry, count distinct Job IDs
  const groupedData = d3.group(data, d => d.industry);
  const totalJobs = new Set(data.map(d => d["Job Id"])).size;

  const barData = [...groupedData.entries()]
    .map(([industry, group]) => {
      const count = new Set(group.map(d => d["Job Id"])).size;
      return {
        industry: industry || "Unknown",
        count: count,
        percent: +(count / totalJobs * 100).toFixed(2) // làm tròn 2 chữ số
      };
    })
    .sort((a, b) => b.percent - a.percent);

  // SVG dimensions
  const margin = { top: 50, right: 20, bottom: 110, left: 70 };
  const width = 400 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  // Remove old chart
  d3.select("#industry-chart").selectAll("*").remove();

  // SVG container
  const svg = d3.select("#industry-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("#industry-chart")
    .append("div")
    .style("position", "absolute")
    .style("background", "#f8f9fa")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "13px");

  // Scales
  const x = d3.scaleBand()
    .domain(barData.map(d => d.industry))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.percent)])
    .nice()
    .range([height, 0]);

  // Bars
  svg.selectAll(".bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.industry))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("rx", 4)
    .attr("fill", "#4682B4")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>${d.industry}</strong><br/>Tỷ lệ: ${d.percent}%`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", event => {
      tooltip.style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
    })
    .transition()
    .duration(800)
    .attr("y", d => y(d.percent))
    .attr("height", d => height - y(d.percent));

  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "10px");

  // Y-axis (percentage)
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d + "%").ticks(6))
    .selectAll("text")
    .style("font-size", "12px");

}
