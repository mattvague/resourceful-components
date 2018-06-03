import Resource from './Resource'

import { Component } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { lifecycle } from 'recompose'

const resourceful = (Resource: object, dispatchProps = {}) => (WrappedComponent: any) => {
  if (!Resource) { throw new Error('No resource provided') }

  const selectRecord = (state: object, { id: string, record: object }) =>
    Resource.selectors.select(record ? record.id : id)(state)

  const buildRecord = ({ id: string, record: object }) =>
    record || Resource.build({ id })

  const mapStateToProps = (state: object, props: object) => ({
    record: selectRecord(state, props) || buildRecord(props)
  })

  const mapDispatchToProps = (dispatch: any, props: object) => ({
    ...bindActionCreators(buildRecord(props).actions, dispatch),
    ...bindActionCreators(dispatchProps, dispatch)
  })

  const withRedux = connect(
    mapStateToProps,
    mapDispatchToProps
  )

  const withLifecycle = lifecycle({
    componentWillMount() {
      this.props.fetch(this.props)
    },

    componentDidUpdate({ record: prevRecord, id: prevId }) {
      const { record, id } = this.props

      if (!record.equals(prevRecord)) { record.actions.fetch() }
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedComponent)
}

const resourcefulList = (Resource, dispatchProps = {}) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const mapStateToProps = (state, props) => ({
    records: Resource.selectors.selectAll()(state)
  })

  const mapDispatchToProps = (dispatch, props) => ({
    ...bindActionCreators(Resource.actions, dispatch)
  })

  const withRedux = connect(
    mapStateToProps,
    mapDispatchToProps
  )

  const withLifecycle = lifecycle({
    componentWillMount() {
      this.props.fetchAll(this.props)
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
