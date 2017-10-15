var React = require('react')

export class Marker extends React.Component {
  render() {

    return (
      <div>
        <div>{this.props.title}</div>
        <div>{this.props.value}</div>
      </div>
    );
  }
}
