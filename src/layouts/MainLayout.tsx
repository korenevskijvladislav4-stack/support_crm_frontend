// layouts/MainLayout.tsx
import type { FC } from "react"
import Nav from "./Nav"
import { Outlet } from "react-router-dom"

interface MainLayoutProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const MainLayout: FC<MainLayoutProps> = ({ onToggleTheme, isDarkMode }) => {
    return (
        <Nav onToggleTheme={onToggleTheme} isDarkMode={isDarkMode}>
            <Outlet/>
        </Nav>
    )
}

export default MainLayout