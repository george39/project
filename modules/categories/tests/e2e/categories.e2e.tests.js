describe('Categories E2E Tests:', function () {
  describe('Test categories page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/categories');
      expect(element.all(by.repeater('category in categories')).count()).toEqual(0);
    });
  });
});
