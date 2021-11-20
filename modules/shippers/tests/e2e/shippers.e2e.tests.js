describe('Shippers E2E Tests:', function () {
  describe('Test shippers page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shippers');
      expect(element.all(by.repeater('shipper in shippers')).count()).toEqual(0);
    });
  });
});
