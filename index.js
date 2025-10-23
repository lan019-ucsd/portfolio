import { fetchJSON, renderProjects, fetchGithubData } from './global.js';

(async () => { 

    /* Projects */
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');
    renderProjects(latestProjects, projectsContainer, 'h2');

    /* Github Data */

    const githubData = await fetchGitHubData ('lan019-ucsd');
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats) {
        profileStats.innerHTML = `
            <dl>
            <dt>Public Repos:</dt><dd>${GitHubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${GitHubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${GitHubData.followers}</dd>
            <dt>Following:</dt><dd>${GitHubData.following}</dd>
            </dl>
        `;
    }
})();

