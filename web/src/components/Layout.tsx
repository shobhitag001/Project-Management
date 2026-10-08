import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui";

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <CheckSquare size={22} />
          </span>
          <span>ProjectFlow</span>
        </div>
        <nav>
          <NavLink to="/" end>
            <LayoutDashboard size={19} /> Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={19} /> Projects
          </NavLink>
          <NavLink to="/tasks">
            <CheckSquare size={19} /> Tasks
          </NavLink>
        </nav>
        <div className="user-card">
          <div className="avatar">{user?.fullName.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.fullName}</strong>
            <small>{user?.email}</small>
          </div>
          <Button
            variant="ghost"
            aria-label="Log out"
            title="Log out"
            onClick={() => void logout()}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
