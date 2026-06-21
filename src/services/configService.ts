// File: src/services/configService.ts
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// 1 = Khóa Xem Phim + Bình Luận (Sản Phẩm vẫn chạy)
// 2 = Mở khóa tất cả
// 3 = Chỉ hiện Sản Phẩm (ẩn Xem Phim + Bình Luận)
export const LOCK_OPTION = {
  LOCKED: 1,
  UNLOCKED: 2,
  SHOP_ONLY: 3,
} as const;

// Tải chế độ khóa hiện tại (Mặc định trả về Option 2 - mở tất cả nếu chưa cài)
export async function getActiveLockOption(): Promise<number> {
  try {
    const docRef = doc(db, "settings", "lock_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().activeOption || LOCK_OPTION.UNLOCKED;
    }
  } catch (error) {
    console.error("Lỗi khi lấy cấu hình từ Firestore: ", error);
  }
  return LOCK_OPTION.UNLOCKED; // Fallback mặc định
}

// Lưu chế độ khóa (1, 2 hoặc 3) do Admin chọn
export async function updateActiveLockOption(
  optionNum: number,
): Promise<boolean> {
  try {
    const docRef = doc(db, "settings", "lock_config");
    await setDoc(docRef, { activeOption: optionNum }, { merge: true });
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu cấu hình lên Firestore: ", error);
    return false;
  }
}

// Lắng nghe real-time chế độ khóa (dùng cho cả trang User và Admin)
export function subscribeLockOption(
  callback: (optionNum: number) => void,
): () => void {
  const docRef = doc(db, "settings", "lock_config");
  return onSnapshot(
    docRef,
    (snap) => {
      const option = snap.exists()
        ? snap.data().activeOption || LOCK_OPTION.UNLOCKED
        : LOCK_OPTION.UNLOCKED;
      callback(option);
    },
    (error) => {
      console.error("Lỗi khi lắng nghe cấu hình Firestore: ", error);
      callback(LOCK_OPTION.UNLOCKED);
    },
  );
}
