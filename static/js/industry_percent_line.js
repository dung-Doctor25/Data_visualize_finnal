function drawIndustryYearStackedBar(data) {
  // Group data by industry, count distinct Job IDs
  const industryTotals = d3.rollup(data, v => new Set(v.map(d => d["Job Id"])).size, d => d.industry);
  const topIndustries = [...industryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(d => d[0]);

  // Filter data for top industries
  const filteredData = data.filter(d => topIndustries.includes(d.industry));

  // Group data by industry and year, count distinct Job IDs
  const jobCounts = d3.group(filteredData, d => d.industry, d => +d.year);
  const newIndustryTotals = d3.rollup(filteredData, v => new Set(v.map(d => d["Job Id"])).size, d => d.industry);

  // Calculate percentage for each year within each industry
  const barData = [];
  jobCounts.forEach((years, industry) => {
    const total = newIndustryTotals.get(industry) || 1;
    years.forEach((group, year) => {
      const count = new Set(group.map(d => d["Job Id"])).size;
      const percentage = (count / total) * 100;
      barData.push({
        industry: industry || "Unknown",
        year: year,
        percentage: percentage,
        count: count
      });
    });
  });

  // Prepare data for stacking
  const years = [...new Set(barData.map(d => d.year))].sort();
  const industries = [...new Set(barData.map(d => d.industry))].sort();
  const stackedData = d3.group(barData, d => d.industry);
  const series = d3.stack()
    .keys(years)
    .value(([, group], year) => {
      const entry = group.find(d => d.year === year);
      return entry ? entry.percentage : 0;
    })
    (stackedData);

  // Set up SVG dimensions
  const margin = { top: 30, right: 20, bottom: 60, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  // Remove existing SVG if any
  d3.select("#industry-year-stacked").selectAll("*").remove();

  // Create SVG
  const svg = d3.select("#industry-year-stacked")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(industries)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(years);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "7px");

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
    .selectAll("text")
    .style("font-size", "7px");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .text("Industry");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -35)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .text("Percentage of Jobs");

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
    .data(series)
    .enter()
    .append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => x(d.data[0]))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.8);
      const year = d3.select(this.parentNode).datum().key;
      const industry = d.data[0];
      const entry = barData.find(b => b.industry === industry && b.year === +year) || { percentage: 0, count: 0 };
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(`Industry: ${industry}<br>Year: ${year}<br>Percentage: ${entry.percentage.toFixed(2)}%<br>Jobs: ${entry.count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });


}