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

export class SnakeList extends React.Component {
  render() {
    let sorted_snakes = this.props.snakes.sort((a, b) => ((10000 * b.score + 100 * b.life) - (10000 * a.score + 100 * a.life)))
    return (
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Score</th>
            <th>Life</th>
          </tr>
        </thead>
        <tbody>
        {
          sorted_snakes.map(function(snake, index) {

            if(index < 15){
              return(
              <Snake snake={snake} key={index} />)
            }
          })
        }
        </tbody>
      </table>
    );
  }
}
