import test from 'node:test';
import assert from 'node:assert/strict';
import {copyPortfolioLink,sharePortfolio} from '../assets/js/share.js';

const data={title:'김은열의 포트폴리오',text:'김은열의 포트폴리오',url:'https://kimeunyeol.github.io/portfolio/'};

test('copy writes the full summary URL and waits for completion',async()=>{
  let copied;
  assert.equal(await copyPortfolioLink(data.url,async url=>{copied=url;}),'copied');
  assert.equal(copied,data.url);
});

test('missing or denied clipboard access falls back without reporting success',async()=>{
  assert.equal(await copyPortfolioLink(data.url,undefined),'manual');
  assert.equal(await copyPortfolioLink(data.url,async()=>{throw new Error('Denied');}),'manual');
});

test('device sharing receives the portfolio summary rather than the current page',async()=>{
  let received;
  assert.equal(await sharePortfolio(data,async value=>{received=value;}),'handed-off');
  assert.deepEqual(received,data);
});

test('cancelling device sharing remains distinct from unavailable or failed sharing',async()=>{
  assert.equal(await sharePortfolio(data,undefined),'unsupported');
  assert.equal(await sharePortfolio(data,async()=>{throw Object.assign(new Error('Cancelled'),{name:'AbortError'});}),'cancelled');
  assert.equal(await sharePortfolio(data,async()=>{throw new Error('Denied');}),'failed');
});
