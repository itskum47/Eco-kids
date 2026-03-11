const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => {
    console.log('REQUEST ERROR:', request.url(), request.failure().errorText);
  });

  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
