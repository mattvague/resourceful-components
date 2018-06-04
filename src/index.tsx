import { Component } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { lifecycle } from 'recompose'

// TODO figure out why I can't import these seperately!!!
import { pick, isEqual } from 'lodash'

import Resource from './Resource'

const resourceful = (Resource, options) => (WrappedComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = { mergeProps: () => {} }
  const settings = { ...defaults, ...options }

  const mergeProps = settings.mergeProps
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

    componentDidUpdate(prevProps) {
      const { record: prevRecord } = prevProps
      const { record } = this.props

      if (!record.equals(prevRecord)) { this.props.fetch(this.props) }
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedComponent)
}

const resourcefulList = (Resource, options) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = { mergeProps: () => {} }
  const settings = { ...defaults, ...options }

  const mergeProps = settings.mergeProps
  const updateProps = settings.updateProps

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
    },

    componentDidUpdate(prevProps) {
      const prevUpdateProps = pick(prevProps, updateProps)
      const newUpdateProps = pick(this.props, updateProps)

      if (!isEqual(prevUpdateProps, newUpdateProps)) { this.props.fetchAll(this.props) }
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
