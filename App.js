import React, { Component } from 'react';
import FileUpload from './FileUpload';
import Visualization from './Visualization';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweets: [],
    };
  }

  setData = (data) => {
    this.setState({ tweets: data });
  };

  render() {
    return (
      <div>
        <FileUpload setData={this.setData} />
        {this.state.tweets.length > 0 && <Visualization tweets={this.state.tweets} />}
      </div>
    );
  }
}

export default App;
