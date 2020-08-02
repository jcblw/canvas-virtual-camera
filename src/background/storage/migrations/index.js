import { version1Migration } from './1'

const migrations = { 1: version1Migration }

const logger = label => message => console.log(`${label}: ${message}`)
const log = logger('Migration')

export const migrate = (prevVersion, currentVersion, db) => {
  const needMigration = prevVersion && prevVersion < currentVersion
  const initialMigration = !prevVersion
  log('Starting migration script')
  log(
    `Checking migration from version ${prevVersion} to ${currentVersion}`
  )

  if (initialMigration) {
    log('Migration initial data')
    return migrations[1](db, log)
  }
  if (needMigration) {
    log('Migration needed')
    return Promise.resolve()
    // setup migrations to next version.
    // const migationList = Array.from(migrations)
  }
  log('No migration needed or found')
  return Promise.resolve(true)
}
