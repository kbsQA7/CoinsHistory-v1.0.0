import fs from 'fs';
import path from 'path';

const summaryPath = 'build/allure-report/widgets/summary.json';
const testCasesDir = 'build/allure-report/data/test-cases/';

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
const { passed = 0, failed = 0, skipped = 0 } = summary.statistic;

const branch = process.env.GITHUB_REF_NAME || 'unknown';
const repo = process.env.REPO || 'unknown/repo';
const runId = process.env.RUN_ID || '0';

const rawTime = process.env.TIME || '';
let formattedTime = 'неизвестно';

if (rawTime) {
  try {
    const [datePart, timePart] = rawTime.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    utcDate.setUTCHours(utcDate.getUTCHours() + 3); 

    const pad = (n) => n.toString().padStart(2, '0');
    formattedTime = `${pad(utcDate.getDate())}.${pad(utcDate.getMonth() + 1)}.${utcDate.getFullYear()} ${pad(utcDate.getHours())}:${pad(utcDate.getMinutes())}`;
  } catch {
    formattedTime = rawTime;
  }
}

const allureLink = `https://github.com/${repo}/actions/runs/${runId}`;
const logsLink = `https://github.com/${repo}/actions/runs/${runId}`;
const runResult = failed > 0 ? 'completed with errors' : 'passed';
const statusText = failed > 0 ? '🔴 Тесты с ошибками — требуется анализ.' : '🟢 Все тесты прошли успешно';

let failedTests = '';
if (fs.existsSync(testCasesDir)) {
  fs.readdirSync(testCasesDir).forEach(file => {
    const test = JSON.parse(fs.readFileSync(path.join(testCasesDir, file), 'utf-8'));
    if (test.status === 'failed') {
      failedTests += `\n*${test.name || '[Без имени]'}*`;
    }
  });
}
                                                                         

                                


const message = `
✅ Scheduled run tests ${runResult}
🧪 *Project:* CoinsHistory v1.0.0
🔗 [Repository](https://github.com/${repo})
🕒 *Time start:* ${formattedTime}
🔁 *Branch:* ${branch}
⚙️ *Environment:* Production

📊 *Результаты:*
✅ Passed: ${passed}
❌ Failed: ${failed}
⏭ Skipped: ${skipped}

${failedTests ? `🧨 *Failed tests:*${failedTests}` : ''}

📎 [Allure-отчёт](${allureLink})
📁 [Логи CI](${logsLink})

🛠️ *Owner:* @kbsQA7
📢 *Status:* ${statusText}
`;

console.log(message.trim());





