var React = require('react')

class HelloWorld extends React.Component {
  render() {
    return <h1>Hello, </h1>;
  }
}

class Snake extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.snake.id}</td>
        <td>{this.props.snake.score}</td>
        <td>{this.props.snake.life.toFixed(2)}</td>
      </tr>
    );
  }
}

class SnakeList extends React.Component {
  render() {
    return (
      <table>
        <tr>
          <th>Id</th>
          <th>Score</th>
          <th>Life</th>
        </tr>
        {
          this.props.snakes.map((snake, index) => (
           <Snake snake={snake}/>
        ))}
      </table>
    );
  }
}

module.exports = {
  SnakeList: SnakeList
}
