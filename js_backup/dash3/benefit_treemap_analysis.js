function drawBenefitTreemapAnalysis(data) {
    console.log("Input data for Benefit Treemap:", data);

    // Kiểm tra data.benefits
    if (!data || !data.benefits || !Array.isArray(data.benefits)) {
        console.error("Error: candidateData.benefits is undefined or not an array");
        return;
    }

    const filteredData = data.benefits.filter(d => d.benefit && d.benefit.trim() !== "");
    if (filteredData.length === 0) {
        console.warn("Warning: No valid benefits data after filtering");
        return;
    }

    const benefitCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => d.benefit
    );
    console.log("Benefit Counts:", benefitCounts);
    const treemapData = {
        name: "Benefits",
        children: Array.from(benefitCounts, ([name, value]) => ({ name, value }))
    };
    console.log("Treemap Data:", treemapData);
    const width = 800;
    const height = 600;
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(treemapData.children, d => d.value)]);

    const root = d3.hierarchy(treemapData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(1)
        (root);

    const svg = d3.select("#benefit-treemap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data.value))
        .attr("stroke", "#fff");

    leaf.append("text")
        .selectAll("tspan")
        .data(d => {
            const words = d.data.name.split(/(?=[A-Z\s])/);
            return words.map(word => ({ word, value: d.data.value }));
        })
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .attr("font-size", "10px")
        .text(d => d.word);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    leaf.on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Benefit: ${d.data.name}<br>Number of Jobs: ${d.data.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });
}