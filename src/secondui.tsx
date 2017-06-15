import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(
  <div>Electron version: {process.versions.electron}</div>,
  document.getElementsByTagName('body')[0])
