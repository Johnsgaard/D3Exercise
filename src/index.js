import * as d3 from 'd3';
import './index.css';

//Supported Communities
const supportedComms = ['EDG', 'ACA', 'BNF', 'CRE', 'PAN'];

// Bar Graph Config
const margin = {
  top: 70,
  right: 100,
  bottom: 70,
  left: 100,
};

const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);

// SVG element for Pie Chart
const PieChart = d3.select("#multiGraph")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// SVG element for Bar Graph
const barGraph = d3.select("#barGraph")
  .append("svg")
    .attr("class", "graphContainer")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

// START BAR GRAPH VISUALIZATION
const renderBarGraph = () => {
  d3.json('/CityOfCalgary2016.json', (error, data) => {
    if(error) { throw error; }
    // filter all of the census data to only display supported communities
    const filteredData = data.filter(d => supportedComms.includes(d.COMM_CODE));
    x.domain(filteredData.map(d => {
      return d.NAME;}))
    y.domain([0, d3.max(filteredData, (d) => {
      //typecast to a number
      const resCount = parseInt(d.RES_CNT, 10);
      return resCount;
    })]);

    // graph title
    barGraph.append("text")
      .attr("class", "graphTitle")
      .attr("x", width / 3)
      .attr("y", -margin.top + 30)
      .text("City of Calgary Census 2016");

    // axis elements
    barGraph.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "axis")
      .call(d3.axisBottom(x));

    barGraph.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));

    // graph data
    barGraph.selectAll(".bar")
      .data(filteredData)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => { return x(d.NAME); })
        .attr("width", x.bandwidth())
        .attr("y", (d) => {
          const resCount = parseInt(d.RES_CNT, 10);
          return y(resCount);
        })
        .attr("height", (d) => {
          const resCount = parseInt(d.RES_CNT, 10);
          return height - y(d.RES_CNT);
        })
        .on("mouseover", () => tooltip.style("display", null))
        .on("mouseout", () => tooltip.style("display", "none"))
        .on("mousemove", function(d) {
          var xPosition = d3.mouse(this)[0] - 5;
          var yPosition = d3.mouse(this)[1] - 5;
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text(d.RES_CNT);
        });

    // Y axis label
    barGraph.append("text")
      .attr("class", "graphLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Resident Count");

    // X axis label
    barGraph.append("text")
      .attr("class", "graphLabel")
      .attr("transform",
           "translate(" + (width/2) + " ," +
                          (height + margin.top - 20) + ")")
      .style("text-anchor", "middle")
      .text("Communities");

    // Tooltip
    const tooltip = barGraph.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

    tooltip.append("rect")
      .attr("width", 60)
      .attr("height", 20)

    tooltip.append("text")
      .attr("x", 10)
      .attr("dy", "-1em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");
  });
};

renderBarGraph();
