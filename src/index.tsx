import Resource from './Resource'

import { Component } from 'react'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { lifecycle } from 'recompose'

const resourceful = (Resource, mergeProps = () => {}) => (WrappedComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const selectRecord = (state, { id, record }) =>
    Resource.selectors.select(record ? record.id : id)(state)

  const buildRecord = ({ id, record }) =>
    record || Resource.build({ id })

  const mapStateToProps = (state, props) => ({
    record: selectRecord(state, props) || buildRecord(props)
  })

  const mapDispatchToProps = (dispatch: any, props: object) =>
    bindActionCreators(buildRecord(props).actions, dispatch)

  const withRedux = connect(
    mapStateToProps,
    mapDispatchToProps,
    (stateProps, dispatchProps, ownProps) => ({
      ...ownProps, ...dispatchProps, ...stateProps,
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

const resourcefulList = (Resource, mergeProps) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const mapStateToProps = (state, props) => ({
    records: Resource.selectors.selectAll()(state)
  })

  const mapDispatchToProps = (dispatch, props) =>
    bindActionCreators(Resource.actions, dispatch)

  const withRedux = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )

  const withLifecycle = lifecycle({
    componentWillMount() {
      this.props.fetchAll(this.props)
    }
  })

  return compose<any>(withRedux, withLifecycle)(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
