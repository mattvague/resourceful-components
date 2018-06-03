import { resourceful, resourcefulList, Resource } from '../'

class Dog extends Resource({
  name: undefined,
  breed: undefined,
  age: undefined
}, 'Dog') {

  //static actions = {
    //fetchAll({ ownerId }) { ... }
  //}

  //static selectors = {
    //selectAll() { ... }
    //select() { ... }
  //}

  //actions = {
    //fetch() { ... }
    //create() { ... }
    //update() { ... }
    //save() { ... }
    //destroy() { ... }
  //}
}

describe('resourceful', () => {
  it('throws error unless resource is defined', () => {
    expect(() => resourceful(null)(TestComponent)).toThrow(/No resource provided/)
  })

  describe('wrapped component', () => {
    it('return component wrapped in container')

    describe('when id prop present', () => {
      it('selects record based on id')
      it('fetches record when component mounts')
      it('fetches record when id prop changes')

      describe('when select returns no record', () => {
        it('builds and passes new record')
        it('fetches built record when component mounts')
        it('fetches built record when id prop changes')
      })
    })

    describe('when record prop present', () => {
      it('selects from record based on record id')
      it('fetches built record when component mounts')
      it('fetches built record when record prop changes')

      describe('when select returns no record', () => {
      it('passes record to component')
      })
    })

    describe('when record and id prop present')

    it('passes isLoading from record to component')
    it('passes isSaving from record to component')

    it('maps resource actions to props')
  })

  describe('options', () => {
    describe('mergeProps', () => {
      it('allows merging props')
    })

    describe('idAttr', () => {
      it('allows customizing idAttr')
    })
  })
})

//describe('resourcefulList', () => {
  //it('throws error unless resource is defined', () => {
    //expect(() => resourcefulList(null)(TestComponent)).toThrow(/No resource provided/)
  //})

  //describe('wrapped component', () => {
    //it('return component wrapped in container')
    //it('selects records')
    //it('fetches records when component mounts')
    //it('fetches records when specified props change')
    //it('passes props to Resource.fetchAll')

    //it('passes isLoading from resource to component')
    //it('passes isSaving from resource to component')
  //})

  //describe('options', () => {
    //describe('mergeProps', () => {
      //it('allows merging props')
    //})
  //})
//})
