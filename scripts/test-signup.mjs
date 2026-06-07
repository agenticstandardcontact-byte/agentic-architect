import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://agenticstandardcontact-byte.github.io/agentic-architect/#free-kit-signup';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.addInitScript(() => sessionStorage.clear());

const requests = [];
page.on('request', (req) => {
  if (/mailerlite|mlcdn|webforms|jsonp|forms\//i.test(req.url())) {
    requests.push(`${req.method()} ${req.url()}`);
  }
});

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('#free-kit-signup input[type=email]', { timeout: 30000 });
await page.waitForTimeout(3000);

await page.locator('#free-kit-signup').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const email = `aa-debug-${Date.now()}@mailinator.com`;
await page.locator('#free-kit-signup input[type=email]').fill(email);
await page.locator('#free-kit-signup input[name="gdpr[]"]').first().check({ force: true });

const before = await page.evaluate(() => ({
  boxClasses: document.querySelector('.ml-capture-box')?.className,
  btnText: document.querySelector('#free-kit-signup button[type=submit]')?.textContent?.trim(),
}));

console.log('BEFORE', before);
await page.locator('#free-kit-signup button[type=submit]').click();

let passed = false;
for (let t = 1; t <= 30; t++) {
  await page.waitForTimeout(1000);
  const snap = await page.evaluate(() => {
    const box = document.querySelector('.ml-capture-box');
    const successEl = document.querySelector('.ml-form-successBody, .row-success');
    const successStyle = successEl ? getComputedStyle(successEl).display : 'missing';
    return {
      boxClasses: box?.className,
      btnText: document.querySelector('#free-kit-signup button[type=submit]')?.textContent?.trim(),
      btnDisabled: document.querySelector('#free-kit-signup button[type=submit]')?.disabled,
      rowForm: document.querySelector('.row-form') ? getComputedStyle(document.querySelector('.row-form')).display : 'na',
      rowSuccess: successStyle,
      successText: document.querySelector('.ml-form-successContent')?.textContent?.trim().slice(0, 120),
      customSuccess: document.querySelector('#ml-capture-success-body')?.textContent?.trim().slice(0, 120),
      customVisible: getComputedStyle(document.querySelector('#ml-capture-success')).display,
    };
  });
  if (t <= 8 || t % 5 === 0 || snap.rowSuccess === 'block' || snap.boxClasses?.includes('is-submitted')) {
    console.log(`t+${t}s`, snap);
  }
  if (
    snap.boxClasses?.includes('is-submitted') &&
    (snap.successText || snap.customSuccess) &&
    snap.rowForm === 'none'
  ) {
    passed = true;
    break;
  }
  if (snap.rowSuccess === 'block' && snap.successText && snap.rowForm === 'none') {
    passed = true;
    break;
  }
}

console.log('ML_REQUESTS', requests.length ? requests.join('\n') : '(none)');
console.log(passed ? 'PASS' : 'FAIL');
await browser.close();
process.exit(passed ? 0 : 1);
