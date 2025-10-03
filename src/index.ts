import { input, select } from '@inquirer/prompts';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  getAuthInfo,
  getCaptcha,
  getCookies,
  getEmail,
  getPassword,
  getQuestions,
  getSecret,
  getSuccessText,
  goToAuth,
  injectCookie,
  logCoverages,
  logResult,
  Result,
} from './helper';
import { Browser } from 'puppeteer';
import chalk from 'chalk';

puppeteer.use(stealthPlugin());

const simpleFormAuth = async (
  browser: Browser,
  page: Page
): Promise<Result> => {
  await goToAuth(page, 'Simple Form Authentication');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;

      document.querySelector('form')?.submit();
    },
    { email, password }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    loginInformation,
    pageCookies,
  };

  return result;
};

const complexAuth = async (browser: Browser, page: Page): Promise<Result> => {
  await goToAuth(page, 'Complex Form Authentication');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;

      const selectInput =
        document.querySelector<HTMLSelectElement>('#selectLogin');
      selectInput!.value = 'yes';

      const checkInput = document.querySelector<HTMLInputElement>('#loveForm');
      checkInput!.checked = true;

      document.querySelector('form')?.submit();
    },
    { email, password }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    loginInformation,
    pageCookies,
  };

  return result;
};

const bootstrapAuth = async (browser: Browser, page: Page): Promise<Result> => {
  await goToAuth(page, 'Interactive Authentication');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);
  const captcha = await getCaptcha(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;
    },
    { email, password }
  );

  await page.type('#captcha', captcha, { delay: 100 });
  await page.evaluate(() => {
    document.querySelector('form')?.submit();
  });

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    captcha,
    loginInformation,
    pageCookies,
  };

  return result;
};

const delayChallenge = async (
  browser: Browser,
  page: Page
): Promise<Result> => {
  await goToAuth(page, 'Old School Cool - Delayed Login');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;

      document.querySelector('form')?.submit();
    },
    { email, password }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    loginInformation,
    pageCookies,
  };

  return result;
};

const dynamicChallenge = async (
  browser: Browser,
  page: Page
): Promise<Result> => {
  await goToAuth(page, 'Dynamic Field Names');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput =
        document.querySelector<HTMLInputElement>('input[type=email]');
      emailInput!.value = email;

      const passwordInput = document.querySelector<HTMLInputElement>(
        'input[type=password]'
      );
      passwordInput!.value = password;

      document.querySelector('form')?.submit();
    },
    { email, password }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    loginInformation,
    pageCookies,
  };

  return result;
};

const multiStepAuth = async (browser: Browser, page: Page): Promise<Result> => {
  await goToAuth(page, 'Multi-Page Challenge');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);

  await page.evaluate(
    ({ email }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      document.querySelector('form')?.submit();
    },
    { email }
  );

  await page.waitForSelector('#password');
  await page.evaluate(
    ({ password }) => {
      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;

      document.querySelector('form')?.submit();
    },
    { password }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    loginInformation,
    pageCookies,
  };

  return result;
};

const questionChallenge = async (
  browser: Browser,
  page: Page
): Promise<Result> => {
  await goToAuth(page, '"Security" Questions');

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);
  const questions = await getQuestions(authInfo);

  await page.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;
    },
    { email, password }
  );

  const question = await page.evaluate(
    () =>
      document.querySelector<HTMLLabelElement>('label[for="answer"]')
        ?.innerText || ''
  );

  const answer =
    questions.find(
      (item) => item.question.toLowerCase() === question.toLowerCase()
    )?.answer || '';

  await page.evaluate(
    ({ answer }) => {
      const answerInput = document.querySelector<HTMLInputElement>('#answer');
      answerInput!.value = answer;

      document.querySelector('form')?.submit();
    },
    { answer }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    question,
    answer,
    loginInformation,
    pageCookies,
  };

  return result;
};

const totpChallenge = async (browser: Browser, page: Page): Promise<Result> => {
  await goToAuth(
    page,
    'Time-Based One-Time Password Multi-Factor Authentication'
  );

  const authInfo = await getAuthInfo(page);
  const email = await getEmail(authInfo);
  const password = await getPassword(authInfo);
  const secret = await getSecret(authInfo);

  console.log('We need your TOTP data to continue.');
  console.log('Your TOTP secret is ' + secret);
  console.log(
    'Please input it in your TOTP authenticator, then fill the OTP below.'
  );
  const totp = await input({ message: 'OTP' });

  console.log(
    '\n' + chalk.bgMagentaBright('Continue attempting to auth...') + '\n'
  );

  await page.evaluate(
    ({ email, password, totp }) => {
      const emailInput = document.querySelector<HTMLInputElement>('#email');
      emailInput!.value = email;

      const passwordInput =
        document.querySelector<HTMLInputElement>('#password');
      passwordInput!.value = password;

      const totpInput = document.querySelector<HTMLInputElement>('#totpmfa');
      totpInput!.value = totp;

      document.querySelector('form')?.submit();
    },
    { email, password, totp }
  );

  const loginInformation = await getSuccessText(page);
  const pageCookies = await getCookies(browser);

  const result = {
    email,
    password,
    totp,
    loginInformation,
    pageCookies,
  };

  return result;
};

const main = async () => {
  const answer = await select({
    message: 'Choose your authentication menu!',
    choices: [
      {
        name: 'Simple Form Authentication',
        value: 'simpleFormAuth',
      },
      {
        name: 'Complex Form Authentication',
        value: 'complexAuth',
      },
      {
        name: 'Interactive Form Authentication',
        value: 'bootstrapAuth',
      },
      {
        name: 'Delayed Form Authentication',
        value: 'delayChallenge',
      },
      {
        name: 'Dynamic Field Authentication',
        value: 'dynamicChallenge',
      },
      {
        name: 'Multiple Page Authentication',
        value: 'multiStepAuth',
      },
      {
        name: 'Security Authentication',
        value: 'questionChallenge',
      },
      {
        name: 'TOTP Authentication',
        value: 'totpChallenge',
      },
    ],
  });

  console.log('\n' + chalk.bgMagentaBright('Attempting to auth...') + '\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://authenticationtest.com/');

  let result: Result = {
    email: '',
    password: '',
    loginInformation: '',
    pageCookies: [],
  };

  switch (answer) {
    case 'simpleFormAuth':
      result = await simpleFormAuth(browser, page);
      break;
    case 'complexAuth':
      result = await complexAuth(browser, page);
      break;
    case 'bootstrapAuth':
      result = await bootstrapAuth(browser, page);
      break;
    case 'delayChallenge':
      result = await delayChallenge(browser, page);
      break;
    case 'dynamicChallenge':
      result = await dynamicChallenge(browser, page);
      break;
    case 'multiStepAuth':
      result = await multiStepAuth(browser, page);
      break;
    case 'questionChallenge':
      result = await questionChallenge(browser, page);
      break;
    case 'totpChallenge':
      result = await totpChallenge(browser, page);
      break;
  }

  logResult(result);

  console.log('\n' + chalk.bgMagentaBright('Injecting cookie...') + '\n');

  await injectCookie(browser, page, result.pageCookies[0]);
  await logCoverages(page);

  console.log();
  await browser.close();
};

main();
