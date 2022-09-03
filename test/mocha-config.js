const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);


Object.assign(global, {
  expect: chai.expect,
  sinon,
});
