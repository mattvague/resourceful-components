import { Component } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { lifecycle, setDisplayName } from 'recompose'

// TODO figure out why I can't import these seperately!!!
import { pick, isEqual, mapValues } from 'lodash'

import Resource from './Resource'

const resourceful = (Resource, options={}) => (WrappedComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = {
    mergeProps: () => {},
    recordUpdateProps: [],
    autoFetch: true
  }
  const settings = { ...defaults, ...options }

  const mergeProps = settings.mergeProps
  const autoFetch = settings.autoFetch
  const recordUpdateProps = [...settings.recordUpdateProps, 'id']
  const selectRecord = Resource.selectors.select

  const mapStateToProps = (state, { id, record }) => {
    const builtRecord = Resource.build(selectRecord(record ? (record.id || record.cid) : id)(state) || record || { id }),

    return {
      record: builtRecord,
      isFetching: builtRecord._fetching,
      isSaving: builtRecord._saving,
      autoFetch: !!id && autoFetch
    }
  }

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
      if (!this.props.autoFetch) { return }
      this.props.fetch(this.props)
    },

    componentDidUpdate(prevProps) {
      if (!this.props.autoFetch || !this.props.id) { return }

      const { record: prevRecord } = prevProps
      const { record } = this.props

      const stringifyValues = (props) => mapValues(props, v => v && v.toString())

      const prevUpdateProps = stringifyValues(pick(prevRecord, recordUpdateProps))
      const newUpdateProps = stringifyValues(pick(record, recordUpdateProps))

      if (!isEqual(prevUpdateProps, newUpdateProps)) { this.props.fetch(this.props) }
    }
  })

  return compose<any>(
    setDisplayName('resourceful'),
    withRedux,
    withLifecycle,
  )(WrappedComponent)
}

const resourcefulList = (Resource, options) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = { mergeProps: () => {}, updateProps: [] }
  const settings = { ...defaults, ...options }

  const mergeProps = settings.mergeProps
  const updateProps = settings.updateProps

  const mapStateToProps = (state, props) => ({
    records: Resource.selectors.selectAll()(state).map(record => Resource.build(record)),
    isFetching: Resource.selectors.isFetching()(state)
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

  return compose<any>(
    setDisplayName('resourcefulList'),
    withRedux,
    withLifecycle,
  )(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
