// 既存イベントの主催者名を現在の表示名に更新するスクリプト
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // ここにFirebaseの設定を追加
  // 実際の運用では環境変数から読み込む
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateHostNames() {
  console.log('既存イベントの主催者名を更新開始...');

  try {
    // 全イベントを取得
    const eventsSnapshot = await getDocs(collection(db, 'classEvents'));
    console.log(`${eventsSnapshot.size}個のイベントが見つかりました`);

    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();
      const hostUserId = eventData.hostUserId;

      if (!hostUserId) {
        console.log(`イベント ${eventDoc.id} にhostUserIdがありません`);
        continue;
      }

      // ユーザー情報を取得
      const userDocRef = doc(db, 'users', hostUserId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentDisplayName = userData.displayName || '名無し';

        // 主催者名が異なる場合は更新
        if (eventData.hostUserName !== currentDisplayName) {
          await updateDoc(eventDoc.ref, {
            hostUserName: currentDisplayName,
            hostUserEmail: userData.email || eventData.hostUserEmail || '',
            updatedAt: new Date()
          });

          console.log(`イベント ${eventDoc.id} の主催者名を "${eventData.hostUserName}" から "${currentDisplayName}" に更新しました`);
        } else {
          console.log(`イベント ${eventDoc.id} の主催者名は既に最新です: ${currentDisplayName}`);
        }
      } else {
        console.log(`ユーザー ${hostUserId} が見つかりません`);
      }
    }

    console.log('主催者名の更新が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプト実行
updateHostNames();