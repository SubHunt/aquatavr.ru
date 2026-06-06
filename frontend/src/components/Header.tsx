"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Загрузка категорий для меню
    fetch("http://localhost:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => {
        const cats = data.results || data;
        // Строим дерево (упрощенно: только топ-уровень и их дети)
        const roots = cats.filter((c: any) => c.parent === null);
        const tree = roots.map((root: any) => ({
          ...root,
          children: cats.filter((c: any) => c.parent === root.id),
        }));
        setCategories(tree);
      })
      .catch((err) => console.error("Menu fetch error:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled || isCatalogOpen || isMobileMenuOpen
          ? "bg-white shadow-md py-3"
          : "bg-gradient-to-b from-black/50 to-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`text-2xl font-bold tracking-tighter transition-colors duration-300 ${
          isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-blue-900" : "text-white drop-shadow-md"
        }`}>
          AQUA<span className={isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-blue-500" : "text-blue-400"}>TAVR</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <div 
            className="relative group"
            onMouseEnter={() => setIsCatalogOpen(true)}
            onMouseLeave={() => setIsCatalogOpen(false)}
          >
            <button className={`flex items-center space-x-1 text-base font-bold transition-all duration-300 py-2 ${
              isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-gray-800 hover:text-blue-600" : "text-white hover:text-blue-300 drop-shadow-md"
            }`}>
              <span>Каталог</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isCatalogOpen ? "rotate-180" : ""}`} />
            </button>
            
            {/* Mega Menu - remains unchanged, always white background */}
            <AnimatePresence>
              {isCatalogOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-[600px] bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 mt-2"
                >
                  <div className="grid grid-cols-2 gap-10">
                    {categories.map((root) => (
                      <div key={root.id}>
                        <Link 
                          href={`/catalog?category=${root.slug}`}
                          className="text-lg font-black text-gray-900 mb-4 block hover:text-blue-600"
                        >
                          {root.name}
                        </Link>
                        <ul className="space-y-2">
                          {root.children?.map((child: any) => (
                            <li key={child.id}>
                              <Link 
                                href={`/catalog?category=${child.slug}`}
                                className="text-sm text-gray-600 hover:text-blue-600 hover:translate-x-1 transition-all block"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-50">
                    <Link href="/catalog" className="text-sm font-bold text-blue-600 hover:underline">
                      Смотреть весь ассортимент →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {["Бренды", "Акции", "Доставка", "Контакты"].map((item) => (
            <Link
              key={item}
              href={item === "Бренды" ? "/brands" : "#"}
              className={`text-base font-medium transition-all duration-300 ${
                isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-300 drop-shadow-md"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-5">
          <button className={`p-2 transition-colors duration-300 ${
            isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-300 drop-shadow-md"
          }`}>
            <Search size={20} />
          </button>
          <button className={`flex items-center space-x-2 p-2 transition-colors duration-300 ${
            isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-300 drop-shadow-md"
          }`}>
            <ShoppingCart size={20} />
            <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold ${
              isScrolled || isCatalogOpen || isMobileMenuOpen ? "bg-blue-600 text-white" : "bg-white text-blue-600"
            }`}>
              0
            </span>
          </button>
          <a
            href="tel:+70000000000"
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg ${
              isScrolled || isCatalogOpen || isMobileMenuOpen 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" 
                : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 shadow-black/10"
            }`}
          >
            <Phone size={16} />
            <span className="hidden xl:inline">Заказать звонок</span>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`lg:hidden p-2 transition-colors duration-300 ${
            isScrolled || isCatalogOpen || isMobileMenuOpen ? "text-gray-700" : "text-white drop-shadow-md"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[80vh]"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-6">
              {/* Mobile Catalog Accordion */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Наш каталог</h4>
                <div className="space-y-4">
                  {categories.map((root) => (
                    <div key={root.id} className="space-y-2">
                      <div className="font-bold text-gray-900">{root.name}</div>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {root.children?.map((child: any) => (
                          <Link
                            key={child.id}
                            href={`/catalog?category=${child.slug}`}
                            className="text-sm text-gray-500 py-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                {["Бренды", "Акции", "Доставка", "Контакты"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-lg font-bold text-gray-800 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
