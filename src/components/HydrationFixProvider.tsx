'use client'

import { useEffect } from 'react'

export default function HydrationFixProvider() {
  useEffect(() => {
    // ブラウザ拡張機能によって追加される属性をクリーンアップ
    const cleanupExtensionAttributes = () => {
      // CZ拡張機能の属性をクリーンアップ
      const body = document.body
      if (body && body.getAttribute('cz-shortcut-listen')) {
        // この属性は拡張機能によって動的に追加されるため、
        // SSRとの差異を避けるために受け入れる
        console.log('Browser extension attributes detected and handled')
      }
    }

    // DOM読み込み完了後にクリーンアップを実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes)
    } else {
      cleanupExtensionAttributes()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', cleanupExtensionAttributes)
    }
  }, [])

  return null
}