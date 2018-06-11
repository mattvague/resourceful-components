import { Record } from 'immutable'
import { v4 as uuid} from 'uuid'

const DEFAULT_ATTRS = {
  id: undefined,
  cid: uuid(),
  _saving: false,
  _fetching: false,
  _deleted: false,
}

// Need to typescript this bitch

const Resource = (attrs: object, description: string) => {
  return class extends Record({ ...DEFAULT_ATTRS, ...attrs }, description) {
    static build (attrs: any) { return new this(attrs) }

    //get<T extends keyof IFruitParams>(value: T): IFruitParams[T] {
      //// super.get() is mapped to the original get() function on Record
      //return super.get(value) 
    //}

    get identifier() { return this.persisted ? this.id : this.cid }
    get persisted() { return !!this.id; }

    identifierEquals(otherRecord) {
      return this.identifier.toString() === otherRecord.identifier.toString()
    }
  }
}

export default Resource
