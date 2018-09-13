import * as React from "react"
import { Map, List, fromJS } from 'immutable'
import { resourceful, resourcefulList } from '../'
import Resource from '../Resource'

import { shallow, mount } from 'enzyme'


// TODO test select args
const mockSelectors = {
  select: (id) => (state) => state.get('dogs').get(id),
  selectAll: () => (state) => state.get('dogs').toList()
}

const mockInstanceActions = {
  fetch: jest.fn().mockReturnValue({ type: 'TEST' }),
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
  pet: jest.fn()
}

const mockClassActions = {
  fetchAll: jest.fn()
}

class Dog extends Resource({
  name: undefined,
  breed: undefined,
  age: undefined
}, 'Dog') {

  static actions = mockClassActions
  static selectors = mockSelectors
  get actions () { return mockInstanceActions }
}

const state = fromJS({
  dogs: Map([
    [99, Map({
      id: 99,
      name: 'Laika',
      breed: 'Husky'
    })],
    ['abcd1234', Map({
      id: 'abcd1234',
      cid: 'abcd1234',
      name: 'Laika',
      breed: 'Husky'
    })],
  ])
})

const store =  {
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  getState: jest.fn().mockReturnValue(state)
}

const createStore = () => store
const testStore = createStore()

describe('resourceful', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  let Component = ({ record }: any) => <div></div>
  let buildWrappedComponent = () => resourceful(Dog)(Component)
  let getProps = (node) => node.children().first().props()

  it('throws error unless resource is defined', () => {
    expect(() => resourceful(null)(Component)).toThrow(/No resource provided/)
  })

  describe('wrapped component', () => {
    it('returns wrapped component', () => {
      const WrappedComponent = buildWrappedComponent()
      const node = shallow(<WrappedComponent store={testStore} />)
      expect(node.html()).not.toBe(null)
    })

    it('selects record by id', () => {
      const WrappedComponent = buildWrappedComponent()
      const node = mount(<WrappedComponent store={testStore} id={99} />)
      const props = getProps(node)

      expect(props).toEqual(expect.objectContaining({
        id: 99,
        record: Dog.build({
          id: 99,
          name: 'Laika',
          breed: 'Husky'
        })
      }))
    })

    it('is passes record actions props', () => {
      const WrappedComponent = buildWrappedComponent()
      const node = mount(<WrappedComponent store={testStore} id={99} />)
      const props = getProps(node)

      expect(Object.keys(props)).toEqual(expect.arrayContaining([
        'fetch', 'create', 'update', 'save', 'destroy', 'pet'
      ]))
    })

    it('fetches record when component mounts', () => {
      const WrappedComponent = buildWrappedComponent()
      mount(<WrappedComponent store={testStore} id={99} />)

      expect(mockInstanceActions.fetch).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }))
    })

    it('fetches record when id prop changes', () => {
      const WrappedComponent = buildWrappedComponent()
      const node = mount(<WrappedComponent store={testStore} id={99} />)

      node.setProps({ id: 100 })

      expect(mockInstanceActions.fetch.mock.calls.length).toEqual(2)
      expect(mockInstanceActions.fetch).toHaveBeenCalledWith(expect.objectContaining({ id: 100 }))
    })

    describe('when id props changes to string value', () => {
      it('does not re-fetch record', () => {
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} id={99} />)

        node.setProps({ id: '99' })

        expect(mockInstanceActions.fetch.mock.calls.length).toEqual(1)
      })
    })

    describe('when other props changes', () => {
      it('does not re-fetch record', () => {
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} id={99} />)

        node.setProps({ notId: 1234 })

        expect(mockInstanceActions.fetch.mock.calls.length).toEqual(1)
      })
    })

    describe('when id was nil', () => {
      it('fetches when id prop set', () => {
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} />)

        node.setProps({ id: 99 })

        expect(mockInstanceActions.fetch).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }))
      })
    })

    describe('when select returns no record', () => {
      it('builds and passes new record', () => {
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} id={98} />)
        const props = getProps(node)

        expect(props).toEqual(expect.objectContaining({
          id: 98,
          record: expect.objectContaining({
            id: 98
          })
        }))
      })
    })

    xit('maps record actions to dispath props', () => {})
  })

  describe('options', () => {
    describe('recordProp', () => {
      it('renames record prop', () => {
        const WrappedComponent = resourceful(Dog, { recordProp: 'dog' })(Component)
        const node = mount(<WrappedComponent store={testStore} id={98} />)
        const props = getProps(node)

        expect(props).toEqual(expect.objectContaining({
          id: 98,
          dog: expect.objectContaining({
            id: 98
          })
        }))
      })
    })

    describe('recordUpdateProps', () => {
      xit('fetches record when record whitelisted prop changes', () => {
        const record = Dog.build({ id: 103, name: 'Laika', breed: 'Husky' })
        const WrappedComponent = resourceful(Dog, { recordUpdateProps: ['breed'] })(Component)
        const node = mount(<WrappedComponent store={testStore} record={record} />)

        node.setProps({ record: Dog.build({ id: 103, name: 'Laika', breed: 'new breed' }) })

        expect(mockInstanceActions.fetch.mock.calls.length).toEqual(2)
      })
    })

    describe('autoFetch', () => {
      describe('when false', () => {
        it('does not fetch record when component mounts', () => {
          const WrappedComponent = resourceful(Dog, { autoFetch: false })(Component)
          mount(<WrappedComponent store={testStore} id={99} />)

          expect(mockInstanceActions.fetch).not.toHaveBeenCalled()
        })

        it('does not fetch record when id prop changes', () => {
          const WrappedComponent = resourceful(Dog, { autoFetch: false })(Component)
          const node = mount(<WrappedComponent store={testStore} id={99} />)

          node.setProps({ id: 100 })

          expect(mockInstanceActions.fetch).not.toHaveBeenCalled()
        })
      })
    })
  })
})

describe('resourcefulList', () => {
  let ListComponent = () => <ul></ul>
  let buildWrappedListComponent = () => resourcefulList(Dog)(ListComponent)
  let getProps = (node) => node.children().first().props()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws error unless resource is defined', () => {
    expect(() => resourcefulList(null)(ListComponent)).toThrow(/No resource provided/)
  })

  describe('wrapped component', () => {
    it('returns wrapped component', () => {
      const WrappedListComponent = buildWrappedListComponent()
      const node = shallow(<WrappedListComponent store={testStore} />)
      expect(node.html()).not.toBe(null)
    })

    it('fetches records when component mounts', () => {
      const WrappedListComponent = buildWrappedListComponent()
      mount(<WrappedListComponent store={testStore} creatorId={99} />)

      expect(mockClassActions.fetchAll)
        .toHaveBeenCalledWith(expect.objectContaining({ creatorId: 99 }))
    })

    it('selects records', () => {
      const WrappedListComponent = buildWrappedListComponent()
      const node = mount(<WrappedListComponent store={testStore} />)
      const props = getProps(node)

      expect(List.isList(props.records)).toEqual(true)
      expect(props.records.count()).toEqual(2)
    })
  })

  describe('options', () => {
    describe('recordsProp', () => {
      it('renames record prop', () => {
        const WrappedListComponent = resourcefulList(Dog, { recordsProp: 'dogs' })(ListComponent)
        const node = mount(<WrappedListComponent store={testStore} />)
        const props = getProps(node)
  
        expect(List.isList(props.dogs)).toEqual(true)
        expect(props.dogs.count()).toEqual(2)
      })
    })

    describe('updateProps', () => {
      it('fetches records when whitelisted prop changes', () => {

        const WrappedComponent = resourcefulList(Dog, {
          updateProps: 'creatorId'
        })(ListComponent)

        const node = mount(<WrappedComponent store={testStore} creatorId={99} />)

        node.setProps({ creatorId: 100 })
        node.setProps({ notTheId: 22 })

        expect(mockClassActions.fetchAll.mock.calls.length).toEqual(2)
        expect(mockClassActions.fetchAll).toHaveBeenCalledWith(expect.objectContaining({ creatorId: 100 }))
      })

      it('fetches records when whitelisted props changes', () => {
        const WrappedComponent = resourcefulList(Dog, {
          updateProps: ['creatorId', 'otherId']
        })(ListComponent)
        const node = mount(<WrappedComponent store={testStore} creatorId={99} otherId={88} />)

        node.setProps({ otherId: 100 })
        node.setProps({ otherId: 109 })
        node.setProps({ notTheId: 22 })

        expect(mockClassActions.fetchAll.mock.calls.length).toEqual(3)
      })
    })
  })
})
