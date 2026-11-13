import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir,mkdir,writeFile,unlink,rmdir} from 'node:fs/promises';
import path from 'node:path';
import {root,profile,publishedProjects,work,escape,withdrawnRoutes,pruneGeneratedPages} from '../scripts/build.mjs';
import {documents as searchDocuments} from '../assets/js/search-data.js';
import {newestFirst} from '../scripts/chronology.mjs';

const activeRoutes=['/','/resume.html','/about/','/experience/','/projects/','/work/',...publishedProjects.map(p=>`/projects/${p.slug}/`),...work.entries.map(w=>`/work/${w.slug}/`)];
const routes=[...activeRoutes,...withdrawnRoutes,'/404.html'];
const target=route=>path.join(root,route.endsWith('/')?route+'index.html':route);
const documents=new Map(await Promise.all(routes.map(async route=>[route,await readFile(target(route),'utf8')])));
const privateLinks=/(?:mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|https?:\/\/(?:www\.)?(?:github\.com|instagram\.com|facebook\.com|linkedin\.com)\/|notion\.(?:com|so)|[A-Z]:\\)/i;

test('public pages and internal anchors resolve without duplicate IDs',async()=>{
  for(const [route,html]of documents){
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,route);
    for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      const href=match[1];
      if(/^https?:/.test(href))continue;
      const url=new URL(href,'https://portfolio.example'+route);
      const destination=target(decodeURIComponent(url.pathname));
      assert.ok((await stat(destination)).isFile(),`${route}: missing destination`);
      if(url.hash&&path.extname(destination)==='.html')assert.ok((await readFile(destination,'utf8')).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${route}: missing anchor`);
    }
    assert.match(html,/<html lang="ko">/);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1,route);
    assert.match(html,/<meta name="description" content="[^"]+">/);
    assert.equal(privateLinks.test(html),false,`${route}: private contact or source link`);
  }
});

test('public profile contains professional fields and only the approved personal projects',()=>{
  assert.deepEqual(Object.keys(profile).sort(),['name','role','description','employment','projects','personalProjects','career','education','certificates'].sort());
  assert.ok(profile.projects.every(p=>['work','ongoing'].includes(p.kind)&&p.links.length===0));
  assert.deepEqual(profile.personalProjects.map(p=>({slug:p.slug,name:p.name})),[
    {slug:'music-club',name:'음악동아리'},
    {slug:'reptilelink',name:'랩타일링크'}
  ]);
  const personal=profile.personalProjects[0];
  assert.equal(personal.name,'음악동아리');
  assert.equal(personal.slug,'music-club');
  assert.equal(personal.kind,'personal');
  assert.deepEqual(personal.links,[]);
  assert.equal('visual' in personal,false);
  const reptile=profile.personalProjects.find(p=>p.slug==='reptilelink');
  assert.equal(reptile.kind,'personal');
  assert.deepEqual(reptile.links,[{label:'서비스 보기',url:'https://reptilelink.netlify.app/'}]);
  assert.equal(profile.education,'컴퓨터공학 학사');
  assert.ok(profile.certificates.every(c=>!/[0-9]/.test(c)));
  assert.equal(privateLinks.test(JSON.stringify({profile,work})),false);
});

test('personal project pages use their own content across the site',()=>{
  const reptile=documents.get('/projects/reptilelink/');
  assert.match(reptile,/랩타일링크 제작 내용/);
  assert.doesNotMatch(reptile,/caption[^>]*>음악동아리 제작 내용/);
  for(const route of ['/','/projects/','/about/','/resume.html']){
    assert.match(documents.get(route),/href="\/projects\/reptilelink\/"/);
  }
  assert.match(reptile,/href="https:\/\/reptilelink\.netlify\.app\/"/);
});

test('search and sitemap include only active public documents',async()=>{
  const urls=searchDocuments.map(d=>d.url);
  assert.equal(urls.length,new Set(urls).size);
  assert.deepEqual([...urls].sort(),[...activeRoutes].sort());
  for(const entry of searchDocuments){
    assert.ok((await stat(target(entry.url))).isFile());
    assert.ok(entry.title.trim()&&entry.summary.trim());
    assert.equal(privateLinks.test(JSON.stringify(entry)),false);
  }
  const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname).sort(),[...activeRoutes].sort());
  for(const route of withdrawnRoutes){
    assert.match(documents.get(route),/content="noindex, nofollow"/);
    assert.ok(!urls.includes(route));
  }
});

test('retired source and identifying image directories are not published',async()=>{
  for(const relative of ['_config.yml','about.md','releases.md','_posts','_includes','_layouts','resources','assets/projects','.hallmark']){
    await assert.rejects(stat(path.join(root,relative)),{code:'ENOENT'});
  }
  for(const directory of ['projects','work']){
    const expected=(directory==='projects'?publishedProjects:work.entries).map(x=>x.slug).sort();
    const actual=(await readdir(path.join(root,directory),{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort();
    assert.deepEqual(actual,expected);
  }
});

test('a removed record cannot leave its generated index published',async()=>{
  const fixture=path.join(root,'projects','retired-record-test');
  await mkdir(fixture,{recursive:true});
  await writeFile(path.join(fixture,'index.html'),'<p>Retired record</p>');
  await writeFile(path.join(fixture,'keep.txt'),'unowned file');
  try{
    await pruneGeneratedPages('projects',new Set(publishedProjects.map(p=>p.slug)));
    await assert.rejects(stat(path.join(fixture,'index.html')),{code:'ENOENT'});
    assert.equal(await readFile(path.join(fixture,'keep.txt'),'utf8'),'unowned file');
  }finally{
    await unlink(path.join(fixture,'index.html')).catch(()=>{});
    await unlink(path.join(fixture,'keep.txt')).catch(()=>{});
    await rmdir(fixture);
  }
});

test('source relationships and HTML escaping remain valid',()=>{
  for(const entry of work.entries){
    assert.ok(work.categories.some(c=>c.id===entry.category));
    if(entry.project)assert.ok(profile.projects.some(p=>p.slug===entry.project));
  }
  assert.equal(escape('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('history is newest first across generated home, lists and resume',()=>{
  const expectedProjects=['data-production-platform','transport-optimization','data-lake-environment-support','music-club','reptilelink','infrastructure-transition','data-lake-upgrade','manufacturing-ai-backend'];
  const projectRows=[...documents.get('/projects/').matchAll(/data-project-row="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(projectRows,expectedProjects);
  const expectedNotes=['production-contract-boundaries','quality-evidence-validation','transport-simulation-validation','gitlab-pipeline-recovery','infrastructure-transition-review','lake-load-validation','nifi-hive-connection','model-serving-boundaries','kafka-consumer-polling'];
  const noteLinks=[...documents.get('/work/').matchAll(/<article><a href="\/work\/([^/]+)\/">/g)].map(m=>m[1]);
  assert.deepEqual(noteLinks,expectedNotes);
  for(const route of ['/experience/','/resume.html']){
    const html=documents.get(route);
    const rows=[...html.matchAll(/<tr><td data-label="프로젝트">([^<]+)<\/td><td data-label="참여 기간">([^<]+)<\/td>/g)].map(m=>m[1]);
    assert.deepEqual(rows,profile.career.map(c=>c.name),route);
    assert.equal(rows.length,10);
    assert.equal(rows[0],'제조 물류 운송 최적화 시뮬레이션');
    assert.equal(rows[1],'데이터레이크 개발환경 검토·기술 지원');
    assert.ok(html.indexOf('현재 진행 중인 작업')<html.indexOf('<table'),route);
    assert.match(html,/경력증명서 기재 기간: 2020\.06–2025\.08/);
  }
  const homeRows=[...documents.get('/').matchAll(/data-project-row="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(homeRows,expectedProjects);
});

test('partial dates retain their precision and equal dates keep their order',()=>{
  const original=[{slug:'year-a',sortDate:'2026'},{slug:'old',sortDate:'2025-12'},{slug:'year-b',sortDate:'2026'},{slug:'new',sortDate:'2026-07'}];
  assert.deepEqual(newestFirst(original).map(x=>x.slug),['new','year-a','year-b','old']);
  assert.deepEqual(original.map(x=>x.slug),['year-a','old','year-b','new']);
  assert.ok(profile.personalProjects.every(p=>p.sortDate==='2026'&&p.period==='2026'));
  assert.throws(()=>newestFirst([{slug:'undated'}]),/chronology date/);
});

test('mail based additions describe performed work without extending certified employment',()=>{
  assert.equal(profile.employment.period,'2020.06–2025.08');
  assert.equal(profile.career.filter(c=>c.basis==='mail').length,2);
  const transport=documents.get('/projects/transport-optimization/');
  const support=documents.get('/projects/data-lake-environment-support/');
  assert.match(transport,/2026\.07/);
  assert.match(transport,/OR-Tools/);
  assert.match(transport,/AS-IS/);
  assert.match(support,/2025\.12–2026\.01/);
  assert.match(support,/구축안/);
  assert.match(support,/Runner/);
  assert.doesNotMatch(transport+support,/VND|\d+%|\b\d{2}[A-Z]-\d{4,5}\b/);
  assert.match(documents.get('/work/gitlab-pipeline-recovery/'),/2026\.01\.15/);
});

test('published pages use production metadata and current work takeaways',()=>{
  for(const route of activeRoutes){
    const html=documents.get(route);
    assert.ok(html.includes(`<link rel="canonical" href="https://kimeunyeol.github.io${route}">`),route);
    assert.ok(html.includes(`<meta property="og:url" content="https://kimeunyeol.github.io${route}">`),route);
    assert.doesNotMatch(html,/content="noindex/);
    assert.doesNotMatch(html,/127\.0\.0\.1|localhost|디자인 테스트/);
  }
  for(const entry of work.entries){
    const html=documents.get(`/work/${entry.slug}/`);
    assert.ok(entry.takeaway?.trim());
    assert.ok(html.includes(escape(entry.takeaway)));
    assert.equal([...html.matchAll(/<h2[^>]*>한 줄 요약<\/h2>/g)].length,1);
    assert.doesNotMatch(html,/덧붙이면|<p>undefined<\/p>/);
    assert.ok(searchDocuments.find(item=>item.url===`/work/${entry.slug}/`).text.includes(entry.takeaway));
  }
});
