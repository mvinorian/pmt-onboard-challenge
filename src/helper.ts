import chalk from 'chalk';
import { Browser, Cookie } from 'puppeteer';
import { Page } from 'puppeteer';

export type Result = {
  email: string;
  password: string;
  loginInformation: string;
  pageCookies: Cookie[];
  captcha?: string;
  question?: string;
  answer?: string;
  totp?: string;
};

export const decodeEmail = (emailHex: string) => {
  const bytes = [];
  for (let i = 0; i < emailHex.length; i += 2) {
    bytes.push(parseInt(emailHex.substring(i, i + 2), 16));
  }

  if (bytes.length === 0) return '';
  const key = bytes[0];
  let out = '';

  for (let i = 1; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i] ^ key);
  }

  return out;
};

export const goToAuth = async (page: Page, auth: string) => {
  await page.waitForSelector('.card-body');
  await page.evaluate(
    ({ auth }) => {
      const cards = [
        ...document.querySelectorAll<HTMLDivElement>('.card-body'),
      ];
      const button = cards
        .find(
          (card) =>
            card
              .querySelector<HTMLHeadingElement>('.card-title')
              ?.innerText.toLowerCase() === auth.toLowerCase()
        )
        ?.querySelector<HTMLAnchorElement>('a');

      button?.click();
    },
    { auth }
  );
};

export const getAuthInfo = async (page: Page) => {
  await page.waitForSelector('.alert-primary');
  return await page.evaluate(
    () =>
      document
        .querySelector<HTMLDivElement>('.alert-primary')
        ?.innerHTML?.split('\n') || []
  );
};

export const getEmail = async (authInfo: string[]) => {
  return decodeEmail(
    authInfo
      .find((item) => item.toLowerCase().includes('e-mail'))
      ?.split('data-cfemail="')[1]
      .split('">')[0] || ''
  );
};

export const getPassword = async (authInfo: string[]) => {
  return (
    authInfo
      .find((item) => item.toLowerCase().includes('password'))
      ?.split(' ')[1]
      .split('<br>')[0] || ''
  );
};

export const getCaptcha = async (authInfo: string[]) => {
  return (
    authInfo
      .find((item) => item.toLowerCase().includes('captcha'))
      ?.split('(')[1]
      .split(')')[0] || ''
  );
};

export const getQuestions = async (authInfo: string[]) => {
  return authInfo
    .filter((item) => item.includes('.....'))
    .map((item) => ({
      question: item.split('.....')[1].split('</strong>')[0],
      answer: item.split('</strong> ')[1].split('<br>')[0],
    }));
};

export const getSecret = async (authInfo: string[]) => {
  return authInfo
    .find((item) => item.includes('<strong>Secret:'))
    ?.split('Secret: ')[1]
    .split('</strong>')[0];
};

export const getSuccessText = async (page: Page) => {
  await page.waitForSelector('.alert');
  return (
    (await page.evaluate(
      () => document.querySelector<HTMLDivElement>('.alert')?.innerText
    )) || ''
  );
};

export const getCookies = async (browser: Browser) => {
  return await browser.cookies();
};

export const injectCookie = async (
  browser: Browser,
  page: Page,
  cookie: Cookie
) => {
  await page.goto('https://authenticationtest.com/');
  await browser.setCookie(cookie);
  await page.reload();
  await page.goto('https://authenticationtest.com/coverage/?id=1');
};

export const logCoverages = async (page: Page) => {
  const coverages = await page.evaluate(() => {
    const div = document.querySelector('div.col-sm-12');
    const links = [...(div?.querySelectorAll('a') || [])];
    return links.map((item) => ({ text: item.innerText, href: item.href }));
  });

  console.log(chalk.bold.bgCyanBright('Coverages'));
  console.log('---');
  console.log(
    coverages
      .map(
        (item) =>
          `${chalk.bold.cyanBright('text')} | ${chalk.whiteBright(
            item.text
          )}\n` +
          `${chalk.bold.cyanBright('href')} | ${chalk.whiteBright(item.href)}`
      )
      .join('\n---\n')
  );
};

export const logResult = ({
  email,
  password,
  loginInformation,
  pageCookies,
  captcha,
  question,
  answer,
  totp,
}: Result) => {
  console.log(chalk.bold.bgCyan('Email'));
  console.log('---');
  console.log(chalk.cyan(email));
  console.log();

  console.log(chalk.bold.bgYellow('Password'));
  console.log('---');
  console.log(chalk.yellow(password));
  console.log();

  if (captcha) {
    console.log(chalk.bold.bgMagentaBright('Captcha'));
    console.log('---');
    console.log(chalk.magentaBright(captcha));
    console.log();
  }

  if (question) {
    console.log(chalk.bold.bgRedBright('Question'));
    console.log('---');
    console.log(chalk.redBright(question));
    console.log();
  }

  if (answer) {
    console.log(chalk.bold.bgMagentaBright('Answer'));
    console.log('---');
    console.log(chalk.magentaBright(answer));
    console.log();
  }

  if (totp) {
    console.log(chalk.bold.bgMagentaBright('TOTP'));
    console.log('---');
    console.log(chalk.magentaBright(totp));
    console.log();
  }

  console.log(chalk.bold.bgGreenBright('Login Information'));
  console.log('---');
  console.log(chalk.greenBright(loginInformation));
  console.log();

  console.log(chalk.bold.bgBlueBright('Page Cookies'));
  console.log('---');
  console.log(
    pageCookies
      .map((item) =>
        Object.entries(item)
          .map(
            ([k, v]) =>
              `${chalk.bold.blueBright(k.padEnd(15, ' '))}| ${chalk.whiteBright(
                v
              )}`
          )
          .join('\n')
      )
      .join('\n---\n')
  );
};
