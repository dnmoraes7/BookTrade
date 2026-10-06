import { Link } from "react-router-dom";
import "./NotFound.css";
function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Esta página se perdeu entre as estantes.</h1>
      <p>Vamos levar você de volta para encontrar uma nova história.</p>
      <Link className="button button--primary" to="/">
        Voltar ao início
      </Link>
    </main>
  );
}
export default NotFound;
