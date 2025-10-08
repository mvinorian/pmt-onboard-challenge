import { select } from '@inquirer/prompts';
import puppeteer from 'puppeteer-extra';
import pintuMarket from './pintu-market';
import yahooActiveStocks from './yahoo-active-stocks';

const main = async () => {
  const dataSource = await select({
    message: 'Choose your data source!',
    choices: [
      {
        name: 'Pintu Market',
        value: 'pintuMarket',
      },
      {
        name: 'Yahoo Active Stocks',
        value: 'yahooActiveStocks',
      },
    ],
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 1600 });

  switch (dataSource) {
    case 'pintuMarket':
      await pintuMarket(browser, page);
      break;
    case 'yahooActiveStocks':
      await yahooActiveStocks(browser, page);
      break;
  }

  await browser.close();
};

main();
