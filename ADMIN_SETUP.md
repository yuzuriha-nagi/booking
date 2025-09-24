# 管理者アカウント設定手順

## 初期管理者の設定（システム内で完結）

権限システムには安全な管理者作成機能が組み込まれています。データベースを直接操作する必要はありません。

### 手順

1. **Googleアカウントでサイトにログイン**
   - http://localhost:3001 にアクセス
   - Googleアカウントでログイン（このアカウントを管理者にします）

2. **管理者セットアップを実行**
   - ホームページに「初期セットアップが必要です」という警告が表示される
   - 「管理者セットアップを開始」ボタンをクリック
   - セットアップキー：`festival-admin-2024`を入力
   - 「管理者を作成」ボタンをクリック

3. **管理者権限の確認**
   - ページがリロードされ、管理者権限が付与される
   - ヘッダーに「申請管理」リンクが表示される
   - セットアップ画面は二度と表示されない

### 管理者ができること

- **申請管理**: `/admin/applications`
  - 来場者からの主催者申請を審査
  - 申請を承認・却下
  - 承認されたユーザーは自動的に主催者権限を取得

## セキュリティ機能

### セットアップキーの変更
本番環境では`.env.local`のセットアップキーを変更してください：
```
NEXT_PUBLIC_ADMIN_SETUP_KEY=your-secure-key-here
```

### セットアップの制限
- システムに管理者が存在する場合、セットアップ画面は表示されません
- セットアップキーが間違っている場合、管理者作成は失敗します
- セットアップは初回のみ実行可能です

### セキュリティルール

本番環境では以下のFirestoreセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー情報の読み取りは認証されたユーザーのみ
    match /users/{userId} {
      allow read, write: if request.auth != null;
      // 管理者以外はroleフィールドの変更不可
      allow update: if request.auth != null
        && resource.data.role == request.resource.data.role;
    }

    // 申請の読み取りは管理者のみ
    match /roleApplications/{applicationId} {
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // その他のコレクション
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 注意事項

- 初期管理者は手動で設定する必要があります
- 管理者権限は慎重に付与してください
- 本番環境では適切なセキュリティルールを設定してください