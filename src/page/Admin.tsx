import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  EyeClosed,
  LayoutDashboard,
  Monitor,
  Search,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  addEpisode,
  getEpisodesByAnime,
  deleteEpisode,
  updateEpisode,
} from "@/src/services/animeService";
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  Product,
} from "@/src/services/productService";
import { initialAnimeData } from "@/src/data";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Film,
  Package,
  ExternalLink,
  ArrowLeft,
  BarChart,
  Eye,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/config";
import { Link, useNavigate } from "react-router-dom";
import {
  getAnalyticsSumary,
  getRecentVisits,
} from "../services/trackingService";
import {
  getActiveLockOption,
  updateActiveLockOption,
} from "../services/configService";

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1200;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(ease * (end - start) + start));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{displayValue}</>;
};

export default function Admin() {
  const navigate = useNavigate();
  const [currentLockOption, setCurrentLockOption] = useState<number>(1);
  const [todayStats, setTodayStats] = useState({ visits: 0, clicks: 0 });
  const [ipTab, setIpTab] = useState<"visit" | "click">("visit");
  const [isOptionLoading, setIsOptionLoading] = useState(false);
  const [chart7Days, setChart7Days] = useState<
    { date: string; visits: number; clicks: number }[]
  >([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    mobileViews: 0,
    pcViews: 0,
    todayClicks: 0,
  });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [ipLists, setIpLists] = useState<{
    visitIpsWithDevice: { ip: string; device: string }[];
    clickIps: string[];
  }>({
    visitIpsWithDevice: [],
    clickIps: [],
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setIsAuthChecking(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "episodes" | "products"
  >("overview");
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [selectedSeries, setSelectedSeries] = useState(initialAnimeData[1].id);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [episodeNum, setEpisodeNum] = useState("");
  const [episodeName, setEpisodeName] = useState("");
  const [link, setLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productLink, setProductLink] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [totalAllEpisodes, setTotalAllEpisodes] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const triggerToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchOption = async () => {
      const opt = await getActiveLockOption();
      setCurrentLockOption(opt);
    };
    fetchOption();
  }, [activeTab]);

  const handleSaveLockOption = async (optionNum: number) => {
    setIsOptionLoading(true);
    const success = await updateActiveLockOption(optionNum);
    if (success) {
      setCurrentLockOption(optionNum);
      triggerToast(`Đã đổi sang Option ${optionNum}!`, "success");
    } else {
      triggerToast("Có lỗi xảy ra khi lưu trên Firebase!", "error");
    }
    setIsOptionLoading(false);
  };

  useEffect(() => {
    if (isAuthChecking) return;
    if (activeTab === "episodes") {
      loadEpisodes(selectedSeries);
    } else if (activeTab === "products") {
      loadProducts();
    } else if (activeTab === "overview") {
      loadProducts();
      loadTotalEpisodes();
    }
  }, [selectedSeries, activeTab, isAuthChecking]);

  useEffect(() => {
    if (isAuthChecking) return;

    if (activeTab === "overview") {
      const fetchTotal = async () => {
        try {
          loadProducts();

          const promises = initialAnimeData.map((anime) =>
            getEpisodesByAnime(anime.id),
          );
          const results = await Promise.all(promises);
          const total = results.reduce((acc, curr) => acc + curr.length, 0);
          setTotalAllEpisodes(total);

          const stats = await getAnalyticsSumary();
          setAnalytics(stats);

          const recent = await getRecentVisits();
          setRecentVisits(recent);

          // ✅ Fix: dùng full URL production khi chạy local
          try {
            const baseUrl = import.meta.env.DEV
              ? "https://reviews-anime-247.vercel.app"
              : "";
            const statsRes = await fetch(
              `${baseUrl}/api/stats?password=${import.meta.env.VITE_ADMIN_PASSWORD}`,
            );
            const statsData = await statsRes.json();

            if (statsData.ok) {
              setTodayStats({
                visits: statsData.visits,
                clicks: statsData.clicks,
              });
              setIpLists({
                visitIpsWithDevice: statsData.visitIpsWithDevice || [],
                clickIps: statsData.clickIps || [],
              });
              setChart7Days(statsData.chart7Days || []);
            }
          } catch (err) {
            console.error("Lỗi fetch stats:", err);
          }
        } catch (error) {
          console.error("Error loading total episodes", error);
        }
      };
      fetchTotal();
    } else if (activeTab === "episodes") {
      loadEpisodes(selectedSeries);
    } else {
      loadProducts();
    }
  }, [selectedSeries, activeTab, isAuthChecking]);

  const loadEpisodes = async (animeId: string) => {
    setIsLoading(true);
    try {
      const data = await getEpisodesByAnime(animeId);
      setEpisodes(data);
    } catch (error) {
      console.error("Error loading episodes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTotalEpisodes = async () => {
    setIsLoading(true);
    try {
      let total = 0;
      for (const anime of initialAnimeData) {
        const eps = await getEpisodesByAnime(anime.id);
        total += eps.length;
      }
      setTotalEpisodes(total);
    } catch (error) {
      console.error("Lỗi khi đếm tổng tập phim", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeNum || !episodeName || !link) {
      triggerToast("Vui lòng điền đủ thông tin!", "error");
      return;
    }
    setIsSaving(true);
    try {
      const data = {
        animeId: selectedSeries,
        episode: Number(episodeNum),
        name: episodeName,
        src: link,
      };
      if (editingId) {
        await updateEpisode(editingId, data);
        triggerToast("Đã cập nhật tập phim thành công!", "success");
      } else {
        await addEpisode(data);
        triggerToast("Đã thêm tập phim mới!", "success");
      }
      resetForm();
      loadEpisodes(selectedSeries);
    } catch (error) {
      console.error("Error saving episode", error);
      triggerToast("Có lỗi xảy ra khi lưu!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productImage || !productLink || !productDescription) {
      triggerToast("Vui lòng điền đủ thông tin!", "error");
      return;
    }
    setIsSaving(true);
    try {
      const data: Product = {
        name: productName,
        image: productImage,
        link: productLink,
        description: productDescription,
        updatedAt: new Date().toISOString(),
      };
      if (editingId) {
        await updateProduct(editingId, data);
        triggerToast("Đã cập nhật sản phẩm thành công!", "success");
      } else {
        await addProduct(data);
        triggerToast("Đã thêm sản phẩm mới!", "success");
      }
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Error saving product", error);
      triggerToast("Có lỗi xảy ra khi lưu!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEpisode = (ep: any) => {
    setEditingId(ep.id);
    setEpisodeNum(ep.episode.toString());
    setEpisodeName(ep.name);
    setLink(ep.src);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProduct = (prod: Product) => {
    setEditingId(prod.id as string);
    setProductName(prod.name);
    setProductImage(prod.image);
    setProductLink(prod.link);
    setProductDescription(prod.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEpisode = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message:
        "Bạn có chắc chắn muốn xóa tập phim này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteEpisode(id);
          triggerToast("Đã xóa tập phim!", "success");
          loadEpisodes(selectedSeries);
        } catch {
          triggerToast("Có lỗi xảy ra khi xóa!", "error");
          setIsLoading(false);
        }
      },
    });
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message:
        "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteProduct(id);
          triggerToast("Đã xóa sản phẩm!", "success");
          loadProducts();
        } catch {
          triggerToast("Có lỗi xảy ra khi xóa!", "error");
          setIsLoading(false);
        }
      },
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setEpisodeNum("");
    setEpisodeName("");
    setLink("");
    setProductName("");
    setProductImage("");
    setProductLink("");
    setProductDescription("");
  };

  const convertDailymotionLink = (url: string) => {
    const shortMatch = url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
    if (shortMatch) {
      return `https://www.dailymotion.com/embed/video/${shortMatch[1]}`;
    }
    const normalMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (normalMatch) {
      return `https://www.dailymotion.com/embed/video/${normalMatch[1]}`;
    }
    return url;
  };

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodes;
    return episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.episode.toString().includes(searchQuery),
    );
  }, [episodes, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((prod) =>
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 py-10 px-4 md:px-8 font-sans relative">
      {toast && (
        <div
          className={`fixed top-[10%] right-[10%] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-amber-500 text-slate-900"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : toast.type === "error" ? (
            <X className="w-5 h-5" />
          ) : (
            <Film className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* ✅ Confirm Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Xác nhận xóa</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div
          className={`flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-slate-950 p-6 rounded-2xl shadow-xl border transition-all duration-300 sticky top-0 z-50 ${
            isScrolled
              ? "backdrop-blur-md bg-slate-950/80 shadow-2xl shadow-black/50 border-white/10"
              : "border-white/5"
          }`}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Film className="w-8 h-8 text-amber-500" />
              Bảng Điều Khiển
            </h1>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-500 transition-colors mb-4 mt-[10px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang người dùng
            </Link>
          </div>

          {/* Tab navigation */}
          <div className="relative flex w-full md:w-auto justify-between md:justify-start bg-slate-900 p-1 rounded-lg border border-white/10 mt-2 md:mt-0 mb-[0px] md:mb-0 items-center self-start md:self-auto">
            {/* Sliding background */}
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(33.333%-3px)] rounded-md bg-amber-500 left-1"
              animate={{
                x:
                  activeTab === "overview"
                    ? 0
                    : activeTab === "episodes"
                      ? "calc(100% + 2px)"
                      : "calc(200% + 4px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => {
                setActiveTab("overview");
                resetForm();
                setSearchQuery("");
              }}
              className={`relative flex-1 justify-center z-10 flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors duration-200 ${activeTab === "overview" ? "text-slate-900" : "text-slate-400 hover:text-white"}`}
            >
              <BarChart className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">
                Trang chủ
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("episodes");
                resetForm();
                setSearchQuery("");
              }}
              className={`relative z-10 flex-1 justify-center flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors duration-200 ${activeTab === "episodes" ? "text-slate-900" : "text-slate-400 hover:text-white"}`}
            >
              <Film className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">
                Tập Phim
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                resetForm();
                setSearchQuery("");
              }}
              className={`relative z-10 flex-1 justify-center flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors duration-200 ${activeTab === "products" ? "text-slate-900" : "text-slate-400 hover:text-white"}`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">
                Sản Phẩm
              </span>
            </button>
          </div>
        </div>

        {activeTab === "episodes" && (
          <div className="flex justify-end">
            <div className="w-full md:w-72">
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Chọn Series Phim
              </label>
              <select
                className="w-full bg-slate-900 text-white border-white/10 rounded-lg shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500 transition-colors"
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
              >
                {initialAnimeData.map((anime) => (
                  <option
                    key={anime.id}
                    value={anime.id}
                    className="bg-slate-900"
                  >
                    {anime.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === "overview" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-1 gap-6"
          >
            {/* BIỂU ĐỒ 7 NGÀY */}
            <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 md:col-span-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-amber-500" />
                Lượt Truy Cập 7 Ngày Gần Nhất
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chart7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickFormatter={(v) => v.slice(5)} // Hiện MM-DD
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} width={25} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #ffffff10",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    name="Lượt truy cập"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: "#a855f7" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Lượt click"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
              {/* Thẻ Thống Kê 1 */}
              <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <h3 className="hidden md:block text-slate-400 font-medium mb-2">
                  Tổng số Series Anime
                </h3>
                <p className="text-4xl font-bold text-white">
                  <AnimatedCounter value={initialAnimeData.length} />
                </p>
              </div>

              {/* Thẻ Thống Kê 2 */}
              <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
                  <Film className="w-7 h-7" />
                </div>
                <h3 className="hidden md:block text-slate-400 font-medium mb-2">
                  Số tập (Series đang chọn)
                </h3>
                <p className="text-4xl font-bold text-white">
                  <AnimatedCounter value={totalAllEpisodes} />
                </p>
              </div>

              {/* Thẻ Thống Kê 3 */}
              <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="hidden md:block text-slate-400 font-medium mb-2">
                  Tổng số Sản Phẩm
                </h3>
                <p className="text-4xl font-bold text-white">
                  <AnimatedCounter value={products.length} />
                </p>
              </div>

              {/* Lượt truy cập hôm nay - từ Redis */}
              <div className="hidden bg-slate-950 p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center text-center group hover:border-purple-500/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <EyeClosed className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={todayStats.visits} />
                </h3>
                <p className="text-slate-400 font-medium">
                  Lượt Truy Cập Hôm Nay
                </p>
              </div>

              {/* Thiết bị */}
              <div className="hidden bg-slate-950 p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="flex gap-4 w-full justify-around mt-4">
                  <div className="flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-pink-500 mb-2" />
                    <h4 className="text-2xl font-bold text-white">
                      <AnimatedCounter value={analytics.mobileViews} />
                    </h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                      Mobile
                    </p>
                  </div>
                  <div className="w-px bg-white/10 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <Monitor className="w-8 h-8 text-cyan-500 mb-2" />
                    <h4 className="text-2xl font-bold text-white">
                      <AnimatedCounter value={analytics.pcViews} />
                    </h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                      Desktop
                    </p>
                  </div>
                </div>
                <p className="text-slate-400 font-medium mt-6">
                  Thiết Bị Truy Cập
                </p>
              </div>

              {/* Click mua hàng hôm nay - từ Redis */}
              <div className="hidden bg-slate-950 p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-4xl font-bold text-emerald-400 mb-2">
                  <AnimatedCounter value={todayStats.clicks} />
                </h3>
                <p className="text-slate-400 font-medium">
                  Click Mua Hàng Hôm Nay
                </p>
              </div>
            </div>

            {/* Lịch sử truy cập */}
            <div className="hidden bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 mt-8 md:col-span-full">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-amber-500" />
                Lịch Sử Truy Cập Mới Nhất
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-4 text-slate-400 font-medium text-sm">
                        IP
                      </th>
                      <th className="py-4 px-4 text-slate-400 font-medium text-sm text-center">
                        Thiết bị
                      </th>
                      <th className="py-4 px-4 text-slate-400 font-medium text-sm text-right">
                        Khung giờ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-slate-500 italic"
                        >
                          Chưa có ai vào Web
                        </td>
                      </tr>
                    ) : (
                      recentVisits.map((visit, idx) => (
                        <tr
                          key={visit.id || idx}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4 text-white font-mono text-sm">
                            {visit.ip}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${visit.device === "Mobile" ? "bg-pink-500/10 text-pink-500" : "bg-cyan-500/10 text-cyan-500"}`}
                            >
                              {visit.device}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-slate-400 text-sm">
                            {visit.visitedAt?.toDate
                              ? new Intl.DateTimeFormat("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }).format(visit.visitedAt.toDate())
                              : "Vừa xong..."}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* BẢNG IP CLICK VÀ VISIT HÔM NAY */}
            <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 mt-6 md:col-span-full">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-amber-500" />
                Danh Sách IP Hôm Nay
              </h2>

              {/* Tab switcher - chỉ hiện trên mobile */}
              <div className="md:hidden relative flex bg-slate-900 p-1 rounded-lg border border-white/10 w-full mb-4">
                {/* Sliding background */}
                <motion.div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md ${ipTab === "visit" ? "bg-purple-500" : "bg-emerald-500"}`}
                  animate={{ x: ipTab === "visit" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                  onClick={() => setIpTab("visit")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    ipTab === "visit"
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <EyeClosed className="w-4 h-4" />
                  Vào Web ({ipLists.visitIpsWithDevice.length})
                </button>

                <button
                  onClick={() => setIpTab("click")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    ipTab === "click"
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🛒 Click ({ipLists.clickIps.length})
                </button>
              </div>

              {/* Mobile: hiện theo tab */}
              {/* Mobile: hiện theo tab */}
              <div className="md:hidden space-y-2 max-h-72 overflow-y-auto">
                {ipTab === "visit" ? (
                  ipLists.visitIpsWithDevice.length === 0 ? (
                    <p className="text-slate-500 italic text-sm">
                      Chưa có IP nào
                    </p>
                  ) : (
                    ipLists.visitIpsWithDevice.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-lg border border-white/5"
                      >
                        <span className="text-xs text-slate-500 w-5">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-sm text-white">
                          {item.ip}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${item.device === "Mobile" ? "bg-pink-500/10 text-pink-400" : "bg-cyan-500/10 text-cyan-400"}`}
                        >
                          {item.device === "Mobile" ? "📱" : "🖥️"}
                        </span>
                        {ipLists.clickIps.includes(item.ip) && (
                          <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                            Đã click 🛒
                          </span>
                        )}
                      </div>
                    ))
                  )
                ) : ipLists.clickIps.length === 0 ? (
                  <p className="text-slate-500 italic text-sm">
                    Chưa có IP nào
                  </p>
                ) : (
                  ipLists.clickIps.map((ip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-lg border border-white/5"
                    >
                      <span className="text-xs text-slate-500 w-5">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm text-white">{ip}</span>
                      {ipLists.visitIpsWithDevice.some((v) => v.ip === ip) && (
                        <span className="ml-auto text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                          Đã vào web 👁️
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop: hiện 2 cột */}
              <div className="hidden md:grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <EyeClosed className="w-4 h-4" />
                    IP Vào Web ({ipLists.visitIpsWithDevice.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ipLists.visitIpsWithDevice.length === 0 ? (
                      <p className="text-slate-500 italic text-sm">
                        Chưa có IP nào
                      </p>
                    ) : (
                      ipLists.visitIpsWithDevice.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-lg border border-white/5"
                        >
                          <span className="text-xs text-slate-500 w-5">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-sm text-white">
                            {item.ip}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${item.device === "Mobile" ? "bg-pink-500/10 text-pink-400" : "bg-cyan-500/10 text-cyan-400"}`}
                          >
                            {item.device === "Mobile"
                              ? "📱 Mobile"
                              : "🖥️ Desktop"}
                          </span>
                          {ipLists.clickIps.includes(item.ip) && (
                            <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                              Đã click 🛒
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <span>🛒</span>
                    IP Click Sản Phẩm ({ipLists.clickIps.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ipLists.clickIps.length === 0 ? (
                      <p className="text-slate-500 italic text-sm">
                        Chưa có IP nào
                      </p>
                    ) : (
                      ipLists.clickIps.map((ip, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-lg border border-white/5"
                        >
                          <span className="text-xs text-slate-500 w-5">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-sm text-white">
                            {ip}
                          </span>

                          {ipLists.visitIpsWithDevice.some(
                            (v) => v.ip === ip,
                          ) && (
                            <span className="ml-auto text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                              Đã vào web 👁️
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Khối cấu hình tùy chọn khóa */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 md:col-span-full mb-6">
              <h2 className="text-lg font-bold text-amber-500 mb-2">
                ⚙️ Cấu hình Chế Độ Khóa Shopee (Lock Mode Options)
              </h2>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Tùy chỉnh tính năng hiển thị popup sản phẩm Shopee để ép/giới
                thiệu người dùng click ủng hộ bạn trước khi xem phim.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSaveLockOption(1)}
                  disabled={isOptionLoading}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    currentLockOption === 1
                      ? "border-amber-500 bg-amber-500/[0.04]"
                      : "border-white/5 bg-slate-900 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-3 h-3 rounded-full ${currentLockOption === 1 ? "bg-amber-500 animate-pulse" : "bg-slate-600"}`}
                    />
                    <span className="font-bold text-white text-sm">
                      Option 1: Khóa khi xem tập phim (Mặc định)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Người dùng truy cập xem bình thường. Khi click vào các tập
                    phim mới nhất / premium, họ phải bấm xem sản phẩm Shopee bất
                    kỳ bên dưới, đợi hết 7 giây đếm ngược để mở khóa xem phim.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveLockOption(2)}
                  disabled={isOptionLoading}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    currentLockOption === 2
                      ? "border-amber-500 bg-amber-500/[0.04]"
                      : "border-white/5 bg-slate-900 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-3 h-3 rounded-full ${currentLockOption === 2 ? "bg-amber-500 animate-pulse" : "bg-slate-600"}`}
                    />
                    <span className="font-bold text-white text-sm">
                      Option 2: Khóa toàn trang ngay khi vừa vào trang web
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Chặn toàn bộ màn hình ngay khi vừa mở web. Họ bắt buộc phải
                    bấm xem sản phẩm Shopee, đợi 7 giây đếm ngược để mở khóa
                    trang chủ thì mới có thể thao tác chọn phim.
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 sticky top-8">
                <h2 className="text-xl font-bold mb-6 text-white flex items-center justify-between">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                  {(editingId || episodeNum || episodeName || link) && (
                    <button
                      onClick={resetForm}
                      className="text-sm text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-4 h-4 " /> Hủy
                    </button>
                  )}
                </h2>

                <AnimatePresence mode="wait">
                  {activeTab === "episodes" ? (
                    <motion.form
                      key="form-episodes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSaveEpisode}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Số Tập
                        </label>
                        <input
                          type="number"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="VD: 151"
                          value={episodeNum}
                          onChange={(e) => {
                            setEpisodeNum(e.target.value);
                            if (!editingId)
                              setEpisodeName(`Tập ${e.target.value}`);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Tên Tập
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="VD: Tập 151"
                          value={episodeName}
                          onChange={(e) => setEpisodeName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Link Embed Dailymotion
                        </label>
                        <input
                          type="url"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="https://www.dailymotion.com/embed/video/..."
                          value={link}
                          onChange={(e) =>
                            setLink(convertDailymotionLink(e.target.value))
                          }
                        />
                        {link && link.includes("dailymotion.com") && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-white/10 relative">
                            <div className="absolute top-2 left-2 z-10">
                              <span className="text-xs bg-amber-500 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                                Preview
                              </span>
                            </div>
                            <div className="aspect-video w-full">
                              <iframe
                                src={link}
                                className="w-full h-full"
                                allowFullScreen
                                allow="autoplay"
                                frameBorder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : editingId ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          {isSaving
                            ? "Đang lưu..."
                            : editingId
                              ? "Lưu thay đổi"
                              : "Thêm tập phim"}
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="form-products"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSaveProduct}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Tên Sản Phẩm (Shopee)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="VD: Mô hình Goku Super Saiyan"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Link Ảnh Sản Phẩm
                        </label>
                        <input
                          type="url"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="https://cf.shopee.vn/file/..."
                          value={productImage}
                          onChange={(e) => setProductImage(e.target.value)}
                        />
                        {productImage && (
                          <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                            <img
                              src={productImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Mô tả Sản Phẩm
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="VD: Mô hình cực nét..."
                          value={productDescription}
                          onChange={(e) =>
                            setProductDescription(e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Link Shopee
                        </label>
                        <input
                          type="url"
                          className="w-full bg-slate-900 text-white border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                          placeholder="https://shopee.vn/..."
                          value={productLink}
                          onChange={(e) => setProductLink(e.target.value)}
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : editingId ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          {isSaving
                            ? "Đang lưu..."
                            : editingId
                              ? "Lưu thay đổi"
                              : "Thêm sản phẩm"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
              <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 h-[calc(100vh-370px)] flex flex-col sticky top-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
                  <h2 className="text-xl font-bold text-white">
                    {activeTab === "episodes"
                      ? "Danh sách tập phim"
                      : "Danh sách sản phẩm"}
                  </h2>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full bg-slate-900 text-sm text-white border-white/10 py-2 pl-9 pr-4 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="text-sm px-3 py-2 bg-white/10 text-slate-300 rounded-lg font-medium border border-white/5 whitespace-nowrap">
                      Tổng:{" "}
                      {activeTab === "episodes"
                        ? filteredEpisodes.length
                        : filteredProducts.length}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-amber-500"
                      >
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-slate-400 font-medium">
                          Đang tải dữ liệu...
                        </p>
                      </motion.div>
                    ) : activeTab === "episodes" ? (
                      filteredEpisodes.length === 0 ? (
                        <motion.div
                          key="empty-episodes"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-white/10"
                        >
                          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400">
                            {episodes.length > 0
                              ? "Không tìm thấy tập phim nào phù hợp."
                              : "Chưa có tập phim nào."}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list-episodes"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {filteredEpisodes.map((ep) => (
                            <div
                              key={ep.id}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${editingId === ep.id ? "border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50" : "border-white/5 bg-slate-900 hover:border-white/10 hover:shadow-lg"}`}
                            >
                              <div className="flex items-center gap-4 mb-3 sm:mb-0 overflow-hidden">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-500 flex flex-shrink-0 items-center justify-center font-bold text-lg border border-amber-500/20">
                                  {ep.episode}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center">
                                    <h3 className="font-semibold text-slate-200 truncate">
                                      {ep.name}
                                    </h3>
                                    <span className="flex items-center ml-[57px] text-gray-500 gap-2 text-[12px]">
                                      <Eye className="w-4 h-4" />
                                      900
                                    </span>
                                  </div>
                                  <a
                                    href={ep.src}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-slate-500 hover:text-amber-400 truncate block mt-0.5 transition-colors"
                                  >
                                    {ep.src}
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                                <button
                                  onClick={() => handleEditEpisode(ep)}
                                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors border border-transparent"
                                  title="Sửa"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEpisode(ep.id)}
                                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )
                    ) : filteredProducts.length === 0 ? (
                      <motion.div
                        key="empty-products"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-white/10"
                      >
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">
                          {products.length > 0
                            ? "Không tìm thấy sản phẩm nào phù hợp."
                            : "Chưa có sản phẩm nào."}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list-products"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      >
                        {filteredProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className={`flex  flex-col group relative overflow-hidden rounded-xl border transition-all ${editingId === prod.id ? "border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50" : "border-white/5 bg-slate-900 hover:border-white/10 hover:shadow-lg"}`}
                          >
                            <div className="aspect-[3/4] w-full overflow-hidden bg-slate-800">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                <button
                                  onClick={() => handleEditProduct(prod)}
                                  className="p-2 bg-slate-900/80 backdrop-blur-sm text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
                                  title="Sửa"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(prod.id as string)
                                  }
                                  className="p-2 bg-slate-900/80 backdrop-blur-sm text-slate-200 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-slate-200 truncate mb-2">
                                {prod.name}
                              </h3>
                              <a
                                href={prod.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Mở trên Shopee
                              </a>
                              {prod.updatedAt && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                  🕒{" "}
                                  {(() => {
                                    const diff =
                                      Date.now() -
                                      new Date(prod.updatedAt).getTime();
                                    const days = Math.floor(
                                      diff / (1000 * 60 * 60 * 24),
                                    );
                                    const hours = Math.floor(
                                      diff / (1000 * 60 * 60),
                                    );
                                    const minutes = Math.floor(
                                      diff / (1000 * 60),
                                    );
                                    if (days > 0) return `${days} ngày trước`;
                                    if (hours > 0) return `${hours} giờ trước`;
                                    return `${minutes} phút trước`;
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
