import { Link } from "react-router-dom";
import { IconHome } from "../icons.jsx";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link to="/usuarios" className="text-gray-400 hover:text-bomberos transition-colors">
        <IconHome />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-gray-300">/</span>
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-bomberos transition-colors text-gray-500"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-bomberos font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
