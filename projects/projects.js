import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

import { fetchJSON, renderProjects } from '../global.js';

(async () => {
    const projects = await fetchJSON('../lib/projects.json');

    const projectsContainer = document.querySelector('.projects');

    renderProjects(projects, projectsContainer, 'h2');

    const titleElement = document.querySelector('.projects-title');
    if (titleElement) { 
        titleElement.textContent += `(${projects.length})`;
    }
})();

const data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];

const sliceGenerator = d3.pie().value(d => d.value);

const arcData = sliceGenerator(data);

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

const svg = d3.select('svg')
  .attr('width', 120)
  .attr('height', 120)
  .append('g');

const colors = d3.scaleOrdinal(d3.schemeTableau10);

arcData.forEach((d, i) => {
  svg.append('path')
     .attr('d', arcGenerator(d))
     .attr('fill', colors(i))
;
});

const legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});