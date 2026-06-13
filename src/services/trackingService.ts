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

// ─── HELPERS ───────────────────────────────────────────────
const BLOCKED_IPS = ["58.186.78.250", "1.55.219.74"];

const isBlockedIP = (ip: string): boolean => {
  if (BLOCKED_IPS.includes(ip)) return true;
  return false;
};

const getMyIP = async (): Promise<string> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    return ip;
  } catch {
    return "unknown";
  }
};

// ─── CLIENT ────────────────────────────────────────────────

export const trackPageVisit = async (ip: string, device: string) => {
  if (isBlockedIP(ip)) return;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await addDoc(collection(db, "page_views"), {
      ip,
      device,
      visitedAt: serverTimestamp(),
      dateKey: today.getTime(),
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
};

export const trackProductClick = async (productData: any) => {
  try {
    const ip = await getMyIP();
    if (isBlockedIP(ip)) return; // 👈 filter IP admin

    await addDoc(collection(db, "product_clicks"), {
      productId: productData?.id || "unknown",
      productName: productData?.name || "unknown",
      clickedAt: serverTimestamp(),
      ip, // lưu để debug sau này
    });
  } catch (error) {
    console.error("Error tracking product click:", error);
  }
};

// ─── ADMIN ─────────────────────────────────────────────────

export const getAnalyticsSumary = async () => {
  try {
    const visitsRef = collection(db, "page_views");
    const clicksRef = collection(db, "product_clicks");

    const totalSnapshot = await getCountFromServer(visitsRef);
    const totalViews = totalSnapshot.data().count;

    const mobileQuery = query(visitsRef, where("device", "==", "Mobile"));
    const mobileSnapshot = await getCountFromServer(mobileQuery);
    const mobileViews = mobileSnapshot.data().count;

    const pcQuery = query(visitsRef, where("device", "==", "PC"));
    const pcSnapshot = await getCountFromServer(pcQuery);
    const pcViews = pcSnapshot.data().count;

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

// Lấy lượt xem theo từng ngày trong 7 ngày gần nhất
export const getViewsLast7Days = async () => {
  try {
    const result: { date: string; views: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const q = query(
        collection(db, "page_views"),
        where("visitedAt", ">=", day),
        where("visitedAt", "<", nextDay),
      );
      const snap = await getCountFromServer(q);

      result.push({
        date: day.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        views: snap.data().count,
      });
    }

    return result;
  } catch (error) {
    console.error("Error getting views last 7 days:", error);
    return [];
  }
};

// Lấy top sản phẩm được click nhiều nhất
export const getTopProducts = async (topN = 5) => {
  try {
    const snap = await getDocs(collection(db, "product_clicks"));

    const countMap: Record<string, { name: string; count: number }> = {};
    snap.docs.forEach((doc) => {
      const { productId, productName } = doc.data();
      if (!countMap[productId]) {
        countMap[productId] = { name: productName, count: 0 };
      }
      countMap[productId].count++;
    });

    return Object.entries(countMap)
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  } catch (error) {
    console.error("Error getting top products:", error);
    return [];
  }
};
