console.log("IT'S ALIVE!!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? '/' 
  : '/portfolio/';

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'project2/', title: 'Project 2'},  // trailing slash!
  { url: 'contact/', title: 'Contact'},
  { url: 'cv/', title: 'CV'},
  { url: 'https://github.com/lan019-ucsd/portfolio/', title: 'Profile'}
];

/* Create Nav */
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = !p.url.startsWith('http') ? BASE_PATH + p.url : p.url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  nav.append(a);
}

/* Highlight current link */
let navLinks = $$('nav a');
for (let a of navLinks) { 
  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);
}

/* Dark Mode Switch */
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(scheme) { 
  document.documentElement.style.setProperty('color-scheme', scheme);
  select.value = scheme;
}

if ('colorScheme' in localStorage) { 
  setColorScheme(localStorage.colorScheme);
} else { 
  setColorScheme('light dark');
}

select.addEventListener('input', function(event) {
  const scheme = event.target.value;
  document.documentElement.style.setProperty('color-scheme', scheme);
  localStorage.colorScheme = scheme;
  console.log('color scheme changed to', event.target.value);
});

/* Contact */
const form = document.querySelector('form');

form?.addEventListener('submit', function(event) { 
  event.preventDefault();

  const data = new FormData(form);
  const params = [];

  for (let [name, value] of data) { 
    params.push(`${name}=${encodeURIComponent(value)}`);
}

  const url = `${form.action}?${params.join(`&`)}`;
  location.href = url;
}); 

/* Fetch JSON */
export async function fetchJSON(path) { 

  try { 
    const res = await fetch(path);
    if (!res.ok) throw new Error (`Failed to fetch projects ${path}: ${res.statusText}`);
    return await res.json();
  } catch (error) { 
    console.error('Error fetching or parsing JSON data:', error);
    return [];
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') { 
  if (!containerElement || !Array.isArray(projects)) return;

  containerElement.innerHTML = '';

  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel.toLowerCase())) headingLevel = 'h2';  

  projects.forEach(project => { 
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title || 'Untitled Project'}</${headingLevel}>
      <p class = 'year'><strong>${project.year || ''}</strong></p>
      <img src = "${project.image || 'default.jpg'}" alt = "${project.title || 'Project Image'}">
      <p> ${project.description || 'No description available.'} </p>
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

