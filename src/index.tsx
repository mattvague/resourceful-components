import Resource from './Resource'

import { Component } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { lifecycle } from 'recompose'

const resourceful = (Resource, mergeProps = () => {}) => (WrappedComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const selectRecord = Resource.selectors.select

  const mapStateToProps = (state, { id }) => ({
    record: Resource.build(selectRecord(id)(state) || { id })
  })

  const withRedux = connect(
    mapStateToProps,
    null,
    (stateProps, dispatchProps, ownProps) => ({
      ...ownProps, ...dispatchProps, ...stateProps,
      ...bindActionCreators(stateProps.record.actions, dispatchProps.dispatch),
      ...mergeProps(stateProps, dispatchProps, ownProps)
    })
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

const resourcefulList = (Resource, mergeProps = () => {}) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const mapStateToProps = (state, props) => ({
    records: Resource.selectors.selectAll()(state).map(record => Resource.build(record))
  })

  const withRedux = connect(
    mapStateToProps,
    null,
    (stateProps, dispatchProps, ownProps) => ({
      ...ownProps, ...dispatchProps, ...stateProps,
      ...bindActionCreators(Resource.actions, dispatchProps.dispatch),
      ...mergeProps(stateProps, dispatchProps, ownProps)
    })
  )

  const withLifecycle = lifecycle({
    componentWillMount() {
      this.props.fetchAll(this.props)
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
