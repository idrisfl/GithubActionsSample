
import { NJSkeletonRectangle } from '@engie-group/fluid-design-system-react';
import styles from './ManageDBPage.module.css';

export function ManageDBPageSkeleton() {

    return (
        <>
            <div className={styles.container}>
                <div className={`${styles.container} ${styles.inner}`}>
                    <div className={styles.title}>Current Database Information</div>
                    <div className={styles.row}>
                        <label>Uploaded</label>
                        <div>
                            <NJSkeletonRectangle height='20px' />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <label>By</label>
                        <div>
                            <NJSkeletonRectangle height='20px' />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <label>Original file name</label>
                        <div>
                            <NJSkeletonRectangle height='20px' />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <label>Number of incidents</label>
                        <div>
                            <NJSkeletonRectangle height='20px' />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <label>Most recent incident</label>
                        <div className={styles.column}>
                            <div>
                                <NJSkeletonRectangle height='20px' />
                            </div>
                            <div>
                                <NJSkeletonRectangle height='20px' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.row} ${styles.reverse}`}>
                    <NJSkeletonRectangle height='42px' width='200px' />
                </div>
            </div>
        </>
    )
}
