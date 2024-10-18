import './App.css';

const Header = () => {

  const logout = () => {
    window.localStorage.clear();
    window.location.href = "http://localhost:3000/#/"; 
    window.location.reload(); 
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">
          <h2 className="text-dark">Rule Engine</h2>
        </span>
  
        <div className="ms-auto d-flex align-items-center">
  <div className="me-3">
    <i className="fa fa-user me-2"></i>
    Welcome, {localStorage.getItem("fullname")}!
  </div>
  <div>
    <button className="btn btn-outline-dark fw-bold rounded-pill" onClick={logout}>
      <span className="text-danger">Logout</span> 
      <i className="fa fa-sign-out-alt ms-2"></i>
    </button>
  </div>
</div>

      </div>
    </nav>
  );
  
  
}

export default Header;
