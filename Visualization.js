import React, { Component } from 'react';
import * as d3 from 'd3';

class Visualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorBy: 'Sentiment',
      selectedTweets: [],
    };
    this.simulation = null;
  }

  componentDidMount() {
    this.createVisualization();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.tweets !== this.props.tweets || prevState.colorBy !== this.state.colorBy) {
      this.createVisualization();
    }
  }

  createVisualization = () => {
    const { tweets } = this.props;
    const { colorBy } = this.state;

    const data = tweets.slice(0, 300);
    d3.select('#chart').selectAll('*').remove();
    const svgWidth = 1000;  
    const svgHeight = 500;
    const svg = d3.select('#chart').append('svg').attr('width', svgWidth).attr('height', svgHeight);


    const monthOrder = ['March', 'April', 'May'];
    const uniqueMonths = monthOrder.filter(month => data.some(tweet => tweet.Month === month));

    const monthCenters = {};
    const verticalSpacing = svgHeight/(uniqueMonths.length + 1);
    uniqueMonths.forEach((month, index) => {
      monthCenters[month]= (index +1)*verticalSpacing;
    });


    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);
    const getColor = (d) => colorBy === 'Sentiment' ? sentimentColorScale(d.Sentiment) : subjectivityColorScale(d.Subjectivity);

    this.simulation = d3.forceSimulation(data).force('x', d3.forceX(svgWidth / 2).strength(0.1)).force('y', d3.forceY(d => monthCenters[d.Month]).strength(4)).force('collide', d3.forceCollide(5));

    for (let i = 0; i < 300; i++) {
      this.simulation.tick();
    }

    svg.selectAll('circle').data(data).join('circle')
    .attr('r', 4)
    .attr('fill', getColor)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('stroke', 'none')
    .attr('stroke-width', 2)
    .on('click', (event, d) => this.handleTweetClick(event, d));

  svg.selectAll('text').data(uniqueMonths).join('text')
    .attr('x', 10) 
    .attr('y', d => monthCenters[d])
    .attr('text-anchor', 'start')
    .text(d => d)
    .style('font-size', '14px')
    .style('font-weight', 'bold');


    this.createLegend(svg, svgWidth - 120, svgHeight / 2 - 100);
  };

  createLegend = (svg, x, y) => {
    const { colorBy } = this.state;

    const legendHeight = 200;
    const legendWidth = 25;

    const legend = svg.append('g')
      .attr('transform', `translate(${x}, ${y})`);

    const gradient = legend.append('defs')
      .append('linearGradient')
      .attr('id', 'color-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);
    const colorScale = colorBy === 'Sentiment' ? sentimentColorScale : subjectivityColorScale;

    const gradientStops = colorBy === 'Sentiment'
      ? [
          { offset: '0%', color: colorScale(-1) },
          { offset: '50%', color: colorScale(0) },
          { offset: '100%', color: colorScale(1) }
        ]
      : [
          { offset: '0%', color: colorScale(0) },
          { offset: '100%', color: colorScale(1) }
        ];

    gradientStops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color);
    });

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#color-gradient)');

    legend.append('text')
      .attr('x', legendWidth + 5)
      .attr('y', 10)
      .text(colorBy === 'Sentiment' ? 'Positive' : 'Subjective')
      .style('font-size', '16px')
      .style('font-weight', 'bold');

    legend.append('text')
      .attr('x', legendWidth + 5)
      .attr('y', legendHeight)
      .text(colorBy === 'Sentiment' ? 'Negative' : 'Objective')
      .style('font-size', '16px')
      .style('font-weight', 'bold');
  };

  handleTweetClick = (event, tweet) => {
    this.setState(prevState => {
      let selectedTweets;
      if (prevState.selectedTweets.includes(tweet)) {
        selectedTweets = prevState.selectedTweets.filter(t => t !== tweet);
        d3.select(event.target).attr('stroke', 'none');
      } else {
        selectedTweets = [tweet, ...prevState.selectedTweets];
        d3.select(event.target).attr('stroke', 'black');
      }
      return { selectedTweets };
    });
  };

  handleDropdownChange = (e) => {
    this.setState({ colorBy: e.target.value, selectedTweets: [] }); 
  };

  render() {
    return (
      <div>
        <label>Color By: </label>
        <select onChange={this.handleDropdownChange} value={this.state.colorBy}>
          <option value="Sentiment">Sentiment</option>
          <option value="Subjectivity">Subjectivity</option>
        </select>
        <div id="chart"></div>
        <div>
          {this.state.selectedTweets.map((tweet, idx) => (
            <p key={idx}>{tweet.RawTweet}</p>
          ))}
        </div>
      </div>
    );
  }
}

export default Visualization;
