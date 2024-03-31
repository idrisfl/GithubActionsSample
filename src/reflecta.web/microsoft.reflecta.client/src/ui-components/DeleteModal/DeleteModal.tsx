import { NJButton, NJModal, NJSpinner, NJToastService } from "@engie-group/fluid-design-system-react";
import styles from "./DeleteModal.module.css";
import { useCallback, useState } from "react";
import { deleteReport } from "../../utils/restApiCalls";
export interface IDeleteModalProps {
    onDelete?: (error?: any) => void;
    reportId: string;
    isOpen?: boolean;
    title?: string;
    onClose: () => void;
}

export const DeleteModal: React.FC<IDeleteModalProps> = ({ onDelete, isOpen, reportId, title, onClose }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDeleteReport = useCallback(async () => {
        try {
            setIsDeleting(true);
            await deleteReport(reportId);
            if (onDelete) {
                onDelete();
            }
        } catch (error) {
            if (onDelete) {
                onDelete(error);
            }
            NJToastService(`An error occurred while deleting the report`, { iconName: "dangerous" });
            console.error(error);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    }, [deleteReport, reportId]);
    return (
        <div className={styles.container}>
            <NJModal
                footer={
                    !isDeleting ?
                        <>
                            <NJButton emphasis="subtle" label="Cancel" onClick={() => onClose()} />
                            <NJButton label="Ok" onClick={handleDeleteReport} />
                        </> :
                        <></>
                }
                icon="delete"
                id="deleteModal"
                onClose={() => onClose()}
                title={isDeleting? 'Deleting report...' : 'Delete report'}
                isOpen={isOpen || false}
                key={`${reportId}-${isDeleting}`}
            >
                {!isDeleting ?
                    <>
                        {title ? `Are you sure you want to delete the report '${title}'? This action cannot be undone.` : 'Are you sure you want to delete the selected report ? This action cannot be undone.'}
                    </> :
                    <>
                        <div className={styles.loadingContainer} >
                            <NJSpinner />
                        </div>
                    </>
                }
            </NJModal>
        </div>
    );
};