import { Page } from 'puppeteer';
import { Browser } from 'puppeteer';
import {
  BASE_URL,
  MAX_PAGE_ITEMS,
  NO_DATA_SELECTOR,
  PAGE_SIZE,
  ROW_SELECTOR,
} from './constant';
import { saveObjectToJSON } from '../shared/helper';

const yahooActiveStocks = async (browser: Browser, page: Page) => {
  let pageNumber = 0;

  const data = [];

  while (true) {
    console.log('Visiting page: ' + pageNumber);
    await page.goto(`${BASE_URL}${pageNumber * PAGE_SIZE}`, {
      waitUntil: [],
    });

    await page.waitForSelector('body');
    if (await page.$(NO_DATA_SELECTOR)) break;
    try {
      await page.waitForSelector(ROW_SELECTOR);
    } catch (e) {
      break;
    }

    pageNumber++;

    const pageData = await page.evaluate(
      ({ ROW_SELECTOR, MAX_PAGE_ITEMS, pageNumber }) => {
        const rows = [
          ...document.querySelectorAll<HTMLTableRowElement>(ROW_SELECTOR),
        ].slice(0, MAX_PAGE_ITEMS);

        const result = {
          page: pageNumber,
          items: rows.map((row) => {
            const columns = [...row.querySelectorAll('td')];
            return {
              name: columns[1]?.innerText || '',
              symbol: columns[0]?.innerText || '',
              price: columns[3]?.innerText || '',
              change: columns[4]?.innerText || '',
              percentChange: columns[5]?.innerText.replace('%', '') || '',
              volume: columns[6]?.innerText || '',
              avgVolume: columns[7]?.innerText || '',
              marketCap: columns[8]?.innerText || '',
              peRatio: columns[9]?.innerText || '',
            };
          }),
        };

        return result;
      },
      { ROW_SELECTOR, MAX_PAGE_ITEMS, pageNumber }
    );

    data.push(pageData);
  }

  saveObjectToJSON('result/yahoo-active-stocks.json', data);
};

export default yahooActiveStocks;
