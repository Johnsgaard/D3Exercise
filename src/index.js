import * as d3 from 'd3';
import './index.css';

//Supported Communities
const supportedComms = ['EDG', 'ACA', 'BNF', 'CRE', 'PAN'];

// Bar Graph Config
const margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 40
};

const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const x = d3.scaleOrdinal([0, width], .1, .3);
const y = d3.scaleLinear([height, 0]);

const barGraph = d3.select("#barGraph")
  .append("svg")
  .attr("class", "graphContainer")
  .attr("width", width + (2 * margin.left) + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const xAxis = d3.axisBottom(x);

const yAxis = d3.axisLeft(y);

const renderBarGraph = () => {
  d3.json('/CityOfCalgary2016.json', function(error, data) {
    if(error) { throw error; }
    // filter all of the census data to only display supported communities
    const filteredData = data.filter(d => supportedComms.includes(d.COMM_CODE));
    x.domain(filteredData.map(d => {
      return d.COMM_CODE;
    }));
    y.domain([0, d3.max(filteredData, (d) => {
      //typecast to a number
      const resCount = parseInt(d.RES_CNT, 10);
      return resCount;
    })]);

    barGraph.append("text")
      .attr("class", "title")
      .attr("x", 20)
      .attr("y", 20)
      .text("City of Calgary Census 2016");

    barGraph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll(".tick text")
      .call(wrap, x.bandWidth())
      .text("Communities");

    barGraph.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .text("Resident Count");

    barGraph.selectAll(".bar")
      .data(filteredData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.COMM_CODE); })
      .attr("width", x.bandWidth())
      .attr("y", function(d) { return y(parseInt(d.RES_CNT, 10)); })
      .attr("height", function(d) { return height - y(parseInt(d.RES_CNT, 10)); });
  });
};

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function type(d) {
  d.value = +d.value;
  return d;
}

renderBarGraph();
