function makeResponsive() {
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = 950;
  var svgHeight = 650;

  var margin = {
    top: 20,
    right: 40,
    bottom: 92,
    left: 90,
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(stateData, (d) => d[chosenXAxis]) * 0.8,
        d3.max(stateData, (d) => d[chosenXAxis]) * 1.2,
      ])
      .range([0, width]);
    return xLinearScale;
  }

  function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(stateData, (d) => d[chosenYAxis]) * 0.8,
        d3.max(stateData, (d) => d[chosenYAxis]) * 1.2,
      ])
      .range([height, 0]);
    return yLinearScale;
  }

  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition().duration(1000).call(bottomAxis);
    return xAxis;
  }

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition().duration(1000).call(leftAxis);
    return yAxis;
  }

  function renderCircles(
    circlesGroup,
    newXScale,
    chosenXAxis,
    newYScale,
    chosenYAxis
  ) {
    circlesGroup
      .transition()
      .duration(1000)
      .attr("cx", (d) => newXScale(d[chosenXAxis]))
      .attr("cy", (d) => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  function renderText(
    textGroup,
    newXScale,
    chosenXAxis,
    newYScale,
    chosenYAxis
  ) {
    textGroup
      .transition()
      .duration(1000)
      .attr("x", (d) => newXScale(d[chosenXAxis]))
      .attr("y", (d) => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");

    return textGroup;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty (%)";
    } else if (chosenXAxis === "age") {
      var xLabel = "Age (Median)";
    } else {
      var xLabel = "Household Income (Median)";
    }
    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
    } else if (chosenYAxis === "obesity") {
      var yLabel = "Obese (%)";
    } else {
      var yLabel = "Smokes (%)";
    }

    var toolTip = d3
      .tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function (d) {
        return `<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`;
      });

    circlesGroup.call(toolTip);

    circlesGroup
      .on("mouseover", function (data) {
        toolTip.show(data, this);
      })

      .on("mouseout", function (data) {
        toolTip.hide(data);
      });

    textGroup.call(toolTip);

    textGroup
      .on("mouseover", function (data) {
        toolTip.show(data, this);
      })

      .on("mouseout", function (data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

  d3.csv("assets/data/data.csv").then(function (stateData) {
    stateData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(stateData, chosenXAxis);

    var yLinearScale = yScale(stateData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);

    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    var circlesGroup = chartGroup
      .selectAll(".stateCircle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateCircle")
      .attr("r", 15)
      .attr("opacity", ".75");

    var textGroup = chartGroup
      .selectAll(".stateText")
      .data(stateData)
      .enter()
      .append("text")
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis] * 0.98))
      .text((d) => d.abbr)
      .attr("class", "stateText")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    var xLabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("Poverty (%)");

    var ageLabel = xLabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");

    var yLabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(-25, ${height / 2})`);

    var healthcareLabel = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0)
      .attr("value", "healthcare")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    var circlesGroup = updateToolTip(
      chosenXAxis,
      chosenYAxis,
      circlesGroup,
      textGroup
    );

    xLabelsGroup.selectAll("text").on("click", function () {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(stateData, chosenXAxis);

        xAxis = renderXAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        textGroup = renderText(
          textGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        circlesGroup = updateToolTip(
          chosenXAxis,
          chosenYAxis,
          circlesGroup,
          textGroup
        );

        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        } else if (chosenXAxis === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
        } else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
        }
      }
    });

    yLabelsGroup.selectAll("text").on("click", function () {
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        yLinearScale = yScale(stateData, chosenYAxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        textGroup = renderText(
          textGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        circlesGroup = updateToolTip(
          chosenXAxis,
          chosenYAxis,
          circlesGroup,
          textGroup
        );

        if (chosenYAxis === "healthcare") {
          healthcareLabel.classed("active", true).classed("inactive", false);
          obesityLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
        } else if (chosenYAxis === "obesity") {
          healthcareLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", true).classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
        } else {
          healthcareLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
        }
      }
    });
  });
}
makeResponsive();

d3.select(window).on("resize", makeResponsive);
