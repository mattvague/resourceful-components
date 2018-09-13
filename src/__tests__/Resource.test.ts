import Resource from '../Resource'

class MyResource extends Resource({}, 'MyResource') {}

describe('Resource', () => {
  describe('identifierEquals', () => {
    describe('when both ids present', () => {
      [[1,'1',true], ['1', 1, true], [1, 2, false]].forEach((tuple) => {
        it(`is ${tuple[2]} when target id is ${tuple[0]} and other id is ${tuple[1]}`, () => {
          let targetRecord = new MyResource({ id: tuple[0] })
          let otherRecord = new MyResource({ id: tuple[1] })

          expect(targetRecord.identifierEquals(otherRecord)).toEqual(tuple[2])
        })
      })
    })
  })
})
