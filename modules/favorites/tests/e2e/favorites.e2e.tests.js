describe('Favorites E2E Tests:', function () {
  describe('Test favorites page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/favorites');
      expect(element.all(by.repeater('favorite in favorites')).count()).toEqual(0);
    });
  });
});
