// File: src/services/configService.ts
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Tải chế độ khóa hiện tại (Mặc định trả về Option 1 nếu chưa cài)
export async function getActiveLockOption(): Promise<number> {
  try {
    const docRef = doc(db, "settings", "lock_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().activeOption || 1;
    }
  } catch (error) {
    console.error("Lỗi khi lấy cấu hình từ Firestore: ", error);
  }
  return 1; // Fallback mặc định là Option 1
}

// Lưu chế độ khóa (1 hoặc 2) do Admin chọn
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
