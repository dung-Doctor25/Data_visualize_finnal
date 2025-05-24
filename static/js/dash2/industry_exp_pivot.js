function drawIndustryExpPivot(data) {
    // Debug: Kiểm tra dữ liệu đầu vào
    console.log("Input data:", data);
    
    // Lọc bỏ dữ liệu không hợp lệ
    const binnedData = data
        .filter(d => 
            d.simplified_role && 
            d.simplified_role !== '' && 
            d.avg_salary != null && 
            d.avg_salary > 0 && 
            d.avg_exp != null && 
            d.avg_exp >= 0
        )
        .map(d => ({
            ...d,
            exp_bin: Math.floor(d.avg_exp)
        }));

    // Debug: Kiểm tra dữ liệu sau lọc
    console.log("Filtered binnedData:", binnedData);

    // Nếu không có dữ liệu hợp lệ, hiển thị thông báo lỗi
    if (binnedData.length === 0) {
        d3.select("#industry-exp-pivot")
            .append("p")
            .text("No valid simplified_role or salary data available.");
        return;
    }

    // Tính tổng avg_salary theo simplified_role và exp_bin
    const salaryByExp = d3.rollup(
        binnedData,
        v => d3.mean(v, d => d.avg_salary),
        d => d.simplified_role,
        d => d.exp_bin
    );

    // Debug: Kiểm tra salaryByExp
    console.log("salaryByExp:", salaryByExp);

    // Tạo danh sách simplified_role và exp_bin
    const roles = [...new Set(binnedData.map(d => d.simplified_role))].sort();
    const expBins = [...new Set(binnedData.map(d => d.exp_bin))].sort((a, b) => a - b);

    // Debug: Kiểm tra roles và expBins
    console.log("roles:", roles);
    console.log("expBins:", expBins);

    // Tính mức tăng trưởng
    const pivotData = roles.map(role => {
        const row = { simplified_role: role };
        expBins.forEach((bin, i) => {
            const currentSalary = salaryByExp.get(role)?.get(bin) || 0;
            const prevSalary = i > 0 ? (salaryByExp.get(role)?.get(expBins[i-1]) || 0) : 0;
            let growth = 0;
            if (prevSalary > 0 && currentSalary > 0) {
                growth = ((currentSalary - prevSalary) / prevSalary * 100).toFixed(2);
            } else if (currentSalary > 0) {
                growth = 100;
            }
            row[bin] = +growth; // Chuyển thành số
        });
        return row;
    });

    // Debug: Kiểm tra pivotData
    console.log("pivotData:", pivotData);

    // Tạo tỷ lệ màu gradient xanh da trời
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 130]) // growth từ 0% đến 200%
        .clamp(true); // Giới hạn giá trị ngoài phạm vi

    // Tạo container cho bảng với thanh cuộn
    const container = d3.select("#industry-exp-pivot")
        .append("div")
        .style("max-height", "400px")

        .style("overflow-y", "auto")
        .style("width", "100%");

    // Tạo bảng
    const table = container.append("table")
        .style("border-collapse", "collapse")
        .style("width", "100%");

    // Thêm header
    const thead = table.append("thead").append("tr");
    thead.append("th").text("Role");
    expBins.forEach(bin => {
        thead.append("th").text(bin);
    });

    // Tạo hoặc tái sử dụng tooltip
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    // Thêm dữ liệu
    const tbody = table.append("tbody");
    pivotData.forEach(row => {
        const tr = tbody.append("tr");
        tr.append("td").text(row.simplified_role); // Cột Role không có màu
        expBins.forEach(bin => {
            tr.append("td")
                .text(row[bin] + "%")
                .style("background-color", colorScale(row[bin])) // Áp dụng màu gradient
                .on("mouseover", function(event) {
                    d3.select(this).style("background-color", d3.rgb(colorScale(row[bin])).darker(0.5));
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Role: ${row.simplified_role}<br>Experience: ${bin} years<br>Growth: ${row[bin]}%`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseleave", function() {
                    d3.select(this).style("background-color", colorScale(row[bin]));
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });
    });
}