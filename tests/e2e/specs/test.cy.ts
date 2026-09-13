describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/seguimiento')
    cy.contains('ion-title', 'Servicios Activos')
  })
})
