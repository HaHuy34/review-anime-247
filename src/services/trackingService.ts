import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  limit,
  serverTimestamp,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";

// --- DÀNH CHO CẬP NHẬT GIAO DIỆN CLIENT ---

export const trackPageVisit = async (ip: string, device: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt mốc 0h đêm

    await addDoc(collection(db, "page_views"), {
      ip,
      device,
      visitedAt: serverTimestamp(),
      dateKey: today.getTime(), // Để dễ filter sau này nếu cần
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
};

// Hàm mới: Ghi nhận click sản phẩm
export const trackProductClick = async (productData: any) => {
  try {
    await addDoc(collection(db, "product_clicks"), {
      productId: productData?.id || "unknown",
      productName: productData?.name || "unknown",
      clickedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error tracking product click:", error);
  }
};

// --- DÀNH CHO BẢNG ĐIỀU KHIỂN ADMIN ---
export const getAnalyticsSumary = async () => {
  try {
    const visitsRef = collection(db, "page_views");
    const clicksRef = collection(db, "product_clicks");

    // 1. Tổng lượt views
    const totalSnapshot = await getCountFromServer(visitsRef);
    const totalViews = totalSnapshot.data().count;

    // 2. Mobile views
    const mobileQuery = query(visitsRef, where("device", "==", "Mobile"));
    const mobileSnapshot = await getCountFromServer(mobileQuery);
    const mobileViews = mobileSnapshot.data().count;

    // 3. PC views
    const pcQuery = query(visitsRef, where("device", "==", "PC"));
    const pcSnapshot = await getCountFromServer(pcQuery);
    const pcViews = pcSnapshot.data().count;

    // 4. Lấy số lượng Click Sản Phẩm trong ngày (từ 00:00 sáng nay)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayClicksQuery = query(
      clicksRef,
      where("clickedAt", ">=", startOfToday),
    );
    const todayClicksSnapshot = await getCountFromServer(todayClicksQuery);
    const todayClicks = todayClicksSnapshot.data().count;

    return { totalViews, mobileViews, pcViews, todayClicks };
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    return { totalViews: 0, mobileViews: 0, pcViews: 0, todayClicks: 0 };
  }
};

export const getRecentVisits = async () => {
  try {
    const visitsQuery = query(
      collection(db, "page_views"),
      orderBy("visitedAt", "desc"),
      limit(10),
    );
    const querySnapshot = await getDocs(visitsQuery);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ip: data.ip,
        device: data.device,
        visitedAt: data.visitedAt,
      };
    });
  } catch (error) {
    console.error("Error getting recent visits:", error);
    return [];
  }
};
