import * as d3 from 'd3';
import './index.css';

// Supported Communities
const supportedComms = ['EDG', 'ACA', 'BNF', 'CRE', 'PAN'];

// Global Constants
const margin = {
  top: 60,
  right: 190,
  bottom: 60,
  left: 190
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

// START BAR GRAPH VISUALIZATION
const renderBarGraph = () => {
  // SVG element for Bar Graph
  const barGraph = d3.select('#barGraph')
    .append('svg')
    .attr('class', 'graphContainer')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Creates tooltip for bar graph
  const tooltip = barGraph.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none');

  tooltip.append('rect')
    .attr('width', 60)
    .attr('height', 20);

  tooltip.append('text')
    .attr('x', 10)
    .attr('dy', '-1em')
    .style('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold');

  d3.json('/CityOfCalgary2016.json', (error, data) => {
    if (error) { throw error; }
    // filter all of the census data to only display supported communities
    const filteredData = data.filter(d => supportedComms.includes(d.COMM_CODE));
    x.domain(filteredData.map(d => {
      return d.NAME;
    }));
    y.domain([0, d3.max(filteredData, (d) => {
      // typecast to a number
      const resCount = parseInt(d.RES_CNT, 10);
      return resCount;
    })]);

    // graph title
    barGraph.append('text')
      .attr('class', 'graphTitle')
      .attr('x', width / 3)
      .attr('y', -margin.top + 30)
      .text('City of Calgary Census 2016');

    // axis elements
    barGraph.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'axis')
      .call(d3.axisBottom(x));

    barGraph.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y));

    // graph data
    barGraph.selectAll('.bar')
      .data(filteredData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.NAME))
      .attr('width', x.bandwidth())
      .attr('y', (d) => {
        const resCount = parseInt(d.RES_CNT, 10);
        return y(resCount);
      })
      .attr('height', (d) => {
        const resCount = parseInt(d.RES_CNT, 10);
        return height - y(resCount);
      })
      .on('mouseover', () => tooltip.style('display', null))
      .on('mouseout', () => tooltip.style('display', 'none'))
      .on('mousemove', function mouseMove(d) {
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
        tooltip.select('text').text(d.RES_CNT);
      });

    // Y axis label
    barGraph.append('text')
      .attr('class', 'graphLabel')
      .attr('transform', 'rotate(-90)')
      .attr('y', 10 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Resident Count');

    // X axis label
    barGraph.append('text')
      .attr('class', 'graphLabel')
      /* eslint-disable no-mixed-operators */
      .attr(
        'transform',
        'translate(' + (width / 2) + ' ,' +
                          (height + margin.top - 20) + ')'
      )
      /* eslint-enable no-mixed-operators */
      .style('text-anchor', 'middle')
      .text('Communities');
  });
};
// END BAR GRAPH VISUALIZATION

// START DONUT CHART VISUALIZATION
const renderPieViz = (dataKey = 'SECTOR') => {
  // Array that will hold all data that is too small to plot on the graph
  var smallData = [];

  // Creates a simple object structure to display RES_CNT total depending on
  // passed in parameter ( dataKey )
  var simpleObj = {};
  // SVG element for Pie Chart
  const pieChart = d3.select('#multiGraph')
    .append('svg')
    .attr('id', 'resCountSVG')
    .attr('class', 'pie')
    .attr('width', width)
    .attr('height', height + margin.top)
    .append('g')
    /* eslint-disable no-mixed-operators */
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    /* eslint-enable no-mixed-operators */
  d3.json('/CityOfCalgary2016.json', (error, data) => {
    if (error) { throw error; }


    data.forEach(d => {
      const resCount = parseInt(d.RES_CNT, 10);
      // Totals up the RES_CNT
      if (typeof simpleObj[d[dataKey]] !== 'undefined') {
        const prev = simpleObj[d[dataKey]].valueOf();
        simpleObj[d[dataKey]] = (prev + resCount);
        return;
      }
      // if the sector does not exist create a new sector and init it with the RES_CNT
      simpleObj[d[dataKey]] = resCount;
    });

    // Re-formats the ( simpleObj ) data so data being passed into d3.pie
    // method has both key and value. For labelling purposes.
    const pieObject = [];
    Object.entries(simpleObj).forEach(sector => {
      var formattedObj = {};
      formattedObj.key = sector[0];
      formattedObj.val = sector[1];
      return pieObject.push(formattedObj);
    });

    // Colours for chart
    const colorWheel = d3.scaleOrdinal()
      .range(['#e36363', '#f2ae47', '#fcff65', '#7af45b', '#6fdcff', '#728de9',
        '#8f349a', '#ee567f', '#e3c49b']);

    // Configures charts shape
    const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 0.6);

    const labelArc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 1.5);

    // Constructs a new Pie element
    const pie = d3.pie()
      .sortValues((a, b) => { return a - b; })
      .value(d => d.val);

    // Creates arc elements
    const group = pieChart.selectAll('.arc')
      .data(pie(pieObject)).enter()
      .append('g')
      .attr('class', 'arc');

    // Creates path and fills with color using ( val )
    group.append('path')
      .attr('d', arc)
      .style('fill', d => colorWheel(d.data.val));

    // Label ( key )
    group.append('text')
      .attr('class', 'labelKey')
      .attr('transform', (d) => ('translate(' + labelArc.centroid(d) + ')'))
      .attr('dx', '-2em')
      .text(d => {
        if (d.data.val < 5000) {
          // Prevent squishing of text and add small data to smallData array
          smallData.push({ key: d.data.key, val: d.data.val });
          return null;
        }
        return d.data.key;
      });

    // Label ( val )
    group.append('text')
      .attr('class', 'labelVal')
      .attr('transform', (d) => ('translate(' + labelArc.centroid(d) + ')'))
      .attr('dx', '-2em')
      .attr('dy', '1em')
      .text(d => {
        if (d.data.val < 5000) { return null; }
        return d.data.val.toLocaleString();
      });

    // Creates a legend for squished data on graph
    if (smallData.length > 0) {
      const legend = d3.select('#multiGraph')
        .append('g')
        .attr('height', '100px')
        .attr('width', '100px')
        .attr('id', 'legend');

      legend.append('text')
        .attr('id', 'legendHeader')
        .text('Resident count less than 5000:');

      smallData.forEach(entry => {
        legend.append('tspan')
          .attr('x', 20)
          .attr('y', 20)
          .text(entry.key + ': ' + entry.val);
      });
    }
  });
};
// END DONUT CHART VISUALIZATION

// Remove SVG element from the DOM to replace with selected element
const clearSVG = () => {
  if (document.getElementById('resCountSVG')) document.getElementById('resCountSVG').remove();
  if (document.getElementById('legend')) document.getElementById('legend').remove();
};

// Update chart title
const updateTitle = (title) => {
  document.getElementById('chartHeader').innerHTML = title;
};

// Adding event listeners to DOM inputs
if (document.getElementById('sectorBtn') || document.getElementById('commBtn')) {
  document.getElementById('sectorBtn').addEventListener('click', () => {
    clearSVG();
    updateTitle('Resident Count for City Sectors');
    renderPieViz('SECTOR');
  });

  document.getElementById('commBtn').addEventListener('click', () => {
    clearSVG();
    updateTitle('Resident Count for Community Structures');
    renderPieViz('COMM_STRUCTURE');
  });
}

renderPieViz();
renderBarGraph();
