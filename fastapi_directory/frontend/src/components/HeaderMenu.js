import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography, Box, Button, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

function HeaderMenu({ userRole, onLoginClick, isAdmin, isSuperAdmin }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const hasAdminAccess = isAdmin || isSuperAdmin;
  const hasSuperAdminAccess = isSuperAdmin;

  return (
    <AppBar position="static" sx={{ backgroundColor: "#2a2f4a", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
      <Toolbar sx={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: "#f2a365",
            textDecoration: "none",
            letterSpacing: 1,
            "&:hover": { color: "#d18c4a" },
          }}
        >
          Список ошибок
        </Typography>
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen} aria-label="menu" sx={{ color: "#f2a365" }}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { backgroundColor: "#2a2f4a" } }}
            >
              {(!hasAdminAccess && !userRole) && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onLoginClick();
                  }}
                  sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}
                >
                  Авторизация
                </MenuItem>
              )}
              {isSuperAdmin && (
                <>
                  <MenuItem component={Link} to="/users" onClick={handleMenuClose} sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}>
                    Пользователи
                  </MenuItem>
                  {isSuperAdmin && (
                    <MenuItem component={Link} to="/admin/logs" onClick={handleMenuClose} sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}>
                      Логи
                    </MenuItem>
                  )}
                  
                  <MenuItem component={Link} to="/admin/contactinfo" onClick={handleMenuClose} sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}>
                    Контакты
                  </MenuItem>
                    <MenuItem component={Link} to="/admin/orphaned-images" onClick={handleMenuClose} sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}>
                      Изображения
                    </MenuItem>
                </>
              )}
                  <MenuItem component={Link} to="/admin/errors" onClick={handleMenuClose} sx={{ color: "#f2a365", "&:hover": { backgroundColor: "#34495e" } }}>
                    Ошибки
                  </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 3 }}>
            {(!hasAdminAccess && !userRole) && (
              <Button color="inherit" onClick={onLoginClick} sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365" }}>
                Авторизация
              </Button>
            )}
            {hasAdminAccess && (
              <>
              {isSuperAdmin && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/users"
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365", "&:hover": { color: "#d18c4a" } }}
                >
                  Пользователи
                </Button>
              )}
                {isSuperAdmin && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/logs"
                    sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365", "&:hover": { color: "#d18c4a" } }}
                  >
                    Логи
                  </Button>
                )}
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin/errors"
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365", "&:hover": { color: "#d18c4a" } }}
                >
                  Ошибки
                </Button>
                {isSuperAdmin && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin/contactinfo"
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365", "&:hover": { color: "#d18c4a" } }}
                >
                  Контакты
                </Button>
                )}
                {isSuperAdmin && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/orphaned-images"
                    sx={{ fontWeight: "bold", fontSize: "1rem", color: "#f2a365", "&:hover": { color: "#d18c4a" } }}
                  >
                    Изображения
                  </Button>
                )}
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default HeaderMenu;
