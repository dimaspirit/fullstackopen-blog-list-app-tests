const { beforeEach, describe, test, expect } = require('@playwright/test');

describe('Blog list app', () => {
  const loginBtnLabel = 'Login'
  const username = 'test'
  const password = '12345678'

  const loginWith = async (page, username, password, btnLabel) => {
    await page.getByRole('textbox', {name: 'username'}).fill(username)
    await page.getByRole('textbox', {name: 'password'}).fill(password)

    await page.getByRole('button', { name: btnLabel }).click() 
  }

  const addBlog = async (page, author, title, url) => {
    await page.getByRole('button', { name: /new blog/ }).click()

    await page.locator('#blog-form-author').fill(author)
    await page.locator('#blog-form-title').fill(title)
    await page.locator('#blog-form-url').fill(url)

    await page.getByRole('button', { name: 'Added new blog' }).click()
  }

  beforeEach(async ({page}) => {
    await page.goto('/')
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
      await request.post('/api/testing/reset')
      await request.post('/api/users', {
        data: {
          username: username,
          password: password
        }
      })

      await page.goto('/')
    });
 
    test('succeeds with correct credentials', async ({ page }) => {
      loginWith(page, username, password, loginBtnLabel);

      await expect(page.getByText(username)).toBeVisible();
    })

    test('fails with wrong credentials', async ({ page }) => {
      loginWith(page, username, '1234567', loginBtnLabel);
  
      await expect(page.getByText(/invalid username or password/)).toBeVisible();
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page, request }) => {
      await request.post('/api/testing/reset')
      await request.post('/api/users', {
        data: {
          username: username,
          password: password
        }
      })

      loginWith(page, username, password, loginBtnLabel);
    });
  
    test('a new blog can be created', async ({ page }) => {
      const author = 'Wes Bos'
      const title = 'Javascript and magic'
      const url = 'wesbos.com/jsandmagic'

      await addBlog(page, author, title, url)

      await expect(page.getByText(`${title} by ${author}`)).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      const author = 'Wes Bos'
      const title = 'Javascript and magic'
      const url = 'wesbos.com/jsandmagic'

      await addBlog(page, author, title, url)
      await page.getByRole('button', { name: 'show' }).click()
      await page.getByRole('button', { name: 'Like' }).click()

      await expect(page.getByText('likes: 1')).toBeVisible();
    })

    test('a blog can be deleted by creator', async ({ page }) => {
      const author = 'Wes Bos'
      const title = 'Javascript and magic'
      const url = 'wesbos.com/jsandmagic'

      await addBlog(page, author, title, url)

      await page.getByRole('button', { name: 'show' }).click()
      await page.getByRole('button', { name: 'Delete' }).click()

      await expect(page.getByText(`${title} by ${author}`)).toBeVisible()
    })

    test('a blog can NOT be deleted by another user', async ({ page, request }) => {
      const blog = {
        author: 'Wes Bos',
        title: 'Javascript and magic',
        url: 'wesbos.com/jsandmagic'
      }

      const user = {
        username: 'test2',
        password: '1234567' 
      }

      await addBlog(page, blog.author, blog.title, blog.url)

      await page.getByRole('button', { name: 'Logout' }).click()

      await request.post('/api/users', { data: user })

      loginWith(page, user.username, user.password, loginBtnLabel);

      await page.getByRole('button', { name: 'show' }).click()

      await expect( page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
    })
  })
})