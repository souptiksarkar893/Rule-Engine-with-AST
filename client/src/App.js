import { useEffect } from 'react';
import Portal from './portal';
import Login from './login';
import { gapi } from 'gapi-script';

const clientId = "928674699165-svjptmeoqq89nrmdlgm8971p5j0po342.apps.googleusercontent.com";

function App() {
  useEffect(() =>{
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: ""
      })
    };

    gapi.load('client:auth2', start);
  });
  
  let userid = localStorage.getItem("fullname");
  if(userid == null)
   return (<Login/>)
  else
  return (<Portal/>)
}

export default App;
