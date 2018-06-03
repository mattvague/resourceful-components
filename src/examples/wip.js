//
// Resource
//

//class Dog extends Resourceful.Resource({
  //name: undefined,
  //breed: undefined,
  //age: undefined
//}, 'Dog') {

  //// Class methods

  //static actions = {
    //fetchAll({ ownerId }) { ... }
  //}

  //static selectors = {
    //// Standard selectors
    //selectAll() { ... } // Returns immutable list of Dog records
    //select() { ... }    // Returns immutable Dog record

    //// Custom selector
    //selectGoodboys() { ... }
  //}

  //// Instance methods

  //get someCalculatedDisplayAttr() {
    //returns this.name + '-' + this.breed
  //}

  //actions = {
    //// Standard CRUD instance actions
    //fetch() { ... }    // Fetches resource based on current resource id
    //create() { ... }   // Posts new resource based on current resource attrs
    //update() { ... }   // Patches resource based on current resource attrs
    //save() { ... }     // Creates resource if no id, updates otherwise
    //destroy() { ... }  // Deletes resource based on current resource id

    //// Custom actions
    //pet() { ... }      // Pets resource based on current resource id
  //}
//}

////
//// Simple list
////

//// Resource selectAll selector passes records to component automagically
//const ResourcefulSimpleList = resourceful.list(Dog)(({ records }) =>
  //<ul>
    //records.map(res => <li>{ res.name }</li>)
  //</ul>
//)

////
//// Simple mutable list
////

//// Resource selectAll selector passes records to component automagically
//const ResourcefulSimpleList = resourceful.list(Dog)(mutable(({ records }) =>
  //<ul>
    //records.map(res => <li>{ res.name }</li>)
  //</ul>
//)))

////
//// List with resourecful items
////

//const ResourcefulListItem = resourceful(Dog)(({ record }) =>
  //<li>
    //<strong>{ record.name }</strong>
    //{ record.age} - { record.breed }
  //</li>
//)

//// Passing a mutable resource to a resourceful component works
//// fine if records prop wasn't fucked with (can automatically infer type)
//const ResourcefulHardcoreList = resourceful.list(Dog)(mutable(({ records }) =>
  //<ul>
    //records.map(record => <ResourefulListItem record={record} />)
  //</ul>
//))

////
//// Manual fetch list
////

//class ManualFetchList extends Component {
  //handleRefresh = () => {
    //this.props.fetchRecords()
  //}

  //render() {
    //return(
      //<div>
        //<button onClick={this.handleRefresh}>Refresh</button>
        //<ul>
          //{ this.props.records.map(record => <li>{ record.name }</li>) }
        //</ul>
      //</div>
    //)
  //}
//}
//const ResourcefulManualFetchList = resourceful.list(Dog)(ManualFetchList)

////
//// Detail
////

//// Componets can either use record.isLoading or isLoading
//const ResourcefulDetail = resourceful(Dog)(({ record, isLoading }) =>
  //<article>
    //{ isLoading ?
      //<span>Loading...</span> :
      //<Fragment>
        //<header>{ record.name }</header>
        //<dl>
          //<dt>Age</dt><dd>{ record.age }</dd>
          //<dt>Breed</dt><dd>{ record.breed }</dd>
        //</dl>
      //</Fragment>
    //}
  //</article>
//)

////
//// Simple Form
////

//// Forms do not need to, nor should, know about resources or records
//// but are passed isLoading and isSaving from record
//const SimpleForm = ({ handleSubmit, isLoading, isSaving }) =>
  //{ isLoading ?
    //<span>Loading...</span> :
    //<form onSubmit={handleSubmit}>
      //<Field name='record.age' component="input" type="text" />
      //<Field name='record.breed' component="input" type="text" />
      //<button type='submit' disabled={isSaving}>Submit</submit>
    //</form>
  //}

//// Easy to integrate with redux form, etc but also totally library-agnostic
//const ResourcefulSimpleForm = resourceful(Dog, (resource) => {
  //handleSubmit: resource.save
//})(SimpleForm)

////
//// List with editable records
////

//const ResourcefulEditableList = resourceful.list(Dog)(({ records }) =>
  //<ul>
    //records.map(record => <SimpleForm record={record} />)
  //</ul>
//)

//// Usage

//<SomeWrapper>
  //// Show record right away and fetch record
  //<ResourcefulDetail record={myDogRecord} />

  //// Show loading first and fetch record
  //<ResourcefulDetail id={id} />

  //// Props are passed to fetchAll for filtering, etc
  //<ResourcefulSimpleList ownerId={2} />

  //// Show form populated with existing dog
  //<ResourcefulSimpleForm record={myDogRecord} />

  //// Show loading, fetch dog and then populate form
  //<ResourcefulSimpleForm id={id} />

  //// Show empty form for new dog but automatically passed new dog record
  //<ResourcefulSimpleForm />

  //<ResourcefulEditableList />
//</SomeWrapper>
