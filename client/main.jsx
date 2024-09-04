import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

const LoginPage = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setError('');
        alert('Đăng nhập thành công!');
        onClose();
      }
    });
  };

  const handleGoogleLogin = () => {
    Meteor.loginWithGoogle({}, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setError('');
        alert('Đăng nhập bằng Google thành công!');
        onClose();
      }
    });
  };

  const handleFacebookLogin = () => {
    Meteor.loginWithFacebook({}, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setError('');
        alert('Đăng nhập bằng Facebook thành công!');
        onClose();
      }
    });
  };

  const handleTrustIDLogin = () => {
    window.location.href = '/login-trustid';
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <h1>Đăng nhập</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Đăng nhập</button>
      </form>
      <hr />
      <button onClick={handleGoogleLogin}>Đăng nhập bằng Google</button>
      <button onClick={handleFacebookLogin}>Đăng nhập bằng Facebook</button>
      <button onClick={handleTrustIDLogin}>Đăng nhập bằng TrustID</button>
      <button onClick={onClose}>Đóng</button>
    </div>
  );
};

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>
      <button onClick={toggleLogin}>Đăng nhập</button>
      {showLogin && <LoginPage onClose={toggleLogin} />}
    </div>
  );
};

Meteor.startup(() => {
  render(<App />, document.getElementById('app'));
});
