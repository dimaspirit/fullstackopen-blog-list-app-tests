const { beforeEach, describe, test, expect } = require('@playwright/test');

describe('Blog list app', () => {
  const loginBtnLabel = 'Login'
  const username = 'test'
  const password = '12345678'

  beforeEach(async ({page}) => {
    await page.goto('http://localhost:5173')
  })

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/);
  })
  
  test('login form is shown', async ({ page }) => {
    const locator = page.getByRole('heading', { name: loginBtnLabel })
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    beforeEach(async ({ page, request }) => {
      await request.post('http://localhost:3001/api/testing/reset')
      await request.post('http://localhost:3001/api/users', {
        data: {
          username: username,
          password: password
        }
      })

      await page.goto('http://localhost:5173')
    });
 
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('textbox', {name: 'username'}).fill(username)
      await page.getByRole('textbox', {name: 'password'}).fill(password)

      await page.getByRole('button', { name: loginBtnLabel }).click() 

      await expect(page.getByText(username)).toBeVisible();
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('textbox', {name: 'username'}).fill(username)
      await page.getByRole('textbox', {name: 'password'}).fill('1234567')
  
      await page.getByRole('button', { name: loginBtnLabel }).click() 
  
      await expect(page.getByText(/invalid username or password/)).toBeVisible();
    })
  })
})
