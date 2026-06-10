import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin"); // chuyển trang sau login
    } catch (err: any) {
      console.log("LOGIN ERROR:", err.code, err.message);

      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessage = "Sai email hoặc mật khẩu.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] top-[-50px] left-[-100px]" />
        <div className="absolute w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] bottom-[-50px] right-[-100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0c0c14]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white">Đăng nhập Admin</h2>

          <p className="text-slate-400 mt-2 text-sm">
            Truy cập hệ thống quản trị
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#13131c] text-white border border-white/10 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#13131c] text-white border border-white/10 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
