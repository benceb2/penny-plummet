export interface NavItem {
  to: string
  icon: string
  labelKey: string
}

// Shared between AppHud's inline desktop nav and AppTabBar's mobile tabs so
// the primary routes stay in one place.
export const navItems: NavItem[] = [
  { to: '/', icon: 'bi-house-door-fill', labelKey: 'appShell.nav.lobby' },
  { to: '/blackjack', icon: 'bi-suit-spade-fill', labelKey: 'appShell.nav.blackjack' },
  { to: '/roulette', icon: 'bi-dice-5-fill', labelKey: 'appShell.nav.roulette' },
  { to: '/clicker', icon: 'bi-lightning-charge-fill', labelKey: 'appShell.nav.earn' },
  { to: '/profile', icon: 'bi-person-fill', labelKey: 'appShell.nav.profile' },
]
