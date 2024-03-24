import { useLayoutContext } from '../../LayoutContext';
import styles from './TopBar.module.css';
import microsoftLogo from '../../assets/mslogo.svg';

export const TopBar = () => {
    const { pageTitle } = useLayoutContext();
    return <div className={styles.layoutTitle}>
        <div className={styles.printOnly}>
            <img src={microsoftLogo} />
            <div>REFLECTA</div>
        </div>
        <div>{pageTitle || ''}</div>
    </div>;
}