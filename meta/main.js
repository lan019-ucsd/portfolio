import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log('main.js loaded');

let xScale, yScale; 

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
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;
      const ret = {
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
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  // Add totle files 
  dl.append('dt').text('Files');
  dl.append('dd').text(d3.groups(data, d => d.file).length);

  // Add total LOC
  dl.append('dt').text('Total LOC');
;
  dl.append('dd').text(data.length);

  // Max Depth 
  dl.append('dt').text('Max depth');
  dl.append('dd').text(d3.max(data, d => d.depth));

  // Longest Line
  dl.append('dt').text('Longest line');
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );

  const longestFile = d3.greatest(fileLengths, d => d[1]);
  dl.append('dd').text(longestFile[1]);


  dl.append('dt').text('Max Lines');
  const avgFileLength = d3.mean(fileLengths, d => d[1]);
  dl.append('dd').text(Math.round(avgFileLength));
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full'});
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function isCommitSelected(selection, commit) { 
  if (!selection) return false;
  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection, commits) {
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d))
    : [];

  const container = document.getElementById('language-breakdown');
  container.innerHTML = '';

  if (selectedCommits.length === 0) return;

  const lines = selectedCommits.flatMap(d => d.lines);
  const breakdown = d3.rollup(lines, v => v.length, d => d.type);

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${d3.format('.1~%')(proportion)})</dd>
    `;
  }
}

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 60, left: 50 };

  const usableWidth = width - margin.left - margin.right;
  const usableHeight = height - margin.top - margin.bottom;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Global scales
  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([margin.left, width - margin.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height - margin.bottom, margin.top]);

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-45)')
    .attr('dx', '-0.5em')
    .attr('dy', '0.25em');

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  // Dots
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);

      const tooltip = document.getElementById('commit-tooltip');
      tooltip.style.display = 'block';
      const x = event.clientX + 10;
      const y = event.clientY + 10;
      const pad = 8;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const rect = tooltip.getBoundingClientRect();
      const left = Math.min(x, vw - rect.width - pad);
      const top = Math.min(y, vh - rect.height - pad);
      tooltip.style.left = `${Math.max(left, pad)}px`;
      tooltip.style.top = `${Math.max(top, pad)}px`;
    })
    .on('mousemove', (event) => {
      const tooltip = document.getElementById('commit-tooltip');
      const x = event.clientX + 10;
      const y = event.clientY + 10;
      const pad = 8;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const rect = tooltip.getBoundingClientRect();
      const left = Math.min(x, vw - rect.width - pad);
      const top = Math.min(y, vh - rect.height - pad);
      tooltip.style.left = `${Math.max(left, pad)}px`;
      tooltip.style.top = `${Math.max(top, pad)}px`;
    })
    .on('mouseleave', () => {
      const tooltip = document.getElementById('commit-tooltip');
      tooltip.style.display = 'none';
    });

  // Brush
  const brush = d3.brush()
    .on('start brush end', (event) => brushed(event, commits));

  svg.call(brush);
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event, commits) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', d =>
    isCommitSelected(selection, d)
  );
  renderSelectionCount(selection, commits);
  renderLanguageBreakdown(selection, commits);
}

const data = await loadData();
const commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);