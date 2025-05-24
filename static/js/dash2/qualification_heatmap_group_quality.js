function drawQualificationHeatMap2(data) {
    // Tính tổng số công việc
    const totalJobs = data.length;
    

    // Đếm số lượng công việc theo Qualifications và group_quality
    const counts = d3.rollup(
        data,
        v => v.length,
        d => d.Qualifications,
        d => d.group_quality
    );

    // Chuyển thành mảng và tính phần trăm
    const heatmapData = [];
    counts.forEach((groupMap, qual) => {
        groupMap.forEach((count, group) => {
            const percentage = ((count / totalJobs) * 100).toFixed(2); // Tính phần trăm
            heatmapData.push({ 
                qualification: qual, 
                group_quality: group, 
                count, 
                percentage: +percentage, // Chuyển thành số
                name: `${qual} (${group})` // Tên cho treemap
            });
        });
    });
    heatmapData.sort((a, b) => a.group_quality.localeCompare(b.group_quality));
    // Thiết lập kích thước
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Tạo SVG
    const svg = d3.select("#qualification-heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo dữ liệu phân cấp cho treemap
    const root = d3.hierarchy({ children: heatmapData })
        .sum(d => d.percentage || 0); // Kích cỡ dựa trên percentage

    // Tạo treemap
    const treemap = d3.treemap()
        .size([width, height])
        .padding(2)
        .round(true);

    treemap(root);

    // Tạo tỷ lệ màu theo group_quality
    const groupQualities = [...new Set(heatmapData.map(d => d.group_quality))];
    const color = d3.scaleOrdinal()
        .domain(groupQualities)
        .range(["#ff0000", "#4d1cb5", "#268fe0","#4d1cb5"]); // Màu cho Bachelor's, Master's, Doctorate, Other
    console.log(color(groupQualities));
    // Tạo tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Vẽ ô treemap
    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("rx", 4)
        .style("fill", d => color(d.data.group_quality))
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", d3.rgb(color(d.data.group_quality)).darker(0.5));
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`Qualification: ${d.data.qualification}<br>Group: ${d.data.group_quality}<br>Jobs: ${d.data.count}<br>Percentage: ${d.data.percentage}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function() {
            d3.select(this).style("fill", d => color(d.data.group_quality));
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Thêm text
    cell.append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2 - 10)
        .attr("dy", ".35em")
        .text(d => d.data.qualification)
        .style("font-size", "10px")
        .style("fill", "#fff") // Màu trắng cho tương phản
        .style("text-anchor", "middle")
        .style("pointer-events", "none");

    cell.append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2 + 10)
        .attr("dy", ".35em")
        .text(d => d.data.percentage > 0 ? `${d.data.percentage}%` : '')
        .style("font-size", "10px")
        .style("fill", "#fff")
        .style("text-anchor", "middle")
        .style("pointer-events", "none");
}