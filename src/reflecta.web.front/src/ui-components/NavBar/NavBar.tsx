import React from "react";
import {
  ISidebarProps,
  NJSidebar,
  NJSidebarBrand,
  NJSidebarDivider,
  NJSidebarItem,
  NJSidebarMenu,
} from "@engie-group/fluid-design-system-react";
import { AppTitle } from "../AppTitle/AppTitle";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NavBar.module.css";
import logo from "../../assets/mslogo.svg";
import SignInSignOutButton from "../SignInSignOutButton";

export interface INavBarProps {
  navItems?: {
    title: string;
    icon: string;
    path: string;
    isActive?: boolean;
  }[];
  onToggleIsFolded: () => void;
}

const NavBar: React.FC<ISidebarProps & INavBarProps> = ({
  isFolded,
  onToggleIsFolded,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NJSidebar className={styles.sideBar} isFolded={isFolded}>
      <NJSidebarBrand title="REFLECTA" imageSrc={logo} />
      {!isFolded ? <AppTitle /> : <></>}
      <NJSidebarMenu className={styles.navMenu} isFolded={isFolded}>
        <>
          <NJSidebarItem
            isFolded={isFolded}
            icon={{ name: "folder" }}
            isActive={
              location.pathname === "/reports" || location.pathname === "/"
            }
            onClickItem={() => navigate("/reports")}
          >
            Reports
          </NJSidebarItem>
          <NJSidebarItem
            isFolded={isFolded}
            icon={{ name: "note_add" }}
            isActive={location.pathname === "/report"}
            onClickItem={() => navigate("/report")}
            listItemId="add-report"
          >
            New Report
          </NJSidebarItem>
          <NJSidebarItem
            isFolded={isFolded}
            icon={{ name: "storage" }}
            isActive={location.pathname === "/incidentsdb"}
            onClickItem={() => navigate("/incidentsdb")}
          >
            Update Database
          </NJSidebarItem>
        </>
      </NJSidebarMenu>
      <NJSidebarMenu isFolded={isFolded} isFooterNav className={styles.navMenu}>
        <>        
                    <>
                        <NJSidebarDivider />
                        <SignInSignOutButton isCompact={isFolded} />
                    </> 
          <NJSidebarDivider className={styles.toggleFoldedSeparator} />
          <NJSidebarItem
            isFolded={isFolded}
            icon={{
              name: !isFolded ? "chevron_left" : "chevron_right",
            }}
            onClickItem={onToggleIsFolded}
          >
            {""}
          </NJSidebarItem>
        </>
      </NJSidebarMenu>
    </NJSidebar>
  );
};

export default NavBar;
