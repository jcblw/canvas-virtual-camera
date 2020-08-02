import path from 'path'
import { AsyncHelpers } from '@mujo/utils'
import puppeteer from 'puppeteer'
import manifest from '../build/manifest.json'
import { APP_READY_KEY } from './constants'

const { wait } = AsyncHelpers
const TEST_TIMEOUT = 20000 // extend test timeout sinces its E2E
const TEST_DEFAULT_TIMEOUT = 5000

let browser
let page
const BUILD_PATH = path.resolve(__dirname, '../build')

let extensionId = null

const getExtensionId = async () => {
  const dummyPage = await browser.newPage()
  await dummyPage.waitFor(2000) // arbitrary wait time.

  const targets = await browser.targets()
  const extensionTarget = targets.find(
    ({ _targetInfo }) =>
      _targetInfo.title === manifest.name &&
      _targetInfo.type === 'background_page'
  )
  // eslint-disable-next-line no-underscore-dangle
  const extensionUrl = extensionTarget._targetInfo.url || ''
  const [, , extensionID] = extensionUrl.split('/')
  dummyPage.close()
  return extensionID
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    headless: false,
    args: [
      `--disable-extensions-except=${BUILD_PATH}`,
      `--load-extension=${BUILD_PATH}`,
      '--no-sandbox',
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
    },
    slowMo: 100,
  })

  extensionId = await getExtensionId()
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
})

beforeEach(async () => {
  jest.setTimeout(TEST_TIMEOUT)
  page = await browser.newPage()
})

afterEach(async () => {
  if (page) {
    await page.close()
  }
  jest.setTimeout(TEST_DEFAULT_TIMEOUT)
})

const waitDOMLoaded = async () =>
  page.evaluate(
    readyKey =>
      new Promise(resolve => {
        if (window[readyKey]) {
          resolve()
          return
        }
        window[readyKey] = resolve
      }),
    APP_READY_KEY
  )

test.skip(
  'newtab page should have a player',
  async () => {
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await waitDOMLoaded()
    const el = await page.$('[data-testid="breath-player"]')
    await wait(500)
    expect(el).not.toBe(null)
  },
  TEST_TIMEOUT
)
