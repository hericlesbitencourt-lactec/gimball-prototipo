const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4174', viewport: { width: 390, height: 844 } },
  webServer: { command: 'cx -- python3 -m http.server 4174', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI },
});
