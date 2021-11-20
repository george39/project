describe('Crafts E2E Tests:', function () {
  describe('Test crafts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/crafts');
      expect(element.all(by.repeater('craft in crafts')).count()).toEqual(0);
    });
  });
});
