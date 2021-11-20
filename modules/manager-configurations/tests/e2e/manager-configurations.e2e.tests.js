describe('Manager configurations E2E Tests:', function () {
  describe('Test managerConfigurations page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/managerConfigurations');
      expect(element.all(by.repeater('managerConfiguration in managerConfigurations')).count()).toEqual(0);
    });
  });
});
