function drawSalaryQualityTableAnalysis(data) {
    console.log("Input data for Salary Quality Table:", data);

    // Kiểm tra data.jobs
    if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        console.error("Error: candidateData.jobs is undefined or not an array");
        return;
    }

    const filteredData = data.jobs.filter(d => d.simplified_role && d.group_quality && d.avg_salary !== null);
    if (filteredData.length === 0) {
        console.warn("Warning: No valid jobs data after filtering");
        return;
    }

    // Tính trung bình avg_salary theo simplified_role và group_quality
    const salaryRollup = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d.avg_salary),
        d => d.simplified_role,
        d => d.group_quality
    );

    // Tìm giá trị min và max cho gradient
    const allSalaries = filteredData.map(d => d.avg_salary);
    const salaryExtent = d3.extent(allSalaries);

    // Tạo scale màu gradient
    const colorScale = d3.scaleLinear()
        .domain(salaryExtent)
        .range(["#00ff00", "#ff0000"]); // Xanh đến đỏ

    // Chuyển thành dữ liệu bảng
    const roles = Array.from(salaryRollup.keys());
    const tableData = roles.map(role => {
        const row = { simplified_role: role };
        const qualities = salaryRollup.get(role);
        row["Bachelor's Degree"] = qualities.get("Bachelor's Degree") || 0;
        row["Master's Degree"] = qualities.get("Master's Degree") || 0;
        row["Doctorate"] = qualities.get("Doctorate") || 0;
        return row;
    });

    // Tạo bảng
    const container = d3.select("#salary-quality-table-analysis")
        .append("div")
        .style("max-height", "400px")
        .style("max-width", "800px")
        .style("margin", "0 auto")
        .style("overflow-y", "auto")
        .style("overflow-x", "auto")
        .style("width", "100%");

    const table = container.append("table")
        .style("border-collapse", "collapse")
        .style("width", "100%");

    // Thêm CSS cho bảng
    table.style("border", "1px solid #ddd")
        .selectAll("th, td")
        .style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("text-align", "left");

    // Tạo tiêu đề
    const headers = ["Role", "Bachelor's Degree", "Master's Degree", "Doctorate"];
    table.append("thead")
        .append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d => d)
        .style("background-color", "#f2f2f2")
        .style("font-weight", "bold");

    // Tạo hàng
    const rows = table.append("tbody")
        .selectAll("tr")
        .data(tableData)
        .enter()
        .append("tr");

    // Tạo ô
    rows.selectAll("td")
        .data(d => [
            { value: d.simplified_role, isSalary: false },
            { value: d3.format("$,.0f")(d["Bachelor's Degree"]), rawValue: d["Bachelor's Degree"], isSalary: true },
            { value: d3.format("$,.0f")(d["Master's Degree"]), rawValue: d["Master's Degree"], isSalary: true },
            { value: d3.format("$,.0f")(d["Doctorate"]), rawValue: d["Doctorate"], isSalary: true }
        ])
        .enter()
        .append("td")
        .text(d => d.value)
        .style("background-color", d => d.isSalary && d.rawValue !== 0 ? colorScale(d.rawValue) : "transparent")
        .style("color", d => {
            if (!d.isSalary || d.rawValue === 0) return "#000";
            // Tính độ sáng của màu nền để chọn màu chữ phù hợp
            const rgb = d3.rgb(colorScale(d.rawValue));
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128 ? "#000" : "#fff";
        });
}