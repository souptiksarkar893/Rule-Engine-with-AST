import { GoogleLogin } from 'react-google-login';

const oAuthKey = "928674699165-svjptmeoqq89nrmdlgm8971p5j0po342.apps.googleusercontent.com";

const Login = () => {

  const onSuccess = (res) => {
    console.log("LOGIN SUCCESS! Current user: ", res.profileObj);
    localStorage.setItem("userid", res.profileObj.googleId);
    localStorage.setItem("fullname", res.profileObj.name);
    window.location.href = "http://localhost:3000/#/";
    window.location.reload();
  };

  const onFailure = (res) => {
    alert("Login failed! Try again...");
  };

  return (
    <section className="d-flex flex-column min-vh-100 bg-light">
      {/* Header Section */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
        <div className="container">
          <a className="navbar-brand mb-0 h1" href="/home">
            <h3>Rule Engine</h3>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container d-flex flex-column align-items-center justify-content-center flex-grow-1">
        <div className="row justify-content-center text-center mb-5">
          <div className="col-lg-8">
            <h1 className="display-4 text-dark"><strong>Empower Your Decisions</strong></h1>
            <p className="lead text-muted">
              <strong>Rules bring structure to chaos, transforming complex challenges into clear and actionable insights.</strong>
            </p>
          </div>
        </div>

        {/* Login Card - Larger */}
        <div className="row justify-content-center">
  <div className="col-md-10 col-lg-8"> {/* Broader width */}
    <div className="card shadow-lg p-4">
      <div className="card-body text-center">
        <h2 className="card-title mb-4">Sign In to Access Your Rules</h2>
        <p className="text-muted mb-4">
          Start crafting, managing, and applying your custom rules with ease.
        </p>
        <div id="signInButton">
          <GoogleLogin
            clientId={oAuthKey}
            buttonText="Sign in with Google"
            onSuccess={onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
            className="btn btn-primary btn-lg w-100"
          />
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    </section>
  );
};

export default Login;
