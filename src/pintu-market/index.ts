import { Page } from 'puppeteer';
import { Browser } from 'puppeteer';
import {
  BASE_URL,
  CHANGE_NEGATIVE_CLASSNAME,
  CHANGE_SELECTOR,
  COIN_SELECTOR,
  FETCHED_DATA,
  PRICE_SELECTOR,
  ROW_SELECTOR,
} from './constant';
import { saveObjectToJSON } from '../shared/helper';

type Result = {
  coinName: string;
  coinShorthand: string;
  price: string;
  '24hchange': string;
  '1wchange': string;
  '1mchange': string;
  '1ychange': string;
};

const pintuMarket = async (browser: Browser, page: Page) => {
  await page.goto(BASE_URL);

  const logData = async () => {
    const data = await page.evaluate(
      ({
        ROW_SELECTOR,
        FETCHED_DATA,
        COIN_SELECTOR,
        PRICE_SELECTOR,
        CHANGE_SELECTOR,
        CHANGE_NEGATIVE_CLASSNAME,
      }) => {
        (window as any).__name = (func: Function) => func;

        const changeParser = (change: HTMLParagraphElement) =>
          (change.classList[1] === CHANGE_NEGATIVE_CLASSNAME ? '-' : '') +
          change.innerText.replace('%', '');

        const rows = [
          ...document.querySelectorAll<HTMLDivElement>(ROW_SELECTOR),
        ].slice(0, FETCHED_DATA);

        const result: Result[] = [];
        rows.forEach((row) => {
          const coin =
            row.querySelector<HTMLAnchorElement>(COIN_SELECTOR)?.innerText ||
            '';
          const [coinName, coinShorthand] = coin?.split('\n\n');

          const price =
            row
              .querySelector<HTMLDivElement>(PRICE_SELECTOR)
              ?.innerText.replace(/[^0-9-]+/g, '') || '';

          const change = [
            ...row.querySelectorAll<HTMLParagraphElement>(CHANGE_SELECTOR),
          ];

          const change_1d = changeParser(change[0]);
          const change_1w = changeParser(change[1]);
          const change_1m = changeParser(change[2]);
          const change_1y = changeParser(change[3]);

          result.push({
            coinName,
            coinShorthand,
            price,
            '24hchange': change_1d,
            '1wchange': change_1w,
            '1mchange': change_1m,
            '1ychange': change_1y,
          });
        });

        return result;
      },
      {
        ROW_SELECTOR,
        FETCHED_DATA,
        COIN_SELECTOR,
        PRICE_SELECTOR,
        CHANGE_SELECTOR,
        CHANGE_NEGATIVE_CLASSNAME,
      }
    );

    saveObjectToJSON('result/pintu-market.json', data);
  };

  setInterval(logData, 1000);
};

export default pintuMarket;
