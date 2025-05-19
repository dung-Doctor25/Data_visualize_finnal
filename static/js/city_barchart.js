function drawcityBarChart(data) {
    console.log("Input data for city barchart:", data);

    // Lọc dữ liệu hợp lệ
    const filteredData = data.filter(d => d.city && d.city !== '');
    console.log("Filtered data for city barchart:", filteredData);

    // Kiểm tra dữ liệu rỗng
    if (filteredData.length === 0) {
        d3.select("#city-chart")
            .append("p")
            .text("No valid city data available.");
        return;
    }

    // Tổng hợp số công việc theo city
    const cityCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => d.city
    );

    // Tạo dữ liệu cho biểu đồ
    const chartData = Array.from(cityCounts, ([city, count]) => ({
        city,
        count
    })).sort((a, b) => b.count - a.count);

    // Cài đặt kích thước
    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Xóa biểu đồ cũ
    d3.select("#city-chart").selectAll("*").remove();

    // Tạo SVG
    const svg = d3.select("#city-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("max-width", "100%")
        .style("display", "block")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo tỷ lệ
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.city))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.count)])
        .range([height, 0])
        .nice();

    // Tạo tooltip
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#333")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none");
    }

    // Vẽ thanh
    svg.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.city))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#3b82f6")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#1e40af");
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`City: ${d.city}<br>Number of Jobs: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function() {
            d3.select(this).attr("fill", "#3b82f6");
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

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
        .call(d3.axisLeft(y).ticks(5));
}