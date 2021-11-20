describe('Aliases E2E Tests:', function () {
  describe('Test aliases page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/aliases');
      expect(element.all(by.repeater('alias in aliases')).count()).toEqual(0);
    });
  });
});
