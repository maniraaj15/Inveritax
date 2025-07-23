const { defineConfig } = require("cypress");

module.exports = defineConfig({

  env: {

  },
  e2e: {
    experimentalStudio: true,
    projectId: 'gshdgsh',
    trashAssetsBeforeRuns: false,
    chromeWebSecurity: false,
    watchForFileChanges: false,
    waitForAnimations: true,
    video: false,
    screenshotOnRunFailure: true,
    testIsolation: true,
    redirectionLimit: 5000,
    reporter: "mochawesome",
    reporterOptions: {
      reporterEnabled: "mochawesome",
      mochawesomeReporterOptions: {
        reportDir: "cypress/reports/mocha",
        quiet: false,
        overwrite: false,
        html: false,
        json: false,
        trashAssetsBeforeRuns: true,
      },
    },
    defaultCommandTimeout: 120000,
    pageLoadTimeout: 160000,
    requestTimeout: 40000,
    responseTimeout: 40000,
    viewportWidth: 1366,
    viewportHeight: 850,
    experimentalMemoryManagement: false,
    experimentalModifyObstructiveThirdPartyCode: false,
    animationDistanceThreshold: 0,
    numTestsKeptInMemory: 1,
    retries: {
      openMode: 0,
      runMode: 0,
    },
    setupNodeEvents(on, config) {
      on("task", {

      });
    },

    specPattern: [
      "cypress/e2e/*/*.js"
    ],
  },
});

