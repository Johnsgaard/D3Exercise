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

const x = d3.scaleOrdinal([0, width], .1);
const y = d3.scaleLinear([height, 0]);

const barGraph = d3.select("#barGraph")
  .append("svg") //append svg element inside #barGraph
  .attr("width", width + (2 * margin.left) + margin.right) //set width
  .attr("height", height + margin.top + margin.bottom); //set height

const xAxis = d3.axisBottom(x);

const yAxis = d3.axisLeft(y);

const renderBarGraph = () => {
  d3.json('/CityOfCalgary2016.json', function(error, data) {
    // filter all of the census data to only display supported communities
    const filteredData = data.filter(d => supportedComms.includes(d.COMM_CODE));
    x.domain(filteredData.map(d => {
      return d.COMM_CODE;
    }));
    y.domain([0, d3.max(data, function(d) {
      return d.RES_CNT;
    })]);

    var bar = barGraph.selectAll("g")
      .data(filteredData)
      .enter()
      .append("g")
      .attr("transform", function(d, i) {
        return "translate(" + x(d.COMM_CODE) + ", 0)";
      });

    bar.append("rect")
      .attr("y", function(d) {
        return y(d.RES_CNT);
      })
      .attr("x", function(d, i) {
        return x + (margin.left / 2);
      })
      .attr("height", function(d) {
        return height - y(d.RES_CNT);
      })
      .attr("width", x.rangeBand()); //set width base on range on ordinal data

    bar.append("text")
      .attr("x", x.rangeBand() + margin.left)
      .attr("y", function(d) {
        return y(d.RES_CNT) - 10;
      })
      .attr("dy", ".75em")
      .text(function(d) {
        return RES_CNT;
      });

    barGraph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + margin.left + "," + height + ")")
      .call(xAxis)
      .text("Communities");

    barGraph.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Resident Count");
  });
};

renderBarGraph();
