// partB.js: p2 partB: make your own visualization of Nightingale data
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
'use strict';
import {
  // what else do you want to import from common.js?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  dataProc, fnColor, capsMonth,
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (1L in ref)
  d3,
} from './common.js';

// new things you might want to use for partB()
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)

export const partB = (id, csvData) => {
  const svg = d3.select(`#${id}`);
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  const data = dataProc(csvData);
  const marg = 100;
  const width = parseFloat(svg.style('width'));
  const height = parseFloat(svg.style('height'));
  const sums = data.map((d) => d.zNum + d.wNum + d.oNum);
  const maxNum = d3.max(data.map((d) => Math.max(...sums)));
  const months = data.map((d) => `${d.month} ${d.year}`);
  const xScale = d3
    .scaleLinear()
    .domain([0, maxNum])
    .range([0, width - 2 * marg]);
  const yScale = d3
    .scaleBand()
    .domain(months)
    .range([0, height/2])
    .padding(0.1);
  const rgb = [
    fnColor.blue, // for zymotic
    fnColor.pink, // for wounds
    fnColor.gray, // for other
  ];

  const stackGen = d3.stack()
    .keys(["zNum", "wNum", "oNum"])
  const stackSeries = stackGen(data);
  console.log(stackSeries);
  console.log(months);

  const outer = svg
    .append('g')
    .attr('transform', `translate(${marg},${(0 * height) / 3 + marg})`);
  outer
    .append('g')
    .attr('class', 'axis axis--x')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .attr('transform', 'rotate(20)');
  outer
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisTop(xScale))
  outer.append('g')
    .selectAll('g')
    .data(stackSeries)
    .enter().append('g')
      .attr('fill', (d, i) => rgb[i])
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
        .attr('x', d => xScale(d[0]))
        .attr('y', (d,i) => yScale(months[i]))
        .attr('height', yScale.bandwidth())
        .attr('width', d => Math.abs(xScale(d[0] - xScale(d[1]))));
  outer
    .append('text')  
    .attr('transform', `translate(${width/2},-50)`)
    .attr('text-anchor', 'middle') 
    .text('DIAGRAM of the CAUSES of MORTALITY in the ARMY in the EAST');
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (49L in ref)
};
