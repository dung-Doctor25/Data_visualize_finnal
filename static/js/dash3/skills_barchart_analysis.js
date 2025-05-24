function drawResponsibilityBarchartAnalysis(data) {

    console.log("Input data for Responsibility Table:", data);

    if (!data || !data.responsibilities || !Array.isArray(data.responsibilities)) {
        console.error("Error: data.responsibilities is undefined or not an array");
        return;
    }

    const filteredData = data.responsibilities.filter(d => d.responsibility && d.responsibility.trim() !== "");
    if (filteredData.length === 0) {
        console.warn("Warning: No valid responsibilities data after filtering");
        return;
    }

    const responsibilityCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => d.responsibility
    );

    const topResponsibilities = Array.from(responsibilityCounts, ([responsibility, count]) => ({
        responsibility,
        count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

    d3.select("#skills-barchart").selectAll("*").remove();

    // Tạo wrapper div có cuộn
    const scrollWrapper = d3.select("#skills-barchart").append("div")
        .style("max-height", "400px")
        .style("max-width", "700px")
        .style("margin", "0 auto")
        .style("overflow-y", "auto")
        .style("overflow-x", "auto")
        .style("border", "1px solid #ccc");

    const table = scrollWrapper.append("table")
        .attr("class", "data-table")
        .style("border-collapse", "collapse")
        .style("width", "100%");

    const thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(["Responsibility", "Number of Jobs"])
        .enter()
        .append("th")
        .text(d => d)
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("background-color", "#f2f2f2")
        .style("text-align", "left");

    const tbody = table.append("tbody");

    const colorScale = d3.scaleLinear()
        .domain([0, topResponsibilities.length - 1])
        .range(["#006400", "#90EE90"]);

    topResponsibilities.forEach((row, i) => {
        const tr = tbody.append("tr");

        tr.append("td")
            .text(row.responsibility)
            .style("border", "1px solid #ccc")
            .style("padding", "8px");

        tr.append("td")
            .text(row.count)
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("background-color", colorScale(i));
    });
}
