import styles from './LoadingComponent.module.css';
import { NJModal, NJSpinner } from "@engie-group/fluid-design-system-react";
export const LoadingComponent: React.FC<{ message?: string; }> = (props) => {
  const { message } = props;
  const isOpen = !!message;
  return <>
    <NJModal
      isOpen={isOpen}
      key={isOpen ? 'open' : 'closed'}
      icon="hourglass_top"
      id="loadingModal"
      title={message}
      className={styles.modal}
    >
      <div className={styles.spinnerContainer}>
        <NJSpinner isLoading />
      </div>
    </NJModal>
  </>;
}