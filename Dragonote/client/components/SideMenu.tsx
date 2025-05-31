import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonToast
} from '@ionic/react';

interface SideMenuProps {
  contentId: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ contentId }) => {
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const selectMenu = (message: string, closeMenu: boolean = false) => {
    setToastMessage(message);
    setShowToast(true);
    if (closeMenu) {
      // 關閉選單的邏輯
    }
  };

  return (
    <>
      <IonMenu contentId={contentId} id="sideMenu">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Side Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem onClick={() => selectMenu('Toast 1')}>
              Show Toast 1
            </IonItem>
            <IonItem onClick={() => selectMenu('Toast 2')}>
              Show Toast 2
            </IonItem>
            <IonItem onClick={() => selectMenu('Toast and Close Menu', true)}>
              Show Toast and Close Menu
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </>
  );
};

export default SideMenu; 