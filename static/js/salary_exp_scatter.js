function drawSalaryExpScatter(data) {
    // Group data by simplified_role, calculate averages and count distinct Job IDs
    const groupedData = d3.group(data, d => d.simplified_role);
    const scatterData = [...groupedData.entries()]
      .map(([simplified_role, group]) => ({
        simplified_role: simplified_role || "Unknown",
        avg_exp: d3.mean(group, d => +d.avg_exp),
        avg_salary: d3.mean(group, d => +d.avg_salary),
        count: new Set(group.map(d => d["Job Id"])).size
      }))
      .filter(d => !isNaN(d.avg_exp) && !isNaN(d.avg_salary)) // Remove invalid data
      .sort((a, b) => b.count - a.count) // Sort by count descending
      .slice(0, 50); // Take top 50 industries
      console.log(scatterData.slice(0, 5)); // Log first 5 entries for debugging
    // Set up SVG dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
  
    // Remove existing SVG if any
    d3.select("#salary-exp-scatter").selectAll("*").remove();
  
    // Create SVG
    const svg = d3.select("#salary-exp-scatter")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Scales
    const x = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d.avg_exp) - 0.2, d3.max(scatterData, d => d.avg_exp) + 0.2])
      .nice()
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d.avg_salary) - 1000, d3.max(scatterData, d => d.avg_salary) + 1000])
      .nice()
      .range([height, 0]);
  
    const size = d3.scaleSqrt()
      .domain([0, d3.max(scatterData, d => d.count)])
      .range([5, 20]); // Radius range
  
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(scatterData.map(d => d.simplified_role));
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
  
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d / 1000}K`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
  
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
  
    // Dots
    svg.selectAll(".dot")
      .data(scatterData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.avg_exp))
      .attr("cy", d => y(d.avg_salary))
      .attr("r", d => size(d.count))
      .attr("fill", d => color(d.simplified_role))
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke", "black").attr("stroke-width", 2);
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Industry: ${d.simplified_role}<br>Avg Salary: $${d.avg_salary.toFixed(0)}<br>Avg Experience: ${d.avg_exp.toFixed(1)} years<br>Jobs: ${d.count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7).attr("stroke", null);
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  
  
  }