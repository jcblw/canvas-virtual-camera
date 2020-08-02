const React = require('react')

const ReactModal = props => {
  if (props.isOpen) {
    return React.createElement('div', props)
  }
  return null
}
ReactModal.setAppElement = () => {}

module.exports = ReactModal
