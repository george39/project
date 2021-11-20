describe('Discount massives E2E Tests:', function () {
  describe('Test discountMassives page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/discountMassives');
      expect(element.all(by.repeater('discountMassive in discountMassives')).count()).toEqual(0);
    });
  });
});
