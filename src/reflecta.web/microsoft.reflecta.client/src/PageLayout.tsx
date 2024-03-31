import { NJSidebarContent } from "@engie-group/fluid-design-system-react";
import NavBar from "./ui-components/NavBar/NavBar";
import styles from "./PageLayout.module.css";
import { Outlet, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import { LayoutContextProvider } from "./LayoutContext";
import { TopBar } from "./ui-components/TopBar/TopBar";

type Props = {
  pageTitles?: { [path: string]: string };
  nonSecuredPaths?: string[];
};

// // const SecurityWrapper: React.FC<{
// //   children: React.ReactElement[] | React.ReactElement;
// //   nonSecuredPaths?: string[];
// // }> = ({ children, nonSecuredPaths }) => {
// //   // const { authState, oktaAuth } = useOktaAuth();
// //   const location = useLocation();
// //   // const isAuthenticated = authState?.isAuthenticated;
// //   // const isNonSecuredPath =
// //   //   (nonSecuredPaths || []).findIndex((path) =>
// //   //     location.pathname.startsWith(path)
// //   //   ) > -1;

// //   // if (authState && !isAuthenticated && !isNonSecuredPath) {
// //   //   oktaAuth.setOriginalUri(window.location.pathname);
// //   //   oktaAuth.signInWithRedirect();
// //   // }

// //   return (
// //     <>
// //       {/* {nonSecuredPaths &&
// //       nonSecuredPaths.findIndex((path) => location.pathname.startsWith(path)) >
// //         -1 ? ( */}
// //         children
// //       {/* // ) : (
// //       //   <div className={styles.login}>
// //       //     <div className={styles.loginTitle}>Please Login</div>
// //       //     <div className={styles.loginSubtitle}>
// //       //       You must be logged in to access this page.
// //       //     </div>
// //       //   </div>
// //       // )} */}
// //     </>
// //   );
// // };

export const PageLayout: React.FC<Props> = () => {
  // const navigate = useNavigate();
  const location = useLocation();
  const [isNavFolded, setIsNavFolded] = React.useState(false);

  //const navigateRef = useRef(navigate);

  useEffect(() => {
    setIsNavFolded(false);
  }, [location]);

  return (
    <>
      <LayoutContextProvider value={{ setIsNavFolded, isNavFolded }}>
        <div className={styles.layoutContainer}>
          <TopBar />
          <div className={styles.layoutContent}>
            <NavBar
              isFolded={isNavFolded}
              onToggleIsFolded={() => setIsNavFolded(!isNavFolded)}
            />
            <NJSidebarContent>
              {/* You may keep other components or content here */}
              <Outlet />
            </NJSidebarContent>
          </div>
        </div>
      </LayoutContextProvider>
    </>
  );
};
