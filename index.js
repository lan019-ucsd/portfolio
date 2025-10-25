import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

(async () => {
  // --- 1. Render the first 3 projects ---
  const projects = await fetchJSON('./lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects.slice(0, 3), projectsContainer, 'h2');

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) { 
    titleElement.textContent += ` (${projects.length})`;
  }

  // --- 2. Fetch GitHub profile stats ---
  const profileStats = document.querySelector('#profile-stats');
  if (profileStats) {
    try {
      const githubData = await fetchGitHubData('lan019-ucsd'); // <-- Replace this
      profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
      `;
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      profileStats.textContent = 'Failed to load GitHub data.';
    }
  }
})();
