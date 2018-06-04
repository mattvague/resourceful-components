import * as React from "react"
import { Map, List, fromJS } from 'immutable'
import { resourceful, resourcefulList } from '../'
import Resource from '../Resource'

import { shallow, mount, render } from 'enzyme'

const mockSelectors = {
  selectAll: () => (state) => state.get('dogs').toList(),
  select: (id) => (state) => state.get('dogs').get(id)
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
  actions = mockInstanceActions
}

const store =  {
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  getState: jest.fn().mockReturnValue(fromJS({
    dogs: new Map([[99, Dog.build({
      id: 99,
      name: 'Laika',
      breed: 'Husky'
    })]])
  }))
}

const createStore = () => store
const testStore = createStore()

describe('resourceful', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  let Component = ({ record }) => <div></div>
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

    describe('when id prop passed but not record prop', () => {
      let Component = ({ record }) => <div>{ record.name }</div>

      it('selects record based on id', () => {
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} id={99} />)
        const props = getProps(node)

        expect(props).toEqual(expect.objectContaining({
          id: 99,
          record: expect.objectContaining({
            id: 99,
            name: 'Laika',
            breed: 'Husky'
          })
        }))
      })

      it('is passed record actions props', () => {
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
      })

      describe('when other props changes', () => {
        it('does not fetch record', () => {
          const WrappedComponent = buildWrappedComponent()
          const node = mount(<WrappedComponent store={testStore} id={99} />)

          node.setProps({ notId: 1234 })

          expect(mockInstanceActions.fetch.mock.calls.length).toEqual(1)
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
    })

    describe('when record prop passed but not id prop', () => {
      it('selects from record based on record id', () => {
        const record = Dog.build({ id: 99, name: 'Laika', breed: 'Part husky, part samoyed' })
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} record={record} />)
        const props = getProps(node)

        expect(props).toEqual(expect.objectContaining({
          record: expect.objectContaining({
            id: 99,
            name: 'Laika',
            breed: 'Husky'
          })
        }))
      })

      it('is passed record actions props', () => {
        const record = Dog.build({ id: 101, name: 'Laika', breed: 'Husky' })
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} record={record} />)
        const props = getProps(node)

        expect(Object.keys(props)).toEqual(expect.arrayContaining([
          'fetch', 'create', 'update', 'save', 'destroy', 'pet'
        ]))
      })

      it('fetches built record when component mounts', () => {
        const record = Dog.build({ id: 101, name: 'Laika', breed: 'Husky' })
        const WrappedComponent = buildWrappedComponent()
        mount(<WrappedComponent store={testStore} record={record} />)

        expect(mockInstanceActions.fetch).toHaveBeenCalled()
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'TEST' })
      })

      xit('fetches built record when record prop changes', () => {
        const record = Dog.build({ id: 101, name: 'Laika', breed: 'Husky' })
        const WrappedComponent = buildWrappedComponent()
        const node = mount(<WrappedComponent store={testStore} record={record} />)

        node.setProps({ resource: Dog.build({ id: 102, name: 'Buck', breed: 'St-Bernard' }) })

        expect(mockInstanceActions.fetch.mock.calls.length).toEqual(2)
      })

      describe('when select returns no record', () => {
        it('passes record to component', () => {
          const record = Dog.build({ id: 103, name: 'Laika', breed: 'Husky' })
          const WrappedComponent = buildWrappedComponent()
          const node = mount(<WrappedComponent store={testStore} record={record} />)
          const props = getProps(node)

          expect(props).toEqual(expect.objectContaining({
            record: expect.objectContaining({
              id: 103,
              name: 'Laika',
              breed: 'Husky'
            })
          }))
        })
      })
    })

    xdescribe('when record and id prop present', () => {})

    xit('passes isLoading from record to component', () => {})
    xit('passes isSaving from record to component', () => {})

    xit('maps resource actions to props', () => {})
  })

  describe('options', () => {
    describe('mergeProps', () => {
      it('allows passing mergeProps', () => {
        const ReduxFormWrappedComponent = ({ onSubmit }) => <Component handleSubmit={onSubmit}/>
        const WrappedComponent = resourceful(Dog, (dispatchProps, { save }, ownProps) => ({
          onSubmit: save
        }))(ReduxFormWrappedComponent)
        const node = mount(<WrappedComponent store={testStore} id={99} />)
        const props = node.children().first().find('Component').props()

        props.handleSubmit()

        expect(mockInstanceActions.save).toHaveBeenCalled()
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'TEST' })
      })
    })

    xdescribe('idAttr', () => {
      xit('allows customizing idAttr', () => {})
    })
  })
})

describe('resourcefulList', () => {
  let ListComponent = ({ record }) => <ul></ul>
  let buildWrappedListComponent = () => resourcefulList(Dog)(ListComponent)
  let getProps = (node) => node.children().first().props()

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
      mount(<WrappedListComponent store={testStore} ownerId={99} />)

      expect(mockClassActions.fetchAll)
        .toHaveBeenCalledWith(expect.objectContaining({ ownerId: 99 }))
    })

    it('selects records', () => {
      const WrappedListComponent = buildWrappedListComponent()
      const node = mount(<WrappedListComponent store={testStore} />)
      const props = getProps(node)

      expect(List.isList(props.records)).toEqual(true)

      expect(props.records.last()).toEqual(expect.objectContaining({
        id: 99,
        name: 'Laika',
        breed: 'Husky'
      }))
    })

    xit('fetches records when specified props change', () => {})
    xit('passes isLoading from resource to component', () => {})
    xit('passes isSaving from resource to component', () => {})
  })

  xdescribe('options', () => {
    xdescribe('mergeProps', () => {
      xit('allows merging props', () => {})
    })
  })
})
