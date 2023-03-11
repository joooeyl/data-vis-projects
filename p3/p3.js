// p3.js: p3 student code
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
/*
NOTE: Document here (after the "begin  student  code" line)
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
https://stackoverflow.com/questions/61057507/how-to-convert-object-properties-string-to-integer-in-javascript
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
anyone or anything extra you used for this work.  Besides your instructor and TA (and project
partner, if you partnered with someone) who else did you work with?  What other code or web pages
helped you understand what to do and how to do it?  It is not a problem to seek more help to do
this work!  This is just to help the instructor know about other useful resources, and to help the
graders understand sources of code similarities.
*/
'use strict';
import {
  d3, parm, glob,
  // what else do you want to import from common.js?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (1L in ref)
} from './common.js';

/* create the annotated balance bars for popular and electoral college votes */
export const balanceInit = function (did, sid) {
  const div = document.getElementById(did);
  /* appending elements to the div likely changes clientWidth and clientHeight, hence the need to
  save these values representing the original grid */
  const ww = div.clientWidth;
  let hh = div.clientHeight;
  const svg = d3.select('#' + did).append('svg');
  // make svg fully occupy the (original) containing div
  svg.attr('id', sid).attr('width', ww).attr('height', hh);
  const wee = 2;
  const bal = svg.append('g').attr('transform', `translate(0,${2 * wee})`);
  hh -= 2 * wee;
  /* ascii-hard to help keep coordinates and ids straight
                     L                                                        R
  +                  ----------------------------|-----------------------------
        popular vote | #D-pv-bar,#D-pv-txt       |        #R-pv-bar,#R-pv-txt |
  H                  ----------------------------|-----------------------------
                       #D-name                   |                    #R-name
                     ----------------------------|-----------------------------
   electoral college | #D-ec-bar,#D-ec-txt       |        #R-ec-bar,#R-ec-txt |
                     ----------------------------|-----------------------------
  */
  // some convenience variables for defining geometry
  const L = ww / 7,
    R = (6.5 * ww) / 7,
    H = hh / 3;
  // mapping over an array of adhoc parameter objects to avoid copy-pasta
  [
    // create the left-side labels for the two bars
    { y: 0.5 * H, t: 'Popular Vote' },
    { y: 2.5 * H, t: 'Electoral College' },
  ].map((i) => {
    bal
      .append('text')
      .attr('transform', `translate(${L - wee},${i.y})`)
      .style('text-anchor', 'end')
      .html(i.t);
  });
  const parts = [
    /* the bars and text values for the four counts: {D,R}x{popular vote, electoral college}, and,
    the two candidate names */
    { id: 'D-pv', p: -1, y: 0 },
    { id: 'D-name', p: -1, y: H },
    { id: 'D-ec', p: -1, y: 2 * H },
    { id: 'R-pv', p: 1, y: 0 },
    { id: 'R-name', p: 1, y: H },
    { id: 'R-ec', p: 1, y: 2 * H },
  ];
  parts.map((i) => {
    if (!i.id.includes('name')) {
      bal
        .append('rect')
        .attr(
          /* NOTE how these bars are transformed: your code only needs to set width (even though
          the D bars grow rightward, and the R bars grown leftward), and, your code doesn't need to
          know the width in pixels.  Just set width to 0.5 to make the bar go to the middle */
          'transform',
          i.p < 0 ? `translate(${L},0) scale(${R - L},1)` : `translate(${R},0) scale(${L - R},1)`
        )
        .attr('x', 0)
        .attr('y', i.y)
        .attr('height', H)
        .attr('fill', i.p < 0 ? parm.colorDem : parm.colorRep)
        // NOTE: select the bars with '#D-pv-bar', '#D-ec-bar', '#R-pv-bar', '#R-ec-bar'
        .attr('id', `${i.id}-bar`)
        .attr('width', 0.239); // totally random initial fractional value
    }
  });
  parts.map((i) => {
    const txt = bal
      .append('text')
      .attr('transform', `translate(${i.p < 0 ? L + wee : R - wee},${i.y + 0.5 * H})`)
      .style('text-anchor', i.p < 0 ? 'start' : 'end')
      // NOTE: select the text fields with '#D-pv-txt', '#D-ec-txt', '#R-pv-txt', '#R-ec-txt'
      .attr('id', `${i.id}${i.id.includes('name') ? '' : '-txt'}`);
    txt.html('#' + txt.node().id); // initialize text to show its own CSS selector
  });
  bal
    .append('line')
    .attr('x1', (L + R) / 2)
    .attr('x2', (L + R) / 2)
    .attr('y1', 0)
    .attr('y2', hh)
    .attr('stroke-width', 1)
    .attr('stroke', '#fff');
};

/* canvasInit initializes the HTML canvas that we use to draw a picture of the bivariate colormap
underneath the scatterplot. NOTE THAT AS A SIDE-EFFECT this sets glob.scatContext and
glob.scatImage, which you must use again later when changing the pixel values inside the canvas */
export const canvasInit = function (id) {
  const canvas = document.querySelector('#' + id);
  canvas.width = parm.scatSize;
  canvas.height = parm.scatSize;
  glob.scatContext = canvas.getContext('2d');
  glob.scatImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);
  /* set pixels of glob.scatImage to checkerboard pattern with ramps; the only purpose of this is
  to show an example of traversing the scatImage pixel array, in a way that (with thought and
  scrutiny) identifies how i and j are varying over the image as it is seen on the screen. NOTE
  that nested for() loops like this are an idiomatic way of working with pixel data arrays, as
  opposed to functional idioms like .map() that we use for other kinds of data. */
  for (let k = 0, j = 0; j < parm.scatSize; j++) {
    for (let i = 0; i < parm.scatSize; i++) {
      glob.scatImage.data[k++] =
        100 + // RED channel is a constant plus ...
        (120 * i) / parm.scatSize + // ... ramp up along i,
        30 * (Math.floor(i / 40) % 2); // with wide bands
      glob.scatImage.data[k++] =
        100 + // GREEN channel is a constant plus ...
        (120 * j) / parm.scatSize + // ... ramp up along with j,
        30 * (Math.floor(j / 10) % 2); // with narrow bands
      glob.scatImage.data[k++] = 30; // BLUE channel is constant
      glob.scatImage.data[k++] = 255; // 255 = full OPACITY (don't change)
    }
  }
  /* display scatImage inside canvas.
  NOTE that you will need to call this again (exactly this way, with these variable names)
  anytime you change the scatImage.data canvas pixels */
  glob.scatContext.putImageData(glob.scatImage, 0, 0);
};

/* Place the scatterplot axis labels, and finalize the stacking of both the labels and the
scatterplot marks over the canvas. That this assumes many specific element ids in the DOM is likely
evidence of bad design */
export const scatLabelPos = function () {
  // place the scatterplot axis labels.
  const marg = 30; // around the scatterplot domain
  const wee = 7; // extra tweak to text position
  const sz = parm.scatSize;
  /* since these two had style "position: absolute", we have to specify where they will be, and
  this is done relative to the previously placed element, the canvas */
  /* (other functions here in p3.js try to avoid assuming particular element ids, using instead ids
  passed to the function, but that unfortunately became impractical for this function) */
  ['#scat-axes', '#scat-marks-container'].map((pid) =>
    d3
      .select(pid)
      .style('left', -marg)
      .style('top', -marg)
      .attr('width', 2 * marg + sz)
      .attr('height', 2 * marg + sz)
  );
  d3.select('#y-axis').attr('transform', `translate(${marg - wee},${marg + sz / 2}) rotate(-90)`);
  d3.select('#x-axis').attr('transform', `translate(${marg + sz / 2},${marg + sz + wee})`);
  d3.select('#scat-marks')
    .attr('transform', `translate(${marg},${marg})`)
    .attr('width', sz)
    .attr('height', sz);
};

/* scatMarksInit() creates the per-state circles to be drawn over the scatterplot */
export const scatMarksInit = function (id, data) {
  /* maps interval [0,data.length-1] to [0,parm.scatSize-1]; this is NOT an especially informative thing
  to do; it just gives all the tickmarks some well-defined initial location */
  const tscl = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, parm.scatSize]);
  /* create the circles */
  d3.select('#' + id)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('class', 'stateScat')
    // note that every scatterplot mark gets its own id, eg. 'stateScat_IL'
    .attr('id', d => `stateScat_${d.StateAbbr}`)
    .attr('r', parm.circRad)
    .attr('cx', (d, ii) => tscl(ii))
    .attr('cy', (d, ii) => parm.scatSize - tscl(ii));
};

export const formsInit = function (tlid, yid, years, mdid) {
  // finish setting up timeline for choosing the year
  const tl = d3.select('#' + tlid);
  tl.attr('min', d3.min(years))
    .attr('max', d3.max(years))
    .attr('step', 4) // presidential elections are every 4 years
    // responding to both input and click facilitates being activated from code
    .on('input click', function () {
      /* This is one of the situations in which you CANNOT use an arrow function; you need a real
      "function" so that "this" is usefully set (here, "this" is this input element) */
      d3.select('#' + yid).html(this.value);
      yearSet(+this.value); // need the + so year is numeric
    });
  // create radio buttons for choosing colormap/scatterplot mode
  const radioModes = Object.keys(glob.modeDesc).map(id => ({
    id,
    str: glob.modeDesc[id]
  }));
  // one span per choice
  const spans = d3
    .select('#' + mdid)
    .selectAll('span')
    .data(radioModes)
    .join('span');
  // inside each span, put a radio button
  spans
    .append('input')
    // add some spacing left of 2nd and 3rd radio button; the 'px' units are in fact needed
    .style('margin-left', (_, i) => `${20 * !!i}px`)
    .attr('type', 'radio')
    .attr('name', 'mode') // any string that all the radiobuttons share
    .attr('id', (d) => d.id) // so label can refer to this, and is thus clickable
    .attr('value', (d) => d.id) // so that form as a whole has a value
    // respond to being selected by calling the modeSet function (in this file).
    .on('input', function (d) {
      modeSet(this.value);
    });
  // also in each span put the choice description
  spans
    .append('label')
    .attr('for', (d) => d.id)
    .html((d) => d.str);
};

/* TODO: finish dataProc, which takes the global state object, and modifies it as needed prior to
interactions starting. You will want to do things with the results of reading all the CSV data,
currently sitting in glob.csvData. */
export const dataProc = function (glob) {
  // some likely useful things are computed for you
  // glob.years: sorted array of all numerical years
  glob.years = glob.csvData.votes.columns // all column headers from voting data CSV
    .filter((c) => c.includes('_')) // select the years (works for given votes.csv)
    .map((c) => c.split('_')[1]) // extract year part (dropping 'DN', 'DE', 'RN', 'RE')
    // select only unique elements (note the use of all 3 args of filter function)
    .filter((d, i, A) => i == A.indexOf(d))
    .map((y) => +y) // and make into numbers
    .sort(); // make sure sorted if not already
  // glob.stateName: maps from two-letter abbreviation to full "state" name.
  glob.stateName = {};
  glob.csvData.stateNames.forEach(s => glob.stateName[s.StateAbbr] = s.StateName);
  // glob.cname: maps from election year to little object with D and R candidate names
  glob.cname = {};
  glob.csvData.candidateNames.forEach(nn => {
    glob.cname[+nn.year] = {
      D: nn.D,
      R: nn.R,
    };
  });
  // what other arrays or objects do you want to set up?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  var x = glob.csvData.votes.map(({ StateAbbr, ...item }) => item);

  function convertIntObj(obj) {
    const res = {}
    for (const key in obj) {
      res[key] = {};
      for (const prop in obj[key]) {
        const parsed = +obj[key][prop];
        res[key][prop] = isNaN(parsed) ? obj[key][prop] : parsed;
      }
    }
    return res;
  }
  var result = convertIntObj(x);
  glob.votes = Object.values(result);
  glob.sums = {};
  glob.sums = glob.votes
    .reduce((a, c) => (Object.keys(c).forEach(k => (a[k] += c[k])), a));
  console.log(glob.votes);
  console.log(glob.sums);
  console.log(glob.cname);
  console.log(glob.csvData);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (39L in ref)
};

/* TODO: finish visInit, which sets up any other state or resources that your visualization code
will use to support fast user interaction */
export const visInit = function (glob) {
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  // create new div for tooltip
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (75L in ref)
};

const updateAxes = function (mode) {
  if ('PUR' == mode) mode = 'RVD'; // RVD and PUR same; handle RVD
  const label = {
    RVD: ['Republican Votes', 'Democratic Votes'],
    LVA: ['Political Leaning', 'Amount of Votes'],
  }[mode];
  d3.select('#x-axis').html(label[0]);
  d3.select('#y-axis').html(label[1]);
};

/* TODO: here will go the functions that you write, including those called by modeSet and yearSet.
By the magic of hoisting, any functions you add here will also be visible to dataProc and visInit
above. */
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
// sets the balance bars
const balBars = function(year) {
  const denomN = (glob.sums["DN_" + year] + glob.sums["RN_" + year]);
  const denomE = (glob.sums['DE_' + year] + glob.sums['RE_' + year]);
  const sumDN = glob.sums["DN_" + year]
  const sumDE = glob.sums["DE_" + year]
  const sumRN = glob.sums["RN_" + year]
  const sumRE = glob.sums['RE_' + year]
  d3.select('#D-pv-bar')
    .transition()
    .duration(parm.transDur)
    .attr('width', sumDN / denomN)
  d3.select('#D-ec-bar')
    .transition()
    .duration(parm.transDur)
    .attr('width', sumDE / denomE)
  d3.select('#R-pv-bar')
    .transition()
    .duration(parm.transDur)
    .attr('width', sumRN / denomN)
  d3.select('#R-ec-bar')
    .transition()
    .duration(parm.transDur)
    .attr('width', sumRE / denomE)
  d3.select('#D-pv-txt')
    .text(sumDN.toLocaleString("en-US"))
  d3.select('#R-pv-txt')
    .text(sumRN.toLocaleString("en-US"))
  d3.select('#D-ec-txt')
    .text(sumDE.toLocaleString("en-US"))
  d3.select('#R-ec-txt')
    .text(sumRE.toLocaleString("en-US"))
  d3.select('#D-name')
    .text(glob.cname[+year].D)
  d3.select('#R-name')
    .text(glob.cname[+year].R)
}

// scalelinear for purple colormap
var pur = d3.scaleLinear()
  .domain([-1,0,1])
  .range([parm.colorDem, d3.rgb(135,40,138), parm.colorRep]);

// scaleLinear for LVA colormap
var lva = d3.scaleLinear()
  .domain([-1,0,1])
  .range([parm.colorDem, d3.rgb(178,190,181), parm.colorRep]);

// updates state colors based on mode and year
const stateCol = function(mode, year) {
  if (mode == 'RVD') {
    var count = 0;
    while(count < 51) {
      if(glob.votes[count][`DN_${year}`] > glob.votes[count][`RN_${year}`]) {
        d3.select(`#stateHex_${glob.csvData.votes[count].StateAbbr}`)
          .transition()
          .duration(parm.transDur)
          .style('fill', parm.colorDem);
        count++;
      } else {
        d3.select(`#stateHex_${glob.csvData.votes[count].StateAbbr}`)
          .transition()
          .duration(parm.transDur)
          .style('fill', parm.colorRep);
        count++;
      }
    }
  }
  if (mode == 'PUR') {
    var count = 0;
    while(count < 51) {
      var rn = +glob.csvData.votes[count][`RN_${year}`];
      var dn = +glob.csvData.votes[count][`DN_${year}`];
      var tn = dn + rn;
      var num = 2*rn;
      var col = pur(num / (1 + tn) - 1);
      var fill = d3.rgb(col.r, col.g, col.b);
      d3.select(`#stateHex_${glob.csvData.votes[count].StateAbbr}`)
        .style('fill', fill);
      count++;
    }
  }

  if (mode == 'LVA') {
    var count = 0;
    while(count < 51) {
      var rn = +glob.csvData.votes[count][`RN_${year}`];
      var dn = +glob.csvData.votes[count][`DN_${year}`];
      var tn = dn + rn;
      var num = 2*rn;
      var col = lva(num / (1 + tn) - 1);
      var fill = d3.rgb(col.r, col.g, col.b);
      d3.select(`#stateHex_${glob.csvData.votes[count].StateAbbr}`)
        .style('fill', fill);
      count++;
    }
  }
}

// warping functions
const warpA = (x, p) => 1 - Math.pow(1-x, p);
const warpC = (x, p) => (
  x > 0
    ? warpA(x, p)
    : -warpA(-x, p)
)

// updates the canvas based on mode
const canvasUpdate = function(mode) {
  // rvd mode
  if(mode == 'RVD') {
    for (let k = 0, j = 0; j < parm.scatSize; j++) {
      let y = parm.scatSize - 1 - j;
      for (let x = 0; x < parm.scatSize; x++) {
        if(x > y) {
          glob.scatImage.data[k++] = 230;
          glob.scatImage.data[k++] = 30;
          glob.scatImage.data[k++] = 20;
          glob.scatImage.data[k++] = 255; // leave opacity as is
        } else {
          glob.scatImage.data[k++] = 40;
          glob.scatImage.data[k++] = 50;
          glob.scatImage.data[k++] = 255;
          glob.scatImage.data[k++] = 255; // leave opacity as is
        }
      }
    }
    glob.scatContext.putImageData(glob.scatImage, 0, 0);
  }

  const ww = parm.scatSize;

  // pur mode
  if(mode == 'PUR') {
    for (let k = 0, j = 0; j < ww; j++) {
      let y = ww - 1 - j;
      for (let x = 0; x < ww; x++) {
        let pl = 2*x / (1 + x + y) - 1;
        const warp = pur(warpC(pl,10));
        const col = d3.rgb(warp.r, warp.g, warp.b);
        glob.scatImage.data[k++] = col.r;
        glob.scatImage.data[k++] = col.g;
        glob.scatImage.data[k++] = col.b;
        glob.scatImage.data[k++] = 255; // leave opacity as is
      }
    glob.scatContext.putImageData(glob.scatImage, 0, 0);
    }
  }

  // lva mode
  if(mode == 'LVA') {
    for (let k = 0, j = 0; j < ww; j++) {
      let y = ww - 1 - j;
      for (let x = 0; x < ww; x++) {
        let pl = 2*x / (1 + x + y) - 1;
        const warp = lva(warpC(pl,10));
        const col = d3.rgb(warp.r, warp.g, warp.b);
        glob.scatImage.data[k++] = col.r;
        glob.scatImage.data[k++] = col.g;
        glob.scatImage.data[k++] = col.b;
        glob.scatImage.data[k++] = 255; // leave opacity as is
      }
    glob.scatContext.putImageData(glob.scatImage, 0, 0);
    }
  }
}

// sets scat marks depending on mode and year
// I'm really not understanding the math for the scat marks
const scatMarksUpdate = function(mode, year) {
  if(mode == 'RVD' || mode == 'PUR') {
    var count = 0;
    while (count < 51) {
      const yscl = d3.scaleLinear().domain([-2000000, 12000000]).range([350, 0]);
      const xscl = d3.scaleLinear().domain([-2000000, 12000000]).range([0, 350]);
      const rn = glob.csvData.votes[count][`RN_${year}`];
      const dn = glob.csvData.votes[count][`DN_${year}`];
      d3.select(`#stateScat_${glob.csvData.votes[count].StateAbbr}`)
        .attr('cx', xscl(warpA(rn,1)))
        .attr('cy', yscl(warpA(dn,1)));
      count++;
    }
  }

  if(mode == 'LVA') {
    var count = 0;
    while (count < 51) {
      var rn = +glob.csvData.votes[count][`RN_${year}`];
      var dn = +glob.csvData.votes[count][`DN_${year}`];
      var tn = dn + rn;
      var num = 2*rn;
      var pl = num / (1 + tn) - 1;
      const xscl = d3.scaleLinear().domain([-1,1]).range([0,350]);
      const yscl = d3.scaleLinear().domain([-2000000, 12000000]).range([350,0]);
      d3.select(`#stateScat_${glob.csvData.votes[count].StateAbbr}`)
        .attr('cx', xscl(pl))
        .attr('cy', yscl(warpA(tn, 1)));
      count++;
    }
  }
}
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (91L in ref)

// UI wants to set the new colormapping mode to "mode"
const modeSet = function (mode) {
  console.log(`modeSet(${mode}): hello`);
  if (glob.currentMode == mode) return; // nothing to do
  // else do work to display mode "mode"
  updateAxes(mode);
  /* Your code should:
  update the colormap image underneath the scatterplot,
  the position of the marks in the scatterplot, and
  how the states in the US map are filled */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  stateCol(mode, glob.currentYear);
  canvasUpdate(mode);
  scatMarksUpdate(mode, glob.currentYear);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
  glob.currentMode = mode;
};

// UI wants to set the near year to "year"
const yearSet = function (year) {
  console.log(`yearSet(${year}): hello`);
  if (glob.currentYear == year) return; // nothing to do
  /* else do work to display year "year". Your code should:
  update the position of the marks in the scatterplot,
  how the states in the US map are filled,
  and the balance bars */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  balBars(year); 
  stateCol(glob.currentMode, year);
  scatMarksUpdate(glob.currentMode, year);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
  glob.currentYear = year;
};
