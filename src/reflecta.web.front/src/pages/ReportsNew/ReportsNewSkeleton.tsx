
import { NJSkeletonCircle, NJSkeletonContainer, NJSkeletonRectangle } from '@engie-group/fluid-design-system-react';
import styles from './ReportsNew.module.css';

export function ReportsNewSkeleton() {
    return (
        <NJSkeletonContainer className={`${styles.form} ${styles.skeletonContainer}`}>
            <div className={styles.row}>
                <div className={styles.splitRow}>
                    <div className={styles.row}>
                        <NJSkeletonContainer className={styles.skeletonContainer}>
                            <NJSkeletonRectangle height='40px' />
                        </NJSkeletonContainer>
                        <NJSkeletonContainer className={`${styles.circle} ${styles.skeletonContainer}`}>
                            <NJSkeletonCircle width='48px' height='48px' />
                        </NJSkeletonContainer>
                    </div>
                    <NJSkeletonRectangle width='180px' height='42px' />
                </div>
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='40px' />
                </NJSkeletonContainer>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='40px' />
                </NJSkeletonContainer>
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='40px' />
                </NJSkeletonContainer>
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='40px' />
                </NJSkeletonContainer>
            </div>
            <div className={styles.row}>
                <NJSkeletonRectangle width='24px' height='24px' />
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='80px' />
                </NJSkeletonContainer>
            </div>
            <div className={`${styles.row} ${styles.reverse}`}>
                <NJSkeletonRectangle width='180px' height='42px' />
            </div>
        </NJSkeletonContainer>
    );
}
