import { useState, useEffect } from "react";
import { ArrowLeftToLine, ArrowRightToLine, LogOut } from "lucide-react";
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
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/config";
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  // 1. Thêm trạng thái chờ xác thực
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 2. Cập nhật logic kiểm tra tài khoản
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // Đã đăng nhập hợp lệ thì tắt trạng thái chờ
        setIsAuthChecking(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const [activeTab, setActiveTab] = useState<"episodes" | "products">(
    "episodes",
  );

  // Episodes State
  const [selectedSeries, setSelectedSeries] = useState(initialAnimeData[1].id); // Default to DBZ
  const [episodes, setEpisodes] = useState<any[]>([]);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State (Episodes)
  const [episodeNum, setEpisodeNum] = useState("");
  const [episodeName, setEpisodeName] = useState("");
  const [link, setLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State (Products)
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productLink, setProductLink] = useState("");
  const [productDescription, setProductDescription] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const triggerToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // 3000ms là 3 giây (đừng để 300000 vì nó sẽ lâu tắt)
  };

  useEffect(() => {
    // Chỉ tải dữ liệu nếu đã vượt qua bước kiểm tra đăng nhập
    if (isAuthChecking) return;

    if (activeTab === "episodes") {
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa tập phim này?")) return;

    setIsLoading(true);
    try {
      await deleteEpisode(id);
      triggerToast("Đã xóa tập phim!", "success");
      loadEpisodes(selectedSeries);
    } catch (error) {
      console.error("Error deleting", error);
      triggerToast("Có lỗi xảy ra khi xóa!", "error");
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    setIsLoading(true);
    try {
      await deleteProduct(id);
      triggerToast("Đã xóa sản phẩm!", "success");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product", error);
      triggerToast("Có lỗi xảy ra khi xóa!", "error");
      setIsLoading(false);
    }
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

  // 3. Nếu đang chờ tải thì hiển thị vòng xoay đen thui (tránh lộ data và form nhập)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 py-10 px-4 md:px-8 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-300 ${
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

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5">
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

          <div className="flex bg-slate-900 p-1 rounded-lg border border-white/10 mt-2 md:mt-0 items-center self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab("episodes");
                resetForm();
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${activeTab === "episodes" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              <Film className="w-4 h-4" />
              Tập Phim
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                resetForm();
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${activeTab === "products" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              <Package className="w-4 h-4" />
              Sản Phẩm
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center justify-between">
                {editingId ? "Cập nhật" : "Thêm mới"}
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="text-sm text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" /> Hủy
                  </button>
                )}
              </h2>

              {/* Form Content */}
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
                        onChange={(e) => setLink(e.target.value)}
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        onChange={(e) => setProductDescription(e.target.value)}
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
            <div className="bg-slate-950 p-6 rounded-2xl shadow-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "episodes"
                    ? "Danh sách tập phim"
                    : "Danh sách sản phẩm"}
                </h2>
                <div className="text-sm px-3 py-1 bg-white/10 text-slate-300 rounded-full font-medium border border-white/5">
                  Tổng:{" "}
                  {activeTab === "episodes" ? episodes.length : products.length}
                </div>
              </div>

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
                  episodes.length === 0 ? (
                    <motion.div
                      key="empty-episodes"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-white/10"
                    >
                      <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Chưa có tập phim nào.</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Hãy thêm tập phim đầu tiên ở biểu mẫu bên cạnh.
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
                      {episodes.map((ep) => (
                        <div
                          key={ep.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${editingId === ep.id ? "border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50" : "border-white/5 bg-slate-900 hover:border-white/10 hover:shadow-lg"}`}
                        >
                          <div className="flex items-center gap-4 mb-3 sm:mb-0 overflow-hidden">
                            <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-500 flex flex-shrink-0 items-center justify-center font-bold text-lg border border-amber-500/20">
                              {ep.episode}
                            </div>
                            <div className="truncate">
                              <h3 className="font-semibold text-slate-200 truncate">
                                {ep.name}
                              </h3>
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
                ) : products.length === 0 ? (
                  <motion.div
                    key="empty-products"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-white/10"
                  >
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Chưa có sản phẩm nào.</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Hãy thêm sản phẩm đầu tiên ở biểu mẫu bên cạnh.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-products"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className={`group relative overflow-hidden rounded-xl border transition-all ${editingId === prod.id ? "border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50" : "border-white/5 bg-slate-900 hover:border-white/10 hover:shadow-lg"}`}
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
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
    </div>
  );
}
