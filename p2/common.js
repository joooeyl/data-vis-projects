// common.js: things possibly useful for both p2 parts A and B
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
'use strict';

/* import and then export d3. This does depend on having a network connection.  If that is
  inconvenient to you, please post something on EdStem saying so and GLK will try to fix this for
  future assignments. */
import * as d3 from 'https://cdn.skypack.dev/d3@7';
export { d3 };

/* capsMonth: mapping from month abbreviation (as in nightingale.csv) to all-caps full month name
(as seen in Nightingale's visualization) */
export const capsMonth = {
  jan: 'JANUARY',
  feb: 'FEBRUARY',
  mar: 'MARCH',
  apr: 'APRIL',
  may: 'MAY',
  jun: 'JUNE',
  jul: 'JULY',
  aug: 'AUGUST',
  sep: 'SEPTEMBER',
  oct: 'OCTOBER',
  nov: 'NOVEMBER',
  dec: 'DECEMBER',
};

/* captionText is an array of paragraphs of the caption text in Nightingale's visualization, where
each paragraph is an array of lines */
export const captionText = [
  [
    'The Areas of the blue, red, & black wedges are each measured from the',
    'centre as the common vertex.',
  ],
  [
    'The blue wedges measured from the centre of the circle represent area',
    'for area the deaths from Preventible or Mitigable Zymotic diseases; the',
    'red wedges measured from the centre the deaths from wounds; & the',
    'black wedges measured from the centre the deaths from all other causes.',
  ],
  [
    'The black line across the red triangle in Nov. 1854 marks the boundary of',
    'the deaths from all other causes during the month.',
  ],
  [
    'In October 1854, & April 1855, the black area coincides with the red,',
    'in January & February 1856, the blue coincides with the black.',
  ],
  [
    'The entire areas may be compared by following the blue, the red, & the',
    'black lines enclosing them.',
  ],
];

/* fnColor: possible colors for use in matching the appearance of Nightingale's visualization;
these were found by averaging pixel values in
https://en.wikipedia.org/wiki/File:Nightingale-mortality.jpg but these were not calibrated so they
are only approximate; feel free to improve on them with your own different set of colors (below).
*/
export const fnColor = {
  blue: d3.rgb(185, 200, 240),
  pink: d3.rgb(220, 195, 190),
  gray: d3.rgb(160, 160, 160),
  bkgd: d3.rgb(252, 248, 247), // color of paper (background) itself, lightened for better contrast
};

/* define, and export, anything else here that you want to use in both part1.js and part2.js The
 reference code, for example, defines a "dataProc" function that processes the data coming from the
 CSV file, in the way that it is passed to partA() and partB().  Then partA() and partB() start by
 calling dataProc (it would be cleaner if dataProc were called only once, but oh well.) */
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
export function dataProc(csvData) {
  return csvData.map((d,i) => {
    console.log(`incoming row ${i} =`, d);
    const ret = {
      month: capsMonth[d.month],
      year: +d.year,
      zNum: +d.diseaseDeath,
      wNum: +d.woundDeath,
      oNum: +d.otherDeath,
      zRate: +d.diseaseRate,
      wRate: +d.woundRate,
      oRate: +d.otherRate,
    };
    console.log(`outgoing row ${i} =`, ret);
    return ret;
  });
}

export const outColor = {
  blue: d3.rgb(69, 112, 229),
  pink: d3.rgb(200, 106, 87),
  gray: d3.rgb(16, 16, 16),
};
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (20L in ref)
