function drawSalaryCityTable(data) {
    // Debug: Kiểm tra dữ liệu đầu vào
    console.log("Input data:", data);
    
    // Lọc bỏ dữ liệu không hợp lệ
    const filteredData = data
        .filter(d => 
            d.simplified_role && 
            d.simplified_role !== '' && 
            d.city && 
            d.city !== '' && 
            d.avg_salary != null && 
            d.avg_salary > 0
        );

    // Debug: Kiểm tra dữ liệu sau lọc
    console.log("Filtered data:", filteredData);

    // Nếu không có dữ liệu hợp lệ, hiển thị thông báo lỗi
    if (filteredData.length === 0) {
        d3.select("#salary-city-table")
            .append("p")
            .text("No valid simplified_role, city, or salary data available.");
        return;
    }

    // Tính trung bình avg_salary theo simplified_role và city
    const salaryByRoleCity = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d.avg_salary),
        d => d.simplified_role,
        d => d.city
    );

    // Debug: Kiểm tra salaryByRoleCity
    console.log("salaryByRoleCity:", salaryByRoleCity);

    // Tạo danh sách simplified_role và city
    const roles = [...new Set(filteredData.map(d => d.simplified_role))].sort();
    const cities = [...new Set(filteredData.map(d => d.city))].sort();

    // Debug: Kiểm tra roles và cities
    console.log("roles:", roles);
    console.log("cities:", cities);

    // Tạo pivot data
    const pivotData = roles.map(role => {
        const row = { simplified_role: role };
        cities.forEach(city => {
            const avgSalary = salaryByRoleCity.get(role)?.get(city) || 0;
            row[city] = avgSalary.toFixed(2); // Làm tròn 2 chữ số
        });
        return row;
    });

    // Debug: Kiểm tra pivotData
    console.log("pivotData:", pivotData);

    // Tạo tỷ lệ màu gradient xanh da trời
    const salaryValues = pivotData.flatMap(row => 
        cities.map(city => +row[city])
    ).filter(v => v > 0);
    const salaryMin = d3.min(salaryValues) || 0;
    const salaryMax = d3.max(salaryValues) || 100000; // Giả định max nếu không có dữ liệu
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([salaryMin, salaryMax])
        .clamp(true);

    // Tạo container cho bảng với thanh cuộn
    const container = d3.select("#salary-city-table")
        .append("div")
        .style("max-height", "400px")
        .style("max-width", "600px")
        .style("overflow-x", "auto")
        .style("overflow-y", "auto")
        .style("width", "100%");

    // Tạo bảng
    const table = container.append("table")
        .style("border-collapse", "collapse")
        .style("width", "100%");

    // Thêm header
    const thead = table.append("thead").append("tr");
    thead.append("th").text("Role");
    cities.forEach(city => {
        thead.append("th").text(city);
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
        tr.append("td").text(row.simplified_role);
        cities.forEach(city => {
            const value = +row[city];
            tr.append("td")
                .text(value > 0 ? value.toFixed(0) +"$": "-")
                .style("background-color", value > 0 ? colorScale(value) : "#fff")
                .on("mouseover", function(event) {
                    d3.select(this).style("background-color", value > 0 ? d3.rgb(colorScale(value)).darker(0.5) : "#edf2f7");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Role: ${row.simplified_role}<br>City: ${city}<br>Average Salary: ${value > 0 ? value.toFixed(0) +"$" : "-"}`)

                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseleave", function() {
                    d3.select(this).style("background-color", value > 0 ? colorScale(value) : "#fff");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });
    });
}