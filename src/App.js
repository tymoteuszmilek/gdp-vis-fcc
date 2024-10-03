import './App.css';
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

function App() {
  const [gdpData, setGdpData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGDPData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setGdpData(data.data);

      } catch (error) {
        console.error('Error fetching GDP data:', error);
        setError('Failed to fetch data');
      }
    };

    fetchGDPData();
  }, []);

  useEffect(() => {
    if (gdpData.length > 0) {
      const dataset = gdpData.map(d => [new Date(d[0]), d[1]]);
      
      const w = 800;
      const h = 500;
      const padding = 100;

      // Create scales
      const xScale = d3.scaleTime()
        .domain([d3.min(dataset, d => d[0]), d3.max(dataset, d => d[0])])
        .range([padding, w - padding]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])])
        .range([h - padding, padding]);

      // Select the div and append the SVG
      d3.select("#chart").selectAll("*").remove(); // Clear previous chart if re-rendering
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      const tooltip = d3.select("body")
                        .append("div")
                        .attr("id", "tooltip")
                        .style("position", "absolute")
                        .style("display", "none")

      

      // Create bars
      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0])) 
        .attr("y", d => yScale(d[1]))
        .attr("width", (w - 2 * padding) / dataset.length)  // Dynamically size the width of each bar
        .attr("height", d => h - padding - yScale(d[1]))
        .attr("class", "bar")
        .attr("data-date", d => {
          const date = new Date(d[0]);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          console.log(`${year}-${month}-${day}`);
          return `${year}-${month}-${day}`;
        })  
        .attr("data-gdp", d => d[1])
        .on("mouseover", function(event, d) {
          const date = new Date(d[0]);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;

          tooltip
            .style("display", "block")
            .html(`Year: ${d[0].getFullYear()}<br>GDP: $${d[1].toFixed(1)} Billion`)
            .attr("data-date", formattedDate)  // Set tooltip's "data-date" to match the bar's "data-date"
        })
        .on("mousemove", function(event) {
          tooltip
            .attr("id", "tooltip")
            .style("top", `${event.pageY - 50}px`)  // Position above the cursor
            .style("left", `${event.pageX + 10}px`);  // Position to the right of the cursor
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });

      const xAxis = d3.axisBottom(xScale)
                      .tickFormat(d3.timeFormat("%Y"));

      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis);

      svg.append("text")
          .attr("x", w / 2)
          .attr("y", h - 50)
          .attr("text-anchor", "middle")
          .attr("class", "axis-label")
          .text("Year");

      svg.append("text")
          .attr("x", -h / 2)
          .attr("y", 50)
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("class", "axis-label")
          .text("GDP (Billion USD)");
    }
  }, [gdpData]); // Run this effect when gdpData changes

  return (
    <div id='main'>
      <h1 id='title'>United States GDP</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div id="chart"></div> 
      )}
    </div>
  );
}

export default App;
