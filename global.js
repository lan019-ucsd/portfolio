console.log("IT'S ALIVE!!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = 
location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? '/' 
  : '/portfolio/';

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact'},
  { url: 'cv/', title: 'CV'},
  { url: 'https://github.com/lan019-ucsd/portfolio/', title: 'Profile'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith('http')) { 
    url = BASE_PATH + url;
  }

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}

let navLinks = $$('nav a');

for (let a of navLinks) { 
  a.classList.toggle( 
    'current',
    a.host === location.host && a.pathname === location.pathname
  );
}

currentLink?.classList.add('current');
