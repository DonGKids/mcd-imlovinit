// 用 jsdom 加载生产 bundle，渲染 SurveyForm，输出关键 DOM 结构
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const distHtml = readFileSync(
  resolve('source/web/dist/index.html'),
  'utf-8',
);

// 设置 jsdom 环境
const dom = new JSDOM(distHtml, {
  url: 'http://localhost:5180/survey',
  resources: 'usable',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
});

// 等待 React 挂载完成
await new Promise((r) => setTimeout(r, 1500));

const doc = dom.window.document;

// 验证关键结构
const checks = [
  {
    name: '左右两栏布局 (lg:grid-cols-5)',
    pass:
      doc.querySelector('.lg\\:grid-cols-5') !== null ||
      Array.from(doc.querySelectorAll('div')).some((d) =>
        d.className?.toString().includes('grid-cols-5'),
      ),
  },
  {
    name: '近期联名活动卡片',
    pass: doc.body.textContent.includes('近期联名活动'),
  },
  {
    name: '今日语录卡片',
    pass: doc.body.textContent.includes('今日语录'),
  },
  {
    name: '4 个联名活动',
    pass:
      doc.body.textContent.includes('麦当劳 × 三体') &&
      doc.body.textContent.includes('麦当劳 × Line Friends') &&
      doc.body.textContent.includes('麦当劳 × 小黄人') &&
      doc.body.textContent.includes('麦当劳 × 喜羊羊'),
  },
  {
    name: '今日语录正文',
    pass: /[一-龥]{6,}/.test(
      Array.from(doc.querySelectorAll('blockquote'))
        .map((b) => b.textContent)
        .join(''),
    ),
  },
  {
    name: '表单 7 个问题',
    pass: (
      doc.body.textContent.match(/^[1-7]\.\s/gm) || []
    ).length >= 7 ||
      doc.body.textContent.includes('你的年龄段') &&
      doc.body.textContent.includes('在哪？'),
  },
  {
    name: '为我推荐按钮',
    pass: doc.body.textContent.includes('为我推荐'),
  },
  {
    name: '随机一个按钮',
    pass: doc.body.textContent.includes('随机一个'),
  },
];

let pass = 0,
  fail = 0;
for (const c of checks) {
  console.log((c.pass ? '✓' : '✗') + ' ' + c.name);
  if (c.pass) pass++;
  else fail++;
}
console.log(`\n${pass}/${pass + fail} 通过`);

dom.window.close();
process.exit(fail === 0 ? 0 : 1);
