import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

//Helper simple

export default function useAuth() {
  return useContext(AuthContext);
}
