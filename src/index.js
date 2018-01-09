import * as d3 from 'd3';
import './index.css';

//Supported Communities
const supportedComms = ['EDG', 'ACA', 'BNF', 'CRE', 'PAN'];

// Global Constants
const margin = {
  top: 100,
  right: 130,
  bottom: 100,
  left: 130,
};

const width = 1260 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 3;

// Ranges for bar graph
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);

// SVG element for Pie Chart
const pieChart = d3.select("#multiGraph")
  .append("svg")
    .attr("class", "pie")
    .attr("width", width)
    .attr("height", height + margin.top)
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

// Axis for bar graph
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
      .attr("y", - margin.top + 30)
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

    // Creates tooltip for bar graph
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
// END BAR GRAPH VISUALIZATION

// START DONUT CHART VISUALIZATION
const renderPieViz = (dataKey = "SECTOR") => {
  d3.json('/CityOfCalgary2016.json', (error, data) => {
    if(error) { throw error; }

    // Creates a simple object structure to display RES_CNT total depending on
    // passed in parameter ( dataKey )
    var simpleObj = {};
    data.forEach(d => {
      const resCount = parseInt(d.RES_CNT, 10);
      // Totals up the RES_CNT
      if(simpleObj.hasOwnProperty(d[dataKey])) {
        const prev = simpleObj[d[dataKey]].valueOf();
        return simpleObj[d[dataKey]] = (prev + resCount);
      }
      // if the sector does not exist create a new sector and init it with the RES_CNT
      simpleObj[d[dataKey]] = resCount;
    });

    // Re-formats the ( simpleObj ) data so data being passed into d3.pie method has both key and value.
    // For labelling purposes
    const pieObject = [];
    Object.entries(simpleObj).forEach(sector => {
      var formattedObj = {};
      formattedObj.key = sector[0];
      formattedObj.val = sector[1];
      return pieObject.push(formattedObj);
    });

    // Colours for chart
    const colorWheel = d3.scaleOrdinal()
      .range(["#e36363", "#f2ae47", "#fcff65", "#7af45b", "#6fdcff", "#728de9",
        "#8f349a", "#ee567f", "#e3c49b"]);

    // Configures charts shape
    const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 0.6);

    const labelArc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 1.5);

    // Constructs a new Pie element
    const pie = d3.pie()
      // .sort(function(a, b) { return a.val > b.val; })
      .sortValues((a, b) => { return a - b; })
      .value(d => d.val);

    // Creates arc elements
    const group = pieChart.selectAll(".arc")
      .data(pie(pieObject)).enter()
        .append("g")
          .attr("class", "arc");

    // Creates path and fills with color using ( val )
    group.append("path")
      .attr("d", arc)
      .style("fill", d => colorWheel(d.data.val));

    // Label ( key )
    group.append("text")
      .attr("class", "labelKey")
      .attr("transform", (d) => ("translate(" + labelArc.centroid(d) + ")"))
      .attr("dx", "-2em")
      .text(d => d.data.key);

    // Label ( val )
    group.append("text")
      .attr("class", "labelVal")
      .attr("transform", (d) => ("translate(" + labelArc.centroid(d) + ")"))
      .attr("dx", "-2em")
      .attr("dy", "1em")
      .text(d => d.data.val);

  });
};
// END DONUT CHART VISUALIZATION

renderPieViz();
renderBarGraph();
