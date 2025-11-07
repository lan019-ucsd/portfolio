import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log('main.js loaded');

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: false,
        configurable: true,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add totle files 
  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.groups(data, d => d.file).length);

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Max Depth 
  dl.append('dt').text('Max depth');
  dl.append('dd').text(d3.max(data, d => d.depth))

  // Longest Line
  dl.append('dt').text('Longest file (lines)');
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );

  const longestFile = d3.greatest(fileLengths, d => d[1]);
  dl.append('dd').text(`${longestFile[0]} (${longestFile[1]} lines)`);

  dl.append('dt').text('Average file length');
  const avgFileLength = d3.mean(fileLengths, d => d[1]);
  dl.append('dd').text(avgFileLength.toFixed(1));
}

function renderScatterPlot(data, commits) { 
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 10, left: 50};

  const useableArea = { 
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom}`)
    .call(xAxis)

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}

const data = await loadData();
const commits = processCommits(data);
console.log(commits);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

