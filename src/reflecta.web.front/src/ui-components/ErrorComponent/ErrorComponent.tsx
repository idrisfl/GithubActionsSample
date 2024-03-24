import { isRouteErrorResponse, useAsyncError, useRouteError } from "react-router-dom";
import styles from './ErrorComponent.module.css';
export const ErrorComponent: React.FC<{}> = () => {
    const routeError = useRouteError();
    const asyncError = useAsyncError();
    const error = routeError || asyncError;
    console.error(error);
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        return <div className={styles.errorMessage}>This page doesn't exist!</div>;
      }
  
      if (error.status === 401) {
        return <div className={styles.errorMessage}>You aren't authorized to see this</div>;
      }
  
      if (error.status === 503) {
        return <div className={styles.errorMessage}>Looks like our API is down</div>;
      }
    }
  
    return <div className={styles.errorMessage}>Sorry, something went wrong</div>;
}