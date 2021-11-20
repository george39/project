describe('Taxes E2E Tests:', function () {
  describe('Test taxes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/taxes');
      expect(element.all(by.repeater('tax in taxes')).count()).toEqual(0);
    });
  });
});
