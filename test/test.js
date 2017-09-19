const Nightmare = require('nightmare')
const {expect} = require('chai')

const nightmare = Nightmare({ show: true });

describe('Load Example Page', function() {
  this.timeout('30s')
  let page, test
  before(()=>{
    page = nightmare.goto('https://xreact.oyanglul.us/examples/index.html')
  })
  after(()=>{
    return page.end()
  })

  describe('#Example 1', () => {
    it('display 30', () => {
      return page
        .wait('#eg1 .result')
        .evaluate(() => document.querySelector('#eg1 .result').textContent)
        .then(x=>expect(x).to.equal('30'))
    })
  })

  describe('#Example 2', () => {
    it('default 30', () => {
      return page
        .wait('#eg2 .result')
        .evaluate(() => document.querySelector('#eg2 .result').textContent)
        .then(x=>expect(x).to.equal('30'))
    })
    it('Two number multiply', () => {
      return page
        .insert('input[name="n1"]', '8')
      .insert('input[name="n2"]', '9')
        .wait('#eg2 .result')
        .evaluate(() => document.querySelector('#eg2 .result').textContent)
        .then(x=>expect(x).to.equal('4002'))
    })
  })
})
