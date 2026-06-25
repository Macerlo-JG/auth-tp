import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ListadoUsuarios from "./pages/ListadoUsuarios"
import VerUsuario from "./pages/VerUsuario"
import NuevoUsuario from "./pages/NuevoUsuario"
import EditarUsuarioPage from "./pages/EditarUsuarioPage"
import './App.css'

function App() {

  return (
      <Routes>
        <Route path="/" element={<ListadoUsuarios/>}/>
        <Route path="/editar" element={<EditarUsuarioPage/>}/>
        <Route path="/nuevousuario" element={<ListadoUsuarios/>}/>
        <Route path="/verusuario" element={<ListadoUsuarios/>}/>
      </Routes>
  )
}

export default App
