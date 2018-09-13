# Resourceful Components

Resourceful components makes it easy to integrate your react components with your API without all that "redux boilerplate"

## 🚨 State of the project: Work in Progress

Still very much an experiment. So far, this lib is working pretty well in my own projects but there is still fat to trim and approaches
to re-evaluate. Please feel free to try it out but be warned that I'm not sure it's ready for use in other projects

## Usage

### Define your resource with attributes, actions and selectors

```javascript
export class Dog extends Resource({
  name: undefined,
  breed: undefined,
  age: undefined
}, 'Dog') {
  static actions = {
    fetchAll({ creatorId }) { ... } // Fetch all resources
  }

  static selectors = {
    selectAll: () => (state) => { ... } // Return list of records
    select: (id) => (state) => { ... }  // Return single record
  }

  actions = {
    fetch() { ... }    // Fetch record based on current record id
    create() { ... }   // Post new record based on current record attrs
    update() { ... }   // Update record based on current record attrs
    save() { ... }     // Create record if no id, updates otherwise
    destroy() { ... }  // Delet record based on current record id
  }
}
```

### Implement simple resource component

```javascript
const DogItem = ({ record }) =>
  <article>
    <header>{ record.name }</header>
    <dl>
      <dt>Age</dt><dd>{ recordage }</dd>
      <dt>Breed</dt><dd>{ record.breed }</dd>
    </dl>
  </article>

export default resourceful(Dog)(DogComponent)

```

3. Render your component and watch dog appear
```javascript
<SomeWrapper>
  <DogComponent id={99} />
</SomeWrapper>

export default resourceful(Dog)(DogComponent)

```

### Implement simple resource list component

1. Define your resource as above
2. Wrap your components with the `resourcefulList` HOC and pass resource

```javascript
const DogListComponent = ({ records }) =>
  <ul>
    { records.map(record =>
      <li>{ record.name }</li>
    )}
  </ul>

export default resourcefulList(DogList)(DogComponent)

```

3. Render your component and watch dogs appear
```javascript
<SomeWrapper>
  <DogListComponent creatorId={99} />
</SomeWrapper>

```

### Implement simple resource form component

Wrap your components with the `resourceful` HOC, pass resource, and map
values to integrate with redux form (or whatever other lib)

```javascript
const DogFormComponent = ({ handleSubmit }) =>
  <form onSubmit={handleSubmit}>
    <Field name='record.age' component="input" type="text" />
    <Field name='record.breed' component="input" type="text" />
    <button type='submit' disabled={isSaving}>Submit</submit>
  </form>

const withReduxForm = reduxForm({ form: 'dog', enableReinitialize: true })

export default = withResourceful(Dog, {
  mergeProps: ({ record }, dispatchProps, ownProps) => ({
    initialValues: record,
    onSubmit: () => dispatchProps.dispatch(record.actions.save())
  })
})

export default compose(withReduxForm, withResourceful)(DogFormComponent)

```

Render your component. It will now auto-fetch on initialization, and save when submitted

```javascript
<SomeWrapper>
  <DogFormComponent id={99} />
</SomeWrapper>

```
