describe('Thirds E2E Tests:', function () {
  describe('Test thirds page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/thirds');
      expect(element.all(by.repeater('third in thirds')).count()).toEqual(0);
    });
  });
});
