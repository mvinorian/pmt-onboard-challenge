import puppeteer from 'puppeteer-extra';

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
};

main();
