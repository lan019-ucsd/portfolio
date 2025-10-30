import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

import { fetchJSON, renderProjects } from '../global.js';

(async () => {
    const projects = await fetchJSON('../lib/projects.json');

    const project2 = projects.filter(p => p.title.includes('Abortion Access'));
    
    const projectsContainer = document.querySelector('.projects');

    renderProjects(project2, projectsContainer, 'h2');

})();

let data = [1, 2];

let total = 0;

for (let d of data) {
  total += d;
}

let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

let arcGenerator = d3.arc().innerRadius(0).outRadius(50);

let arcs = arcData.map((d) => arcGenerator(d));

let svg = d3.select('svg')
    .attr('width', 120)
    .attr('height', 120)
    .append('g')
    .attr('transform', 'translate(60, 60');

let colors = ['red', 'blue'];

arcs.forEach((arc, i => {
  svg.append('path')
     .attr('d', arcPath)
     .attr('fill', colors[i]);
});