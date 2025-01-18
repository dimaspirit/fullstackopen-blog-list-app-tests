const { beforeEach, describe, test, expect } = require('@playwright/test');

describe('Blog list app', () => {
  beforeEach(async ({page}) => {
    await page.goto('http://localhost:5173')
  })

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/);
  })
  
  test('login form is shown', async ({ page }) => {
    const locator = page.getByRole('heading', { name: 'Login' })
    await expect(locator).toBeVisible()
  })
})
