import User = require('./user.vue');

describe('User view', function(){
  it('exist', function(){
    expect(User).to.be.a('object');
  });
});
