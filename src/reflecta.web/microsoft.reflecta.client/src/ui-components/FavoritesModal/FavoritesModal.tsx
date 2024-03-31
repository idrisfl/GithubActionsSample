import { useEffect, useState } from 'react';
import styles from './FavoritesModal.module.css';
import { NJList, NJListItem, NJModal, NJSkeletonContainer, NJSkeletonRectangle, NJToastService } from "@engie-group/fluid-design-system-react";
import { getFavoriteReports } from '../../utils/restApiCalls';
import { IReportRequest } from '../../model';
import toastStyles from '../../styles/Toasts.module.css';

export const FavoritesModal: React.FC<{ isOpen: boolean, onRequestSelected: (selection: IReportRequest) => void, onClose:()=>void }> = (props) => {
  const { isOpen, onRequestSelected, onClose } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<IReportRequest[]>();
  useEffect(() => {
    setIsLoading(true);
    getFavoriteReports()
      .then(favReports => {
        setFavorites(favReports.map(f => f.request));
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        console.error(err);
        NJToastService('An error occured while loading favorites', {iconName: 'dangerous', className: toastStyles.ErrorToast});
      });
  }, []);
  return <>
    <NJModal
      isOpen={isOpen}
      key={isOpen ? 'open' : 'closed'}
      icon="bookmarks"
      id="favoritesModal"
      title="Favorites"
      className={styles.modal}
      onClose={onClose}
    >
      <div className={styles.container}>
        {!isLoading ? <NJList className={styles.list}>
          {
            (favorites || []).map((fav, i) => {
              return <NJListItem
                key={i}
                type="button"
                onClick={() => onRequestSelected(fav)}
              >
                {fav.title}
              </NJListItem>;
            })
          }
        </NJList> :
          <NJSkeletonContainer className={styles.skeletonContainer}>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='30px' />
                </NJSkeletonContainer>
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='30px' />
                </NJSkeletonContainer>
            </div>
            <div className={styles.row}>
                <NJSkeletonContainer className={styles.skeletonContainer}>
                    <NJSkeletonRectangle height='30px' />
                </NJSkeletonContainer>
            </div>
          </NJSkeletonContainer>
        }
      </div>
    </NJModal>
  </>;
}