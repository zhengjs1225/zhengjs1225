#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'data');
const DATA_FILE = resolve(DATA_DIR, 'pulse.json');
const LOG_FILE = resolve(DATA_DIR, 'pulse.log');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const QUOTES = [
  '不积跬步，无以至千里',
  '千里之行，始于足下',
  '业精于勤，荒于嬉',
  '学而不思则罔，思而不学则殆',
  '温故而知新，可以为师矣',
  '三人行，必有我师焉',
  '君子和而不同，小人同而不和',
  '天行健，君子以自强不息',
  '地势坤，君子以厚德载物',
  '博学之，审问之，慎思之，明辨之，笃行之',
  '路漫漫其修远兮，吾将上下而求索',
  '纸上得来终觉浅，绝知此事要躬行',
  '问渠那得清如许，为有源头活水来',
  '山重水复疑无路，柳暗花明又一村',
  '宝剑锋从磨砺出，梅花香自苦寒来',
  '长风破浪会有时，直挂云帆济沧海',
  '会当凌绝顶，一览众山小',
  '不畏浮云遮望眼，自缘身在最高层',
  '千淘万漉虽辛苦，吹尽狂沙始到金',
  '人生自古谁无死，留取丹心照汗青',
  'Stay hungry, stay foolish',
  'Talk is cheap. Show me the code',
  'Move fast and break things',
  'Done is better than perfect',
  'Code is poetry',
  '少壮不努力，老大徒伤悲',
  '玉不琢，不成器；人不学，不知道',
  '苟日新，日日新，又日新',
  '锲而不舍，金石可镂',
  '有志者，事竟成',
];

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timestamp() {
  return new Date().toISOString();
}

function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function getRepoCount() {
  const parts = (process.env.GITHUB_REPOSITORY || '').split('/');
  return parts[1] || 'unknown';
}

function getRunId() {
  return process.env.GITHUB_RUN_ID || 'local';
}

// Load existing data
let records = [];
if (existsSync(DATA_FILE)) {
  try {
    records = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    if (!Array.isArray(records)) records = [];
  } catch {
    records = [];
  }
}

const day = today();

// Skip if today already has an entry (prevent duplicate runs)
const existing = records.find((r) => r.date === day);
if (existing) {
  console.log(`Data already exists for ${day}, updating quote only`);
  existing.quote = randomQuote();
  existing.updatedAt = timestamp();
  existing.runId = getRunId();
} else {
  const entry = {
    date: day,
    quote: randomQuote(),
    repo: getRepoCount(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
    runId: getRunId(),
  };
  records.push(entry);
  console.log(`Added new pulse entry for ${day}`);
}

// Keep only last 365 days
if (records.length > 365) {
  records = records.slice(-365);
}

// Write data file
writeFileSync(DATA_FILE, JSON.stringify(records, null, 2) + '\n');
console.log(`Total pulse records: ${records.length}`);

// Also append to log
const logLine = `[${timestamp()}] ${day} | ${QUOTES[0]} | records: ${records.length}\n`;
writeFileSync(LOG_FILE, logLine, { flag: 'a' });

// Output for workflow step
console.log(`pulse_date=${day}`);
console.log(`pulse_quote=${QUOTES[Math.floor(Math.random() * QUOTES.length)]}`);
