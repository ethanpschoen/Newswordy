import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Home as HomeIcon,
  Person as UserIcon,
  EmojiEvents as TrophyIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, loginWithRedirect } = useAuth0()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
    setMobileOpen(false)
  }

  const handleLogin = () => {
    loginWithRedirect()
    setMobileOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    ...(isAuthenticated
      ? [
          { name: 'Profile', href: '/profile', icon: UserIcon },
          { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
        ]
      : []),
  ]

  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Newswordy
        </Typography>
        <IconButton color="inherit" aria-label="close drawer" edge="end" onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigation.map(item => (
          <ListItem
            key={item.name}
            component={Link}
            to={item.href}
            onClick={handleDrawerToggle}
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Welcome, <strong>{user?.nickname || user?.email}</strong>
            </Typography>
            <Button variant="outlined" color="error" fullWidth onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button variant="contained" fullWidth onClick={handleLogin}>
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  )

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'white',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
              }}
            >
              <Typography variant="h6" color="primary" fontWeight="bold">
                N
              </Typography>
            </Box>
            Newswordy
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigation.map(item => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.href}
                  color="inherit"
                  startIcon={<item.icon />}
                  sx={{ textDecoration: 'none' }}
                >
                  {item.name}
                </Button>
              ))}

              {isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    Welcome, <strong>{user?.nickname || user?.email}</strong>
                  </Typography>
                  <Button variant="outlined" color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" color="secondary" onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar
