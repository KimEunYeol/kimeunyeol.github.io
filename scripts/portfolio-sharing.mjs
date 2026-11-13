const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const summaryPath='/portfolio/';

export function renderShareDialog(name,origin){
  const url=origin+summaryPath;
  const title=`${name}의 포트폴리오`;
  const telegram=`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  return `<dialog id="portfolio-share-dialog" class="portfolio-share-dialog" aria-labelledby="portfolio-share-title"><div class="dialog-heading"><h2 id="portfolio-share-title">포트폴리오 공유</h2><button type="button" data-close-dialog>닫기</button></div><p class="share-description">소개와 프로젝트를 한 페이지로 정리한 포트폴리오를 공유합니다.</p><label class="share-label" for="portfolio-share-url">공유 링크</label><input id="portfolio-share-url" class="share-url" type="url" readonly value="${e(url)}"><div class="share-actions"><button type="button" class="share-copy" data-copy-portfolio>링크 복사</button><button type="button" data-native-portfolio-share hidden>다른 앱으로 공유</button><a href="${e(telegram)}" target="_blank" rel="noopener noreferrer" class="share-messenger">텔레그램으로 공유</a></div><p class="share-status" role="status" aria-live="polite"></p><p class="share-help">카카오톡·문자 등에는 링크를 복사해 원하는 대화에 붙여넣으세요.</p><a class="share-preview" href="${summaryPath}" target="_blank" rel="noopener">공유 페이지 보기 ↗</a><span data-portfolio-share-title hidden>${e(title)}</span></dialog>`;
}

export function renderPortfolioSummary(profile){
  const skills=['Python','FastAPI','Airflow','PySpark','Kafka','Docker','OR-Tools','GitLab CI/CD'];
  const workingStyle=profile.introduction[1].split('. ')[0]+'.';
  const professional=profile.projects.map(p=>`<article class="summary-project"><div class="summary-project-heading"><h3><a href="/projects/${e(p.slug)}/">${e(p.name)} ↗</a></h3><span>${e(p.period)}</span></div><p>${e(p.summary)}</p><p class="summary-project-meta">${e(p.role)} · ${e(p.technologies.slice(0,3).join(' · '))}</p>${p.kind==='ongoing'?`<p class="summary-scope">${e(p.scope)}</p>`:''}</article>`).join('');
  const personal=profile.personalProjects.map(p=>`<article class="summary-personal"><h3><a href="/projects/${e(p.slug)}/">${e(p.name)} ↗</a></h3><p>${e(p.summary)}</p>${p.slug==='music-club'?`<p class="summary-scope">${e(p.scope)}</p>`:''}${p.links.map(link=>`<a class="detail-link" href="${e(link.url)}" target="_blank" rel="noopener noreferrer">${e(link.label)} ↗</a>`).join('')}</article>`).join('');
  return `<main id="main" class="content-main portfolio-summary"><header class="page-heading"><p class="eyebrow">포트폴리오</p><h1>${e(profile.name)}</h1><p class="lead">${e(profile.role)}</p><div class="summary-actions"><a href="/">전체 포트폴리오 ↗</a><a href="${summaryPath}" data-portfolio-share aria-haspopup="dialog" aria-controls="portfolio-share-dialog">공유하기</a></div></header><section class="summary-introduction"><h2>소개</h2><p>${e(profile.introduction[0])}</p><p>${e(workingStyle)}</p></section><section><h2>주요 기술</h2><ul class="tech-list">${skills.map(skill=>`<li>${e(skill)}</li>`).join('')}</ul></section><section><h2>참여 프로젝트</h2>${professional}</section><section><h2>개인 제작</h2>${personal}</section><section class="summary-qualifications"><h2>전공·자격</h2><p>${e(profile.education)} · ${profile.certificates.map(e).join(' · ')}</p></section><p class="summary-full"><a href="/resume.html">전체 이력서 보기 ↗</a></p></main>`;
}
