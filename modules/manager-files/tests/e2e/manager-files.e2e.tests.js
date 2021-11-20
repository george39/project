describe('Manager files E2E Tests:', function () {
  describe('Test managerFiles page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/managerFiles');
      expect(element.all(by.repeater('managerFile in managerFiles')).count()).toEqual(0);
    });
  });
});
