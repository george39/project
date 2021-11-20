describe('Feature details E2E Tests:', function () {
  describe('Test featureDetails page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/featureDetails');
      expect(element.all(by.repeater('featureDetail in featureDetails')).count()).toEqual(0);
    });
  });
});
