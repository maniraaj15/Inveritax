
describe('Inveritax Portal Loan Status Grouping', () => {
  it('Logs in and captures loan status count from all pages', () => {
    const loanStatuses = [];

    // Login
    cy.visit('https://dev-app.inveritax.com/');
    cy.get('input[type="email"]').type('jayaraman1995.r+14@gmail.com');
    cy.get('input[type="password"]').type('ARAMgJkeW7E');
    cy.get('button[type="submit"]').click();

    // Go to Loans page
    cy.get('a[href="/loans"]', { timeout: 10000 }).click();
    cy.get('table tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0);

    // Get total pages
    cy.get('span.text-muted-foreground.text-sm', { timeout: 20000 })
      .invoke('text')
      .then((paginationText) => {
        const totalPages = Number(paginationText.replace('/', '').trim());
        cy.log(`Total Pages Detected: ${totalPages}`);

        function scrapePage(pageNum) {
          cy.log(`Scraping Page ${pageNum}`);
          cy.wait(3000); // wait for DOM update

          // ✅ Extract loan statuses from the correct column in each row
          cy.get('table tbody tr', { timeout: 10000 }).each(($row) => {
            const statusText = $row.find('td').eq(6).text().trim(); // Adjust index (6) as per real DOM
            if (statusText) {
              loanStatuses.push(statusText);
              cy.log(`Status: ${statusText}`);
            }
          });

          // Go to next page
          if (pageNum < totalPages) {
            cy.get('a[aria-label="Next Page"]').click();
            scrapePage(pageNum + 1);
          } else {
            // Final: Group + write result
            cy.wrap(null).then(() => {
              const groupedStatus = loanStatuses.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
              }, {});
              cy.writeFile('cypress/downloads/loanStatusCounts.json', groupedStatus);
              cy.log('✅ Loan Status Report Generated');
            });
          }
        }

        scrapePage(1);
      });
  });
});

