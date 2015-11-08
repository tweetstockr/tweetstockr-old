var expect = require('chai').expect;

describe('Midway: Testing Modules', function() {
  describe('Tweetstockr Module:', function() {
    var module;
    before(function() {
      module = angular.module('tweetstockr');
    });

    it('should be registered', function() {
      expect(module).not.to.equal(null);
    });
  });
});