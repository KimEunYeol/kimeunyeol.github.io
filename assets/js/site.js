import { configurePortfolioSharing } from './share.js?v=white-share-20261113';
import { documents } from './search-data.js?v=white-share-20261113';

document.documentElement.classList.add('js');
configurePortfolioSharing();
const menuButton = document.querySelector('.menu-toggle');
const navigationDialog = document.querySelector('#navigation-dialog');
const searchButton = document.querySelector('.search-open');
const searchDialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#search-input');
const searchResults = document.querySelector('.search-results');
const searchStatus = document.querySelector('.search-status');

menuButton.addEventListener('click', () => {
  navigationDialog.showModal();
  menuButton.setAttribute('aria-expanded', 'true');
});
navigationDialog.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
navigationDialog.addEventListener('click', event => {
  if (event.target.closest('a')) navigationDialog.close();
});
document.querySelectorAll('[data-close-dialog]').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});

const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko').trim();
const index = documents.map(document => ({ ...document, titleText: normalize(document.title), searchable: normalize(`${document.title} ${document.summary} ${document.text}`) }));
function renderSearch() {
  const terms = normalize(searchInput.value).split(/\s+/).filter(Boolean);
  const matches = index.filter(item => terms.every(term => item.searchable.includes(term)))
    .map(item => ({ item, score: terms.reduce((sum, term) => sum + (item.titleText.includes(term) ? 10 : 1), 0) }))
    .sort((a, b) => b.score - a.score);
  const fragment = document.createDocumentFragment();
  for (const { item } of matches.slice(0, 12)) {
    const row = document.createElement('li');
    const link = document.createElement('a');
    const title = document.createElement('strong');
    const summary = document.createElement('p');
    link.href = item.url;
    title.textContent = item.title;
    summary.textContent = item.summary;
    link.append(title, summary);
    row.append(link);
    fragment.append(row);
  }
  searchResults.replaceChildren(fragment);
  searchStatus.textContent = !terms.length ? '프로젝트, 기술명과 업무 내용으로 검색할 수 있습니다.'
    : matches.length ? `${matches.length}개 문서를 찾았습니다.${matches.length > 12 ? ' 상위 12개를 표시합니다.' : ''}`
      : '일치하는 문서가 없습니다. 다른 검색어를 입력해보세요.';
}
searchButton.addEventListener('click', () => {
  searchDialog.showModal();
  renderSearch();
  searchInput.focus();
});
searchInput.addEventListener('input', renderSearch);
searchResults.addEventListener('click', event => { if (event.target.closest('a')) searchDialog.close(); });
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

const explorer = document.querySelector('.project-explorer');
if (explorer) {
  const rows = [...explorer.querySelectorAll('[data-project-row]')];
  const previews = [...explorer.querySelectorAll('[data-project-preview]')];
  const filterButtons = [...explorer.querySelectorAll('[data-project-filter]')];
  const projectSearch = explorer.querySelector('[data-project-search]');
  const count = explorer.querySelector('[data-project-count]');
  const empty = explorer.querySelector('[data-project-empty]');
  const previewContainer = explorer.querySelector('.project-previews');
  const projectIndex = new Map(rows.map(row => {
    const slug = row.dataset.projectRow;
    const entry = documents.find(item => item.url === `/projects/${slug}/`);
    return [slug, normalize(`${row.textContent} ${entry?.text || ''}`)];
  }));
  let category = 'all';
  let selected = rows[0]?.dataset.projectRow;
  function selectProject(slug) {
    selected = slug;
    rows.forEach(row => {
      const active = row.dataset.projectRow === slug;
      row.classList.toggle('is-selected', active);
      const link = row.querySelector('[data-project-select]');
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    previews.forEach(preview => preview.hidden = preview.dataset.projectPreview !== slug);
  }
  function filterProjects() {
    const terms = normalize(projectSearch.value).split(/\s+/).filter(Boolean);
    const visible = rows.filter(row => {
      const match = (category === 'all' || row.dataset.kind === category)
        && terms.every(term => projectIndex.get(row.dataset.projectRow).includes(term));
      row.hidden = !match;
      return match;
    });
    count.textContent = `${visible.length}개 프로젝트`;
    empty.hidden = visible.length > 0;
    previewContainer.hidden = visible.length === 0;
    if (visible.length && !visible.some(row => row.dataset.projectRow === selected)) selectProject(visible[0].dataset.projectRow);
  }
  explorer.querySelectorAll('[data-project-select]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      selectProject(link.dataset.projectSelect);
    });
  });
  filterButtons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.projectFilter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterProjects();
  }));
  projectSearch.addEventListener('input', filterProjects);
}
