describe('Langs E2E Tests:', function () {
  describe('Test langs page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/langs');
      expect(element.all(by.repeater('lang in langs')).count()).toEqual(0);
    });
  });
});
