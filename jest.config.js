const base = require('../../config/jest.base.js')

module.exports = {
  ...base,
  coverageThreshold: {
    global: {
      statments: 75,
      branches: 55,
      functions: 70,
      lines: 75,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    ...base.transform,
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
}
