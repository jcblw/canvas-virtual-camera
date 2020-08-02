import { Functional } from '@mujo/utils'

const { from } = Functional

export class Storage {
  constructor({ version, storageInterface = {} }) {
    const { getters, setters } = storageInterface

    this.getters = getters
    this.setters = setters
    this.version = version
  }

  // NOTE: old past typing can be removed since we do not have to
  // worry about serialization
  async get(key) {
    return this.getters.object(key)
  }

  async set(key, value) {
    return this.setters.object(key, value)
  }
}

Storage.from = from(Storage)
