/// <reference types="cypress" />
import Papa from 'papaparse';


describe('Inveritax Portal Login Test', () => {
    it('should log in with valid credentials and get Loan and Tax IDs', () => {
        cy.visit('https://dev-app.inveritax.com/');
        cy.get('input[type="email"]').type('jayaraman1995.r+14@gmail.com');
        cy.get('input[type="password"]').type('ARAMgJkeW7E');
        cy.get('button[type="submit"]').click();

        // Assert successful login by checking for a dashboard element
        cy.url().should('include', '/dashboard');
        cy.contains('Bank of Wisconsin').should('be.visible');

        cy.get(`a[href="/loans"]`, { timeout: 10000 }).should('be.visible').click();
        cy.get(`table tbody tr`, { timeout: 30000 }).eq(1).should('be.visible')
        cy.wait(3000)

        const loanIds = [];
        const taxIds = [];
        cy.get(`span[class="text-muted-foreground text-sm"]`, { timeout: 60000 }).should('be.visible').invoke('text').then((paginationCount) => {
            let endCount = Number(paginationCount.replace("/", "").trim())
            cy.log(endCount)
            for (let i = 1; i <= endCount; i++) {
                cy.get(`table tbody tr`, { timeout: 30000 }).eq(1).should('be.visible')
                cy.wait(3000)

                cy.get('table tbody tr', { timeout: 60000 }).should('have.length.greaterThan', 0).then(($rows) => {
                    $rows.each((index, row) => {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 2) {
                            loanIds.push(cells[0].innerText.trim());
                            taxIds.push(cells[1].innerText.trim());
                        }
                    });
                });
                cy.get(`a[aria-label="Next Page"]`, { timeout: 10000 }).click()
            }
        })


        cy.wrap(null).then(() => {
            cy.fixture('Final Prod Lender File 1.csv')
                .then(csvData => {
                    const parsed = Papa.parse(csvData, {
                        header: true,
                        skipEmptyLines: true
                    });

                    const mismatches = [];

                    const EPSILON = 0.01; // tolerance value

                    parsed.data.forEach(row => {
                        const loanNum = String(row['Existing Loan Number']).trim().toLowerCase();
                        const csvTaxKey = String(row['Tax_Key']).trim().toLowerCase(); //New
                        // Parse Tax_Key from CSV to float

                        //let csvTaxKey = parseFloat(row['Tax_Key']).toLowerCase();
                         
                   
                        // Try to find a matching taxId from UI list within tolerance
                        const matchedTax = taxIds.some(uiTaxId => {
                           // const uiTaxFloat = parseFloat(uiTaxId);
                           // return Math.abs(uiTaxFloat - csvTaxKey) <= EPSILON;
                             return String(uiTaxId).trim().toLowerCase() === csvTaxKey;
                        });

                        //const loanFound = loanIds.includes(loanNum);
                        const loanFound = loanIds.some(uiLoan => {
                        return String(uiLoan).trim().toLowerCase() === loanNum;
                          });


                        if (!loanFound || !matchedTax) {
                            mismatches.push({ loanNum, csvTaxKey });
                        }
                    });

                    if (mismatches.length > 0) {
                        cy.log(`Found ${mismatches.length} mismatches`);
                        cy.writeFile('cypress/downloads/mismatches.json', mismatches);
                    } else {
                        cy.log('All loan numbers and tax keys matched successfully!');
                    }
                });
        })

    });
});