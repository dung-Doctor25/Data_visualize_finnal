function drawJobGrowthTable(data) {
    // Lọc dữ liệu hợp lệ
    const filteredData = data
        .filter(d => 
            d.simplified_role && 
            d.simplified_role !== '' && 
            d.quarter != null && 
            d.year != null
        );

    if (filteredData.length === 0) {
        d3.select("#job-growth-table")
            .append("p")
            .text("No valid simplified_role, quarter, or year data available.");
        return;
    }

    // Tạo khóa quarter-year
    filteredData.forEach(d => {
        d.quarterYear = `${d.year}-Q${d.quarter}`;
    });

    // Tổng hợp số công việc theo simplified_role và quarterYear
    const jobCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => d.simplified_role,
        d => d.quarterYear
    );

    // Tạo danh sách simplified_role và quarterYear
    const roles = [...new Set(filteredData.map(d => d.simplified_role))].sort();
    const quarterYears = [...new Set(filteredData.map(d => d.quarterYear))].sort();

    // Tính tốc độ tăng trưởng
    const pivotData = roles.map(role => {
        const row = { simplified_role: role };
        quarterYears.forEach((qy, i) => {
            const currentJobs = jobCounts.get(role)?.get(qy) || 0;
            const prevJobs = i > 0 ? (jobCounts.get(role)?.get(quarterYears[i-1]) || 0) : 0;
            let growth = 0;
            if (prevJobs > 0 && currentJobs > 0) {
                growth = ((currentJobs - prevJobs) / prevJobs * 100).toFixed(2);
            } else if (currentJobs > 0) {
                growth = 100;
            }
            row[qy] = +growth;
        });
        return row;
    });

    // Tìm phạm vi tăng trưởng cho gradient
    const allGrowths = pivotData.flatMap(row => 
        quarterYears.map(qy => row[qy])
    ).filter(g => g !== undefined);
    const growthExtent = d3.extent(allGrowths);

    // Tạo scale màu gradient
    const colorScale = d3.scaleLinear()
        .domain(growthExtent)
        .range(["#00ff00", "#ff0000"]); // Xanh đến đỏ

    // Tạo container
    const container = d3.select("#job-growth-table")
        .append("div")
        .style("max-height", "400px")
        .style("max-width", "800px")
        .style("margin", "0 auto")
        .style("overflow-y", "auto")
        .style("overflow-x", "auto")
        .style("width", "100%");

    // Tạo bảng
    const table = container.append("table")
        .style("border-collapse", "collapse")
        .style("width", "100%");

    // Thêm style cơ bản cho bảng
    table.style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("text-align", "left");

    // Thêm header
    const thead = table.append("thead").append("tr");
    thead.append("th").text("Role");
    quarterYears.forEach(qy => {
        thead.append("th")
            .text(qy)
            .style("background-color", "#f2f2f2")
            .style("font-weight", "bold");
    });

    // Tạo tooltip
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#fff")
            .style("border", "1px solid #ddd")
            .style("padding", "5px")
            .style("border-radius", "3px");
    }

    // Thêm dữ liệu
    const tbody = table.append("tbody");
    pivotData.forEach(row => {
        const tr = tbody.append("tr");
        tr.append("td").text(row.simplified_role);
        quarterYears.forEach(qy => {
            const growth = row[qy];
            tr.append("td")
                .text(growth + "%")
                .style("background-color", growth !== 0 ? colorScale(growth) : "transparent")
                .style("color", () => {
                    if (growth === 0) return "#000";
                    const rgb = d3.rgb(colorScale(growth));
                    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                    return brightness > 128 ? "#000" : "#fff";
                })
                .on("mouseover", function(event) {
                    d3.select(this).style("background-color", d => 
                        growth !== 0 ? d3.rgb(colorScale(growth)).brighter(0.5) : "#edf2f7"
                    );
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Role: ${row.simplified_role}<br>Quarter-Year: ${qy}<br>Growth: ${growth}%`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseleave", function() {
                    d3.select(this).style("background-color", growth !== 0 ? colorScale(growth) : "transparent");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });
    });
}