import React from 'react'
import PropTypes from 'prop-types'
import * as c from '../constants'

export class Slider extends React.Component {
  constructor(props){
    super(props);
  }

  state = {
    value: this.props.curValue,
    id: "id-" + this.props.name
  }

  handleInputUpdate = (e) => {
    this.setState({value: e.currentTarget.valueAsNumber})
    c[`${this.props.bind}`] = e.currentTarget.valueAsNumber
  }

  render() {
    return(
      <div>
        <label htmlFor={this.state.id}>{this.props.name}</label>
        <input type="range" min={this.props.minValue} max={this.props.maxValue} value={this.state.value} id={this.state.id}
          step="1" onChange={this.handleInputUpdate}/>
        <output htmlFor={this.state.id} id="volume">{this.state.value}</output>
      </div>
    );
  }
}

Slider.propTypes = {
  name: PropTypes.string.isRequired,
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  curValue: PropTypes.number.isRequired,
  bind: PropTypes.string.isRequired
}
