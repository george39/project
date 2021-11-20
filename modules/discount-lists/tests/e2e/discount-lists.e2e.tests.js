describe('Discount lists E2E Tests:', function () {
  describe('Test discountLists page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/discountLists');
      expect(element.all(by.repeater('discountList in discountLists')).count()).toEqual(0);
    });
  });
});
