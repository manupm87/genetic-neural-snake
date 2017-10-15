var React = require('react')

export class Marker extends React.Component {
  render() {

    return (
      <div className="marker-container">
        <div className="marker-title">{this.props.title}</div>
        <div className="marker-value">{this.props.value}</div>
      </div>
    );
  }
}
