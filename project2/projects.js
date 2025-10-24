import { fetchJSON, renderProjects } from '../global.js';

(async () => {
    const projects = await fetchJSON('../lib/projects.json');

    const project2 = projects.filter(p => p.title.includes('Abortion Access'));
    
    const projectsContainer = document.querySelector('.projects');

    renderProjects(project2, projectsContainer, 'h2');

})();