import { Component } from 'react'
import { compose, bindActionCreators, AnyAction } from 'redux'
import { connect } from 'react-redux'
import { lifecycle, setDisplayName, stateProps } from 'recompose'

// TODO figure out why I can't import these seperately!!!
import { pick, isEqual, mapValues } from 'lodash'

import Resource from './Resource'

// TODO do these properly
type StateProps = any
type DispatchProps = any
type OwnProps = any

const resourceful = (Resource, options={}) => (WrappedComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = { recordUpdateProps: [], autoFetch: true, recordProp: 'record' }
  const settings = { ...defaults, ...options }

  const autoFetch = settings.autoFetch
  const recordUpdateProps = [...settings.recordUpdateProps, 'id']
  const selectRecord = Resource.selectors.select

  return compose<any>(
    setDisplayName('resourceful'),
    connect(
      (state, { id }) => ({
        [settings.recordProp]: id ? Resource.build(selectRecord(id)(state)).merge({ id }) : Resource.build({ id }),
        autoFetch: !!id && autoFetch
      }),
      null,
      (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
        ...ownProps, ...dispatchProps, ...stateProps,
        ...bindActionCreators(stateProps[settings.recordProp].actions, dispatchProps.dispatch),
      })
    ),
    lifecycle<any, any, any>({
      componentWillMount() {
        if (!this.props.autoFetch) { return }
        this.props.fetch(this.props)
      },
  
      componentDidUpdate(prevProps) {
        if (!this.props.autoFetch || !this.props.id) { return }
  
        const { [settings.recordProp]: prevRecord } = prevProps
        const { [settings.recordProp]: record } = this.props
  
        const stringifyValues = (props) => mapValues(props, v => v && v.toString())
  
        const prevUpdateProps = stringifyValues(pick(prevRecord, recordUpdateProps))
        const newUpdateProps = stringifyValues(pick(record, recordUpdateProps))
  
        if (!isEqual(prevUpdateProps, newUpdateProps)) { this.props.fetch(this.props) }
      }
    }),
  )(WrappedComponent)
}

const resourcefulList = (Resource, options = {}) => (WrappedListComponent) => {
  if (!Resource) { throw new Error('No resource provided') }

  const defaults = { updateProps: [], recordsProp: 'records' }
  const settings = { ...defaults, ...options }
  const updateProps = settings.updateProps

  return compose<any>(
    setDisplayName('resourcefulList'),
    connect(
      (state, props) => ({
        [settings.recordsProp]: Resource.selectors.selectAll()(state, props).map(record => Resource.build(record))
      }),
      null,
      (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
        ...ownProps, ...dispatchProps, ...stateProps,
        ...bindActionCreators(Resource.actions, dispatchProps.dispatch)
      })
    ),
    lifecycle<any, any, any>({
      componentWillMount() {
        this.props.fetchAll(this.props)
      },
  
      componentDidUpdate(prevProps) {
        const prevUpdateProps = pick(prevProps, updateProps)
        const newUpdateProps = pick(this.props, updateProps)
  
        if (!isEqual(prevUpdateProps, newUpdateProps)) { this.props.fetchAll(this.props) }
      }
    }),
  )(WrappedListComponent)
}

export { resourceful, resourcefulList, Resource }
