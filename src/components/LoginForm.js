import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';

import { VERIFY_USER } from '../constants/Events';

import {
  setLoginError,
  setIsConnected
} from '../actions/RootActions';

import { createUser } from '../Factory';

import LoginError from '../constants/LoginError';

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.verify = this.verify.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { socket } = this.props;
    socket.emit(VERIFY_USER, this.textInput.value, ({ isValid, kind }) => {
      this.verify({ isValid, kind });
      if (isValid) {
        const name = this.textInput.value;
        const { setUser, setIsConnected } = this.props;
        setUser(createUser({ name }));
        // If an user is created, then go to the chat page
        setIsConnected(true);
      }
    });
  }

  verify({ isValid, kind }) {
    const { setLoginError } = this.props;
    if (isValid) {
      setLoginError('');
    } else {
      switch (kind) {
        case LoginError.EMPTY:
          setLoginError(LoginError.EMPTY_INFO);
          break;
        case LoginError.EXISTED:
          setLoginError(LoginError.EXISTED_INFO);
          break;
        default:
          setLoginError(kind);
      }
    }
  }

  handleChange(e) {
    e.preventDefault();
    const { socket } = this.props;
    socket.emit(VERIFY_USER, this.textInput.value, this.verify);
  };

  renderLoginError(loginError) {
    if (loginError) {
      return <div className="alert alert-danger">{loginError}</div>;
    }
  }

  render() {
    // const { nickname, error } = this.state;
    const { loginError, isConnected, user } = this.props;

    if (isConnected) {
      return <Redirect to={`/${user.name}`} />
    }
    return (
      <form onSubmit={this.handleSubmit} className="container">
        <h2><label htmlFor="nickname">Got a nickname?</label></h2>
        <div className="input-group">
          <input
            className="form-control"
            ref={input => this.textInput = input}
            id="nickname"
            // value={nickname}
            onChange={this.handleChange}
            placeholder="My cool username"
          />
          <span className="input-group-btn">
            <button className="btn btn-default">Go!</button>
          </span>
        </div>
        {this.renderLoginError(loginError)}
      </form>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  isConnected: state.isConnected,
  loginError: state.loginError
});
const mapDispatchToProps = dispatch => bindActionCreators({
  setLoginError,
  setIsConnected
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
