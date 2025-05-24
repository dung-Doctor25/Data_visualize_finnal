function drawQualificationHeatMap(data) {
    // Group data by Qualifications, count distinct Job IDs
    const groupedData = d3.group(data, d => d.group_quality);
    const heatMapData = [...groupedData.entries()]
      .map(([group_quality, group]) => ({
        name: group_quality || "Unknown",
        value: new Set(group.map(d => d["Job Id"])).size
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  
    // Set up SVG dimensions
    const margin = { top: 40, right: 10, bottom: 20, left: 20 };
    const width = 400 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
  
    // Remove existing SVG if any
    d3.select("#qualification-heatmap").selectAll("*").remove();
  
    // Create SVG
    const svg = d3.select("#qualification-heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Create treemap hierarchy
    const root = d3.hierarchy({ children: heatMapData })
      .sum(d => d.value);
  
    // Create treemap layout
    d3.treemap()
      .size([width, height])
      .padding(2)
      (root);
  
    // Color scale
    const color = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(heatMapData, d => d.value)]);
  
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
  
    // Cells
    svg.selectAll(".cell")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.value))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "orange");
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Qualification: ${d.data.name}<br>Jobs: ${d.data.value}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("fill", color(d.data.value));
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  
    // Labels inside cells
    svg.selectAll(".label")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", "10px")
      .style("fill", "white")
      .text(d => {
        const text = d.data.name;
        const maxWidth = d.x1 - d.x0 - 4; // Account for padding
        return text.length > maxWidth / 6 ? text.slice(0, Math.floor(maxWidth / 6)) + "..." : text;
      });
  

  }