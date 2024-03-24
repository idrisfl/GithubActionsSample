
import { NJSkeletonRectangle, NJTab, NJTabs } from '@engie-group/fluid-design-system-react';
import styles from './ReportPage.module.css';
import disclaimer from '../../../public/disclaimer.json';

export function ReportSkeleton() {

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={`${styles.row} ${styles.disclaimer}`}>
                    {disclaimer.value}
                </div>
                <div className={`${styles.row} ${styles.headerWrapper}`}>
                    <span className={styles.header}>Question</span>
                </div>
                <div className={`${styles.row} ${styles.contentWrapper}`}>
                    <NJSkeletonRectangle height='26px' />
                    <NJSkeletonRectangle height='26px' width='150px' />
                </div>
                <div className={`${styles.row} ${styles.headerWrapper}`}>
                    <span className={styles.header}>Filters</span>
                </div>
                <div className={`${styles.row} ${styles.contentWrapper}`}>
                    <div className={styles.filterTable}>
                        <div className={styles.filterRow}>
                            <div className={styles.filterCell}>
                                <NJSkeletonRectangle height='26px' />
                            </div>
                            <div className={styles.filterCell}>
                                <NJSkeletonRectangle height='26px' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.row} ${styles.headerWrapper} ${styles.printOnly}`}>
                    <span className={styles.header}>AI-Generated Response</span>
                </div>
                <NJTabs
                    activeTab="responsePanel"
                    label=""
                >
                    <NJTab
                        ariaControls="panel1"
                        id="responsePanel"
                        label="AI-Generated Response"
                    >
                        <div className={styles.tabContent}>
                            <div className={`${styles.row} ${styles.contentWrapper}`}>
                                <NJSkeletonRectangle height='26px' />
                            </div>
                        </div>
                    </NJTab>
                    <NJTab
                        ariaControls="panel2"
                        id="tab-separator"
                        label=""
                        isDisabled
                    >
                    </NJTab>
                    <NJTab
                        ariaControls="panel3"
                        id="incidentPanel"
                        label="Related Incidents"
                    >
                        <NJSkeletonRectangle height='26px' />
                    </NJTab>
                    <NJTab
                        ariaControls="panel4"
                        id="techPanel"
                        label="Technical Details"
                    >
                        <div className={styles.techTabContent}>
                            <div className={styles.row}>
                                <label htmlFor="cost" className={styles.label}>Cost:</label>
                                <div className={styles.col}>
                                    <span><NJSkeletonRectangle height='26px' /></span>
                                </div>
                            </div>
                            <div className={styles.row}>
                                <label htmlFor="cost" className={styles.label}>Run time:</label>
                                <div className={styles.col}>
                                    <span><NJSkeletonRectangle height='26px' /></span>
                                </div>
                            </div>
                            <label>Criteria:</label>
                            <div className={styles.contentWrapper}>
                                <NJSkeletonRectangle height='26px' />
                            </div>
                            <label >oxDotMap:</label>
                            <div className={styles.contentWrapper}>
                                <NJSkeletonRectangle height='26px' />
                            </div>
                        </div>
                    </NJTab>
                </NJTabs>
            </div>
        </div>
    );
}
