describe('Movements E2E Tests:', function () {
  describe('Test movements page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/movements');
      expect(element.all(by.repeater('movement in movements')).count()).toEqual(0);
    });
  });
});
