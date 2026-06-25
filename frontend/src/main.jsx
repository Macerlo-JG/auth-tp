//Importa StricMode que sirve para revisar errores en React
import { StrictMode } from "react";

//Conecta React con la pagina Web
import { createRoot } from "react-dom/client";

//Sirve para cambiar de pagina sin recargar todo el sitio 
import { BrowserRouter } from "react-router-dom";

//Traemos los estilos CSS
import "./index.css";

//Traemos la parte principal
import App from "./App.jsx";

//buscamos la parte de la pagina web donde esta root y ahi vemos toda la app
// es como capas sobre la app(donde va todo) va la capa de Browser Router 
//  que permite navegar por distintas partes sin recargar las paginas y
//Strict Mode sirve revisar errores en React

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);