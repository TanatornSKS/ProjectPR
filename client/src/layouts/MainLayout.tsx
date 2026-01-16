import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [openPR, setOpenPR] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  return (
    <div className="d-flex min-vh-100 w-100">
      {/* ================= Mobile Hamburger ================= */}
      <button
        className="btn btn-danger position-fixed top-0 start-0 m-2 d-md-none"
        style={{ zIndex: 1200 }}
        onClick={() => setShowOffcanvas(true)}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* ================= Sidebar Desktop ================= */}
      <aside
        className="d-none d-md-flex flex-column bg-danger text-white shadow-lg"
        style={{
          width: collapsed ? 70 : 220,
          transition: "width 0.3s",
        }}
      >
        <SidebarContent
          openPR={openPR}
          setOpenPR={setOpenPR}
          collapsed={collapsed}
        />
      </aside>

      {/* ================= Offcanvas Mobile ================= */}
      {showOffcanvas && (
        <div
          className="position-fixed top-0 start-0 h-100 bg-danger text-white shadow-lg"
          style={{ width: 220, zIndex: 1300 }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h5 className="mb-0">projectPR</h5>
            <button
              className="btn-close btn-close-white"
              onClick={() => setShowOffcanvas(false)}
            />
          </div>

          <SidebarContent
            openPR={openPR}
            setOpenPR={setOpenPR}
            onLinkClick={() => setShowOffcanvas(false)}
          />
        </div>
      )}

      {/* ================= Main ================= */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* -------- Navbar -------- */}
        <nav className="navbar navbar-light bg-light shadow-sm">
          <div className="container-fluid">
            <button
              className="btn btn-outline-danger d-none d-md-inline"
              onClick={() => setCollapsed(!collapsed)}
            >
              <i className="fas fa-bars"></i>
            </button>

            <span className="navbar-brand mb-0 h1 ms-2">
              projectPR
            </span>
          </div>
        </nav>

        {/* -------- Content -------- */}
        <main className="flex-grow-1 p-3 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

/* ================= Sidebar ================= */

interface SidebarContentProps {
  openPR: boolean;
  setOpenPR: (open: boolean) => void;
  collapsed?: boolean;
  onLinkClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  openPR,
  setOpenPR,
  collapsed,
  onLinkClick,
}) => {
  return (
    <div className="d-flex flex-column h-100 p-3">
      {/* Logo */}
      {!collapsed && (
        <Link
          to="/"
          className="fs-4 fw-bold text-white text-decoration-none mb-3"
          onClick={onLinkClick}
        >
          projectPR
        </Link>
      )}

      <ul className="nav nav-pills flex-column mb-auto">
        {/* Home */}
        <li className="nav-item">
          <NavLink to="/" className="nav-link text-white" onClick={onLinkClick}>
            <i className="fas fa-home"></i>
            {!collapsed && <span className="ms-2">หน้าหลัก</span>}
          </NavLink>
        </li>

        {/* PR */}
        <li className="nav-item">
          <div
            className="nav-link text-white d-flex justify-content-between align-items-center"
            role="button"
            onClick={() => !collapsed && setOpenPR(!openPR)}
          >
            <span>
              <i className="fas fa-file-alt"></i>
              {!collapsed && <span className="ms-2">PR</span>}
            </span>

            {!collapsed && (
              <i
                className="fas fa-chevron-right"
                style={{
                  transform: openPR ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "0.3s",
                }}
              />
            )}
          </div>

          {openPR && !collapsed && (
            <ul className="nav flex-column ms-3">
              <li className="nav-item">
                <NavLink
                  to="/ReportPR"
                  className="nav-link text-white"
                  onClick={onLinkClick}
                >
                  <i className="fa-regular fa-file me-2"></i>
                  ReportPR
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/createPR"
                  className="nav-link text-white"
                  onClick={onLinkClick}
                >
                  <i className="fas fa-plus-circle me-2"></i>
                  Create PR
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Setting */}
        <li className="nav-item">
          <NavLink
            to="/setting"
            className="nav-link text-white"
            onClick={onLinkClick}
          >
            <i className="fas fa-cog"></i>
            {!collapsed && <span className="ms-2">ตั้งค่า</span>}
          </NavLink>
        </li>
      </ul>


      <div className="mt-auto">
        <hr className="border-white opacity-25" />
        <button className="btn btn-link text-white text-start p-0 w-100">
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span className="ms-2">ออกจากระบบ</span>}
        </button>

        <p
          className="text-center text-white-50 mt-2 mb-0"
          style={{ fontSize: "0.75rem" }}
        >
          2026 Version : Develop
        </p>
      </div>

    </div>

  );
};

export default Layout;
