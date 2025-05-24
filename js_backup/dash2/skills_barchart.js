function drawSkillsBarChart(data) {
    // Đếm số lượng distinct Job Id theo kỹ năng
    const skillCounts = d3.rollup(
        data,
        v => new Set(v.map(d => d['Job Id'])).size,
        d => d.skills
    );

    // Chuyển thành mảng và lấy top 10
    const skillData = Array.from(skillCounts, ([skill, count]) => ({ skill, count }))
        .filter(d => d.skill)
        .sort((a, b) => d3.descending(a.count, b.count))
        .slice(0, 10);

    // Thiết lập kích thước
    const margin = { top: 30, right: 10, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Tạo SVG
    const svg = d3.select("#skills-barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo tỷ lệ
    const x = d3.scaleBand()
        .domain(skillData.map(d => d.skill))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(skillData, d => d.count) * 1.1])
        .nice()
        .range([height, 0]);

    // Tạo tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Vẽ thanh
    svg.selectAll(".bar")
        .data(skillData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.skill))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#3182ce")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#2b6cb0");
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`Skill: ${d.skill}<br>Jobs: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "#3182ce");
            tooltip.transition()
                .duration(500)
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
        .attr("transform", "rotate(-45)")
        .style("font-size", "12px");

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");
}