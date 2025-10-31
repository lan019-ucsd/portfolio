import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
  const projects = await fetchJSON('../lib/projects.json');

  const projectsContainer = document.querySelector('.projects');
  const searchInput = document.querySelector('.searchBar');
  const titleElement = document.querySelector('.projects-title');

  if (titleElement) {
    titleElement.textContent += ` (${projects.length})`;
  }

  let selectedIndex = -1; // track which pie slice (if any) is selected

  function renderPieChart(projectsGiven) {
    const svg = d3.select('svg');
    const legend = d3.select('.legend');

    svg.selectAll('*').remove();
    legend.selectAll('*').remove();

    const width = 200;
    const height = 200;
    const radius = 50;

    const g = svg
      .attr('viewBox', `-100 -100 ${width} ${height}`)
      .append('g');

    const rolledData = d3.rollups(
      projectsGiven,
      v => v.length,
      d => d.year
    );

    const data = rolledData.map(([year, count]) => ({
      value: count,
      label: year
    }));

    const colors = d3.scaleOrdinal(d3.schemeTableau10);
    const pie = d3.pie().value(d => d.value);
    const arcs = pie(data);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    // draw slices
    g.selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', (d, i) => colors(i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', (d, i) => (i === selectedIndex ? 0.6 : 1))
      .on('click', (_, d) => {
        const idx = arcs.indexOf(d);
        selectedIndex = selectedIndex === idx ? -1 : idx;

        svg.selectAll('path').attr('opacity', (_, j) => (j === selectedIndex ? 0.6 : 1));
        legend.selectAll('li').classed('selected', (_, j) => j === selectedIndex);

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          const selectedYear = data[selectedIndex].label;
          const filtered = projectsGiven.filter(p => p.year === selectedYear);
          renderProjects(filtered, projectsContainer, 'h2');
        }
      });

    // legend
    legend
      .selectAll('li')
      .data(data)
      .join('li')
      .attr('style', (d, i) => `--color:${colors(i)}`)
      .classed('selected', (_, i) => i === selectedIndex)
      .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', (_, d, nodes) => {
        const i = data.indexOf(d);
        selectedIndex = selectedIndex === i ? -1 : i;

        svg.selectAll('path').attr('opacity', (_, j) => (j === selectedIndex ? 0.6 : 1));
        legend.selectAll('li').classed('selected', (_, j) => j === selectedIndex);

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          const selectedYear = data[selectedIndex].label;
          const filtered = projectsGiven.filter(p => p.year === selectedYear);
          renderProjects(filtered, projectsContainer, 'h2');
        }
      });
  }

  // initial render
  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects);

  // === SEARCH REACTIVITY ===
  searchInput.addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    const filteredProjects = projects.filter(project => {
      const values = Object.values(project).join(' ').toLowerCase();
      return values.includes(query);
    });

    selectedIndex = -1; // reset selection
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });
});
