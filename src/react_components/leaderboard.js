var React = require('react')

class Snake extends React.Component {
  render() {
    let className = this.props.index % 2 == 0 ? "even-row" : "odd-row"
    if (!this.props.snake.isAlive){
      className += " dead"
    }
    return (
      <tr className={className}>
        <td>{this.props.snake.generation}</td>
        <td>{this.props.snake.id}</td>
        <td>{this.props.snake.score}</td>
        <td>{this.props.snake.life.toFixed(2)}</td>
      </tr>
    );
  }
}

export class SnakeList extends React.Component {
  render() {
    // let cur_snakes = [for (s of this.props.snakes) if (s.type === this.props.snakesType) s]
    let cur_snakes = this.props.snakes.filter(s => s.type === this.props.snakesType)
    cur_snakes.sort((a, b) => ((100000000 * b.score + 1000000 * b.life - b.id) - (100000000 * a.score + 1000000 * a.life -a.id)))
    // let sorted_snakes = this.props.snakes.sort((a, b) => ((100000000 * b.score + 1000000 * b.life - b.id) - (100000000 * a.score + 1000000 * a.life -a.id)))
    return (
      <div className="snake-list-container">
        <div className="snake-list-name">
          {this.props.listName}
        </div>
        <div className="snake-list">
          <table>
            <thead>
              <tr>
                <th>Gen</th>
                <th>Id</th>
                <th>Score</th>
                <th>Life</th>
              </tr>
            </thead>
            <tbody>
            {
              cur_snakes.map((snake, index) => {
                if(snake.type == this.props.snakesType){
                  //if(index < 15){
                    return(
                    <Snake snake={snake} key={index} index={index}/>)
                  //}
                }
              })
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
