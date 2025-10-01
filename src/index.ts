import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(stealthPlugin());

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 800, height: 600 });
  await page.goto('https://bot.sannysoft.com/', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: 'result.png', fullPage: true });

  await page.waitForSelector('table');
  const data = await page.evaluate(() => {
    function extractTable(table: HTMLTableElement | null) {
      const tableRows = [...(table?.querySelectorAll('tr') || [])];
      const tableData = tableRows
        .map((tr) => {
          const tds = [...tr.querySelectorAll('td')];
          return tds.map((td) => td.innerText);
        })
        .filter((tr) => tr.length != 0);

      return tableData;
    }

    const tables = document.querySelectorAll('table');

    const intoliTable = extractTable(tables[0]);
    const fpsTable = extractTable(tables[1]);
    const detailsTable = extractTable(tables[2]);

    return { intoliTable, fpsTable, detailsTable };
  });

  await browser.close();

  const result = {
    userAgent: data['intoliTable'].find((item) =>
      item[0].toLocaleLowerCase().includes('user agent')
    )?.[1],
    languages: data['intoliTable'].find((item) =>
      item[0].toLowerCase().includes('languages')
    )?.[1],
    fingerprintPassedCount: data['fpsTable'].filter((item) => item[1] === 'ok')
      .length,
    canvasHashes: data['detailsTable']
      .filter((item) => item[0].toLowerCase().includes('canvas'))
      .map((item) => item[1]),
  };

  console.log(result);
};

main();
