describe('Data types E2E Tests:', function () {
  describe('Test dataTypes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/dataTypes');
      expect(element.all(by.repeater('dataType in dataTypes')).count()).toEqual(0);
    });
  });
});
