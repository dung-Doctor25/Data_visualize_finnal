function drawResponsibilityBarchartAnalysis(data) {
    console.log("Input data for Responsibility Barchart:", data);

    // Kiểm tra data.responsibilities
    if (!data || !data.responsibilities || !Array.isArray(data.responsibilities)) {
        console.error("Error: candidateData.responsibilities is undefined or not an array");
        return;
    }

    const filteredData = data.responsibilities.filter(d => d.responsibility && d.responsibility.trim() !== "");
    if (filteredData.length === 0) {
        console.warn("Warning: No valid responsibilities data after filtering");
        return;
    }

    // Tính số lượng công việc cho mỗi responsibility
    const responsibilityCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => d.responsibility
    );

    // Chuyển thành mảng và lấy top 10
    const topResponsibilities = Array.from(responsibilityCounts, ([responsibility, count]) => ({
        responsibility,
        count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

    // Thiết lập kích thước biểu đồ
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Tạo SVG
    const svg = d3.select("#skills-barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo tỷ lệ
    const x = d3.scaleBand()
        .domain(topResponsibilities.map(d => d.responsibility))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(topResponsibilities, d => d.count)])
        .range([height, 0]);

    // Vẽ cột
    svg.selectAll(".bar")
        .data(topResponsibilities)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.responsibility))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#4e79a7");

    // Thêm trục
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Thêm tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll(".bar")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Responsibility: ${d.responsibility}<br>Number of Jobs: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}