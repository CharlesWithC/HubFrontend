import { useLocation } from 'react-router-dom';

function Auth() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  return (
    <p>You token is {token}</p>
  );
}

export default Auth;