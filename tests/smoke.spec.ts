import { test, expect } from '@playwright/test';

test('customer can reach Paystack checkout', async ({ page }) => {
  await page.goto('/');

  // Open Still lamp
  await page.getByRole('link', {
    name: 'Still lamp Still lamp ₦20,000',
  }).click();

  // Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Open cart
  await page.getByRole('link', { name: 'Cart (1)' }).click();

  // Fill checkout details
  await page.getByRole('textbox', {
    name: 'e.g. you\@example.com',
  }).fill('test\@example.com');

  await page.getByRole('textbox', {
    name: 'e.g. Rumuola, near Rainbow',
  }).fill('Garrison');

  await page.getByRole('textbox', {
    name: 'e.g. 08012345678',
  }).fill('08000000000');

  await page.getByRole('textbox', {
    name: "Anything you'd like to add",
  }).fill('Playwright checkout test');

  // Confirm payment button is available
  await expect(
    page.getByRole('button', { name: 'Pay ₦' })
  ).toBeVisible();
});

test('Paystack payment opens', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', {
    name: 'Still lamp Still lamp ₦20,000',
  }).click();

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.getByRole('link', { name: 'Cart (1)' }).click();

  await page.getByRole('textbox', {
    name: 'e.g. you\@example.com',
  }).fill('test\@example.com');

  await page.getByRole('textbox', {
    name: 'e.g. Rumuola, near Rainbow',
  }).fill('Garrison');

  await page.getByRole('textbox', {
    name: 'e.g. 08012345678',
  }).fill('08000000000');

  await page.getByRole('textbox', {
    name: "Anything you'd like to add",
  }).fill('Playwright payment test');

  await page.getByRole('button', { name: 'Pay ₦' }).click();

  // Wait for Paystack to start loading
  await page.waitForTimeout(5000);

  // Confirm Paystack is present
  await expect(
    page.locator('iframe').first()
  ).toBeVisible();
});

test('customer can find orders by phone number', async ({ page }) => {
  await page.goto('/orders');

  // Confirm My Orders page loads
  await expect(
    page.getByRole('heading', { name: 'My Orders' })
  ).toBeVisible();

  // Enter the phone number used for existing test orders
  await page
    .getByPlaceholder('e.g. 08012345678')
    .fill('08149656638');

  // Search
  await page.getByRole('button', { name: 'Find' }).click();

  // Confirm existing orders are displayed
  await expect(page.getByText('#42538', { exact: true })).toBeVisible();
  await expect(page.getByText('#55755', { exact: true })).toBeVisible();
  await expect(page.getByText('#26641', { exact: true })).toBeVisible();

  // Confirm product information is displayed
  await expect(
    page.getByText('Still lamp · Blue').first()
  ).toBeVisible();

  await expect(
    page.getByText('Night Lamp · Black').first()
  ).toBeVisible();
});

test('checkout requires customer details', async ({ page }) => {
  await page.goto('/');

  // Open Still lamp
  await page.getByRole('link', {
    name: 'Still lamp Still lamp ₦20,000',
  }).click();

  // Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Open cart
  await page.getByRole('link', { name: 'Cart (1)' }).click();

  // Payment button should be present
  const payButton = page.getByRole('button', { name: /Pay ₦/ });
  await expect(payButton).toBeVisible();

  // Try to pay without filling checkout details
  await payButton.click();

  // Confirm we remain on the checkout page
  await expect(page.getByText('Pickup Details')).toBeVisible();
});

test('cart persists after page reload', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', {
    name: 'Still lamp Still lamp ₦20,000',
  }).click();

  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.getByRole('link', { name: 'Cart (1)' }).click();

  await expect(
    page.getByText('Still lamp ·')
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByText('Still lamp ·')
  ).toBeVisible();

  await expect(
    page.getByText('Total')
  ).toBeVisible();
});