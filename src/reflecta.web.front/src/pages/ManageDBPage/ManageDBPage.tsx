
import styles from './ManageDBPage.module.css';
import { Await, Form, useLoaderData, useSubmit } from 'react-router-dom';
import React, { useEffect } from 'react';
import { ErrorComponent } from '../../ui-components/ErrorComponent/ErrorComponent';
import { ManageDBPageSkeleton } from './ManageDBPageSkeleton';
import { IDBStatus } from '../../model';
import { NJButton, NJInlineMessage } from '@engie-group/fluid-design-system-react';
import { getDBStatus } from '../../utils/restApiCalls';
import Markdown from 'react-markdown';
import { useLayoutContext } from '../../LayoutContext';
import moment from 'moment';

export const ManageDBPage: React.FC<{}> = () => {
    const { dbStatus: defaultDbStatus } = useLoaderData() as { dbStatus: IDBStatus };
    const [dbStatus, setDbStatus] = React.useState<IDBStatus>();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const submit = useSubmit();
    useEffect(() => {
        const intervalId = setInterval(async () => { 
            setDbStatus(await getDBStatus());
        }, 60*1000);
        return () => clearInterval(intervalId);
    }, []);
    const {setPageTitle} = useLayoutContext();
    React.useEffect(()=>{
        setPageTitle && setPageTitle('Manage Database');
    },[setPageTitle]);
    return (
        <React.Suspense
            fallback={<ManageDBPageSkeleton />}
        >
            <Await
                resolve={defaultDbStatus}
                errorElement={<ErrorComponent />}
            >
                {
                    (defaultDbStatus: IDBStatus) => {
                        const effectiveStatus = dbStatus || defaultDbStatus;
                        return (
                            <>
                                <div className={styles.container}>
                                    <div className={`${styles.container} ${styles.inner}`}>
                                        <div className={styles.title}>Current Database Information</div>
                                        <div className={styles.row}>
                                            <label>Uploaded</label>
                                            <div>{effectiveStatus.uploadedDate?moment(effectiveStatus.uploadedDate).format('DD MMM YYYY'):''}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <label>By</label>
                                            <div>{effectiveStatus.uploadedBy}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <label>Original file name</label>
                                            <div>{effectiveStatus.originalFileName}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <label>Number of incidents</label>
                                            <div>{effectiveStatus.numberOfIncidents}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <label>Most recent incident</label>
                                            <div className={styles.column}>
                                                <div>{effectiveStatus.mostRecentIncident?.description} (ID: {effectiveStatus.mostRecentIncident?.incidentId})</div>
                                                <div>{effectiveStatus.mostRecentIncident?.date?moment(effectiveStatus.mostRecentIncident?.date).format('DD MMM YYYY'):''}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${styles.row} ${styles.reverse}`}>
                                        <Form method="post" encType="multipart/form-data" action='/incidentsdb'
                                            onChange={(event) => {
                                                submit(event.currentTarget);
                                            }}
                                        >
                                            <input type='file'
                                                ref={fileInputRef}
                                                name='file'
                                                id='file'
                                                style={{ display: 'none' }}
                                            />
                                            <input type='text'
                                                name='userName'
                                                id='userName'
                                                readOnly
                                                value='Authenticated user name'
                                                style={{ display: 'none' }}
                                            />
                                            <NJButton
                                                onClick={() => { fileInputRef.current?.click(); }}
                                                label='Upload a new database file'
                                                className={styles.uploadButton}
                                                type='button'
                                            />
                                        </Form>
                                    </div>
                                    <div className={`${styles.row} ${styles.statusContainer}`}>
                                        {effectiveStatus.status?.status === "in progress" &&
                                            <NJInlineMessage variant='information' >
                                                <span data-child-name="njInlineMessageTitle">
                                                    <Markdown className={styles.markdownContainer}>{effectiveStatus.status?.message}</Markdown>
                                                </span>
                                            </NJInlineMessage>
                                        }
                                        {effectiveStatus.status?.status === "success" &&
                                            <NJInlineMessage variant='success' >
                                                <span data-child-name="njInlineMessageTitle">
                                                    <Markdown className={styles.markdownContainer}>{effectiveStatus.status?.message}</Markdown>
                                                </span>
                                            </NJInlineMessage>
                                        }
                                        {effectiveStatus.status?.status === "error" &&
                                            <NJInlineMessage variant='error' >
                                                <span data-child-name="njInlineMessageTitle">
                                                    <Markdown className={styles.markdownContainer}>{effectiveStatus.status?.message}</Markdown>
                                                </span>
                                            </NJInlineMessage>
                                        }
                                    </div>
                                </div>
                            </>
                        )
                    }
                }
            </Await>
        </React.Suspense>
    )
};