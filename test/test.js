const Nightmare = require('nightmare')
const {expect} = require('chai')

const nightmare = Nightmare({ show: false });

describe('Load Example Page', function() {
  this.timeout('30s')
  let page, test
  before(()=>{
    page = nightmare.goto(`file:///${__dirname}/../docs/src/main/tut/examples/index.html`)
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

  describe('#Example 3', () => {
    it('default', () => {
      return page
        .wait('#eg3 .result')
        .evaluate(() => document.querySelector('#eg3 .result').textContent)
        .then(x=>expect(x).to.equal('Jichao Ouyang'))
    })
    it('reactive concatable', () => {
      return page
        .insert('input[name="firstName"]', 'Hehe')
        .insert('input[name="lastName"]', 'Da')
        .wait('#eg3 .result')
        .evaluate(() => document.querySelector('#eg3 .result').textContent)
        .then(x=>expect(x).to.equal('JichaoHehe OuyangDa'))
    })
  })


  describe('#Example 4', () => {
    it('default', () => {
      return page
        .wait('#eg4 .result')
        .evaluate(() => document.querySelector('#eg4 .result').textContent)
        .then(x=>expect(x).to.equal('28'))
    })
    it('Traverse', () => {
      return page
        .insert('input[name="traverse3"]', '1')
      .insert('input[name="traverse5"]', '2')
        .wait('#eg4 .result')
        .evaluate(() => document.querySelector('#eg4 .result').textContent)
        .then(x=>expect(x).to.equal('121'))
    })
  })

  describe('#Example 5', () => {
    it('default', () => {
      return page
        .wait(() => document.querySelector('#eg5 .result').textContent == '22.86')
        .evaluate(() => document.querySelector('#eg5 .result').textContent)
        .then(x=>expect(x).to.equal('22.86'))
    })
  })

  describe('#Example 6', () => {
    it('increase 3 by click 3 times', () => {
      return page
        .click('#eg6 input[name="increment"]')
        .click('#eg6 input[name="increment"]')
        .click('#eg6 input[name="increment"]')
        .evaluate(() => document.querySelector('#eg6 .result').textContent)
        .then(x=>expect(x).to.equal('3'))
    })
  })

  describe('#Example 7', () => {
    it('increase 3 and decrease 4', () => {
      return page
        .click('#eg7 input[name="increment"]')
        .click('#eg7 input[name="increment"]')
        .click('#eg7 input[name="increment"]')
        .click('#eg7 input[name="decrement"]')
        .click('#eg7 input[name="decrement"]')
        .click('#eg7 input[name="decrement"]')
        .click('#eg7 input[name="decrement"]')
        .evaluate(() => document.querySelector('#eg7 .result').textContent)
        .then(x=>expect(x).to.equal('-1'))
    })
  })

  describe('#Example 8', () => {
    it('increase 3 and decrease 4', () => {
      return page
        .click('#eg8 input[name="+1"]')
        .click('#eg8 input[name="reset"]')
        .click('#eg8 input[name="+1"]')
        .click('#eg8 input[name="+1"]')
        .click('#eg8 input[name="+1"]')
        .click('#eg8 input[name="-1"]')
        .click('#eg8 input[name="-1"]')
        .click('#eg8 input[name="-1"]')
        .click('#eg8 input[name="-1"]')
        .evaluate(() => document.querySelector('#eg8 .result').textContent)
        .then(x=>expect(x).to.equal('-1'))
    })
  })
})
