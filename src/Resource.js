import { Record } from 'immutable'
import uuidv4 from 'uuid/v4'

const DEFAULT_ATTRS = {
  id: undefined,
  cid: uuidv4(),
  _saving: false,
  _fetching: false,
  _deleted: false,
}

// Need to typescript this bitch

const Resource = (attrs, description) => {
  return class extend extends Record({ ...DEFAULT_ATTRS, ...attrs }, description) {
    static build (attrs) { return new this(attrs) }

    get idOrCid() { return this.persisted ? this.id : this.cid }
    get persisted() { return !!this.id; }
  }
}

export default Resource
