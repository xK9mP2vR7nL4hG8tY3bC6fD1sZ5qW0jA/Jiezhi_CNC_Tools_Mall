import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Cog,
  Download,
  Factory,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Phone,
  Printer,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import cncWaterjet from "./assets/cnc-waterjet-public-domain.jpg";
import carbideInsertsPhoto from "./assets/tungsten-carbide-inserts-cc-by-sa-4.jpg";
import toolHolderPhoto from "./assets/tool-holder-cc-by-sa-4.jpg";
import {
  AccountRole,
  createDemoSession,
  DemoSession,
  readDemoSession,
  writeDemoSession,
} from "./features/auth/session";
import {
  categories,
  familyMinPrice,
  findFamilies,
  getFamily,
  getProduct,
  productFamilies,
  Product,
  ProductFamily,
  ProductVariant,
} from "./data/products";
import s from "./App.module.scss";

type Cart = Record<string, number>;
type TaxMode = "含税" | "未税";
type Settlement = "现金" | "月结" | "当月结";
type OrderStatus = "待卖家审核" | "待支付" | "已确认" | "已发货" | "已完成" | "已拒绝";
type DeliveryStatus = "已自动生成" | "待发货" | "已发货" | "已签收";

type OrderItem = {
  familyId: string;
  familyName: string;
  model: string;
  sku: string;
  spec: string;
  quantity: number;
  price: number;
  total: number;
  taxRate: number;
};

type OrderEvent = {
  action: string;
  actorRole: AccountRole;
  at: string;
  note?: string;
};

type Order = {
  id: string;
  buyerId: string;
  orderNo: string;
  deliveryNo: string;
  createdAt: string;
  expectedShipDate: string;
  expectedShipText: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: "待确认" | "模拟待支付" | "已模拟支付";
  company: string;
  contact: string;
  phone: string;
  address: string;
  logistics: string;
  taxMode: TaxMode;
  taxRate: number;
  settlement: Settlement;
  remark: string;
  items: OrderItem[];
  total: number;
  events: OrderEvent[];
};

const CART_KEY = "jz-cnc-cart-v2";
const ORDER_KEY = "jz-cnc-orders-v2";
const DELIVERY_SEQ_KEY = "jz-cnc-delivery-seq-v2";
const DELIVERY_PREFIX_KEY = "jz-cnc-delivery-prefix-v2";
const ANNOUNCEMENT_KEY = "jz-cnc-announcement-seen-v2";

const money = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);

const cx = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const orderDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", "");

const shippingPromise = (now: Date, inStock = true) => {
  const chinaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  if (!inStock) {
    return {
      date: dateKey(chinaTime),
      text: "预售规格，交期以卖家确认结果为准",
      sameDay: false,
    };
  }
  const cutoffPassed =
    chinaTime.getHours() * 60 + chinaTime.getMinutes() >= 18 * 60 + 30;
  if (cutoffPassed) {
    chinaTime.setDate(chinaTime.getDate() + 1);
  }
  return {
    date: dateKey(chinaTime),
    text: cutoffPassed ? "18:30 后下单，预计次日发货" : "18:30 前下单，预计当天发货",
    sameDay: !cutoffPassed,
  };
};

const nextDeliveryNo = () => {
  const prefix = localStorage.getItem(DELIVERY_PREFIX_KEY) || "XS";
  const current = Number(localStorage.getItem(DELIVERY_SEQ_KEY) || "348998");
  const next = current + 1;
  localStorage.setItem(DELIVERY_SEQ_KEY, String(next));
  return prefix + String(next).padStart(6, "0");
};

const orderNo = (count: number) =>
  "JZ" + orderDateKey(new Date()) + String(count + 1).padStart(3, "0");

let demoOrderIdSequence = 0;
const createClientOrderId = () => {
  demoOrderIdSequence += 1;
  return crypto.randomUUID?.() ?? "jz-demo-order-" + demoOrderIdSequence;
};

const ToolArt = ({
  color,
  label,
  compact = false,
}: {
  color: string;
  label: string;
  compact?: boolean;
}) => (
  <div
    className={cx(s.toolArt, compact && s.compactToolArt)}
    style={{ "--tool-color": color } as React.CSSProperties}
    aria-label={label + "规格示意图"}
    role="img"
  >
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <path d="M17 94 83 27l33 12 35 42-69 43z" fill="var(--tool-color)" />
      <path d="m17 94 66 30 68-43-53-17z" fill="#b8c7ce" />
      <path d="m83 27 50 18 18 36-35-42z" fill="#2a414d" opacity=".72" />
      <circle cx="100" cy="77" r="15" fill="#fbfdff" stroke="#263e4b" strokeWidth="7" />
      <path d="m132 44 22-35 14 5-17 67z" fill="#d5a132" />
      <path d="M28 103 91 67" stroke="#ffffff" strokeWidth="2" opacity=".6" />
    </svg>
    <span>规格示意</span>
  </div>
);

function App() {
  const location = useLocation();
  const [cart, setCart] = useState<Cart>(() => readStored(CART_KEY, {}));
  const cartRef = useRef(cart);
  const [orders, setOrders] = useState<Order[]>(() => readStored(ORDER_KEY, []));
  const ordersRef = useRef(orders);
  const [session, setSession] = useState<DemoSession | null>(() => readDemoSession());
  const [toast, setToast] = useState("");
  const [announcementOpen, setAnnouncementOpen] = useState(
    () => !localStorage.getItem(ANNOUNCEMENT_KEY),
  );

  useEffect(() => {
    cartRef.current = cart;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    ordersRef.current = orders;
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  }, [orders]);

  const pushToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const persistCart = (next: Cart) => {
    cartRef.current = next;
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setCart(next);
  };

  const addOrder = (order: Order) => {
    const next = [order, ...ordersRef.current];
    ordersRef.current = next;
    localStorage.setItem(ORDER_KEY, JSON.stringify(next));
    setOrders(next);
  };

  const signIn = (next: DemoSession) => {
    writeDemoSession(next);
    setSession(next);
  };

  const signOut = () => {
    writeDemoSession(null);
    setSession(null);
    pushToast("已退出演示账号");
  };

  const add = (productId: string, quantity?: number) => {
    const product = getProduct(productId);
    const amount = quantity || product.moq;
    const next = {
      ...cartRef.current,
      [product.id]: (cartRef.current[product.id] || 0) + amount,
    };
    persistCart(next);
    pushToast("已加入采购车");
  };

  const updateCart = (productId: string, quantity: number) => {
    const next = { ...cartRef.current };
    if (quantity <= 0) delete next[productId];
    else next[productId] = quantity;
    persistCart(next);
  };

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
    .filter(({ product }) => product.id);

  const isAuthScreen = location.pathname === "/login";
  const isWorkspaceScreen = ["/account", "/orders", "/delivery", "/seller"].some((path) => location.pathname === path || location.pathname.startsWith(path + "/"));

  return (
    <div className={cx(s.app, isAuthScreen && s.authOnly, isWorkspaceScreen && s.workspaceApp)}>
      {!isAuthScreen && <Header cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} session={session} onLogout={signOut} />}
      <main id="main">
        <Routes>
          <Route path="/login" element={<LoginPage key={location.search} session={session} onLogin={signIn} onToast={pushToast} />} />
          <Route path="/" element={<Home add={add} />} />
          <Route path="/products" element={<Catalog add={add} />} />
          <Route path="/search" element={<Catalog add={add} />} />
          <Route path="/product/:id" element={<ProductDetailRoute add={add} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                items={cartItems}
                updateCart={updateCart}
                add={add}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireRole session={session} role="buyer">
                <Checkout items={cartItems} orders={orders} onOrder={addOrder} session={session} />
              </RequireRole>
            }
          />
          <Route
            path="/order-success/:id"
            element={<RequireRole session={session} role="buyer"><OrderSuccess orders={orders} clearCart={() => persistCart({})} /></RequireRole>}
          />
          <Route path="/orders" element={<RequireRole session={session} role="buyer"><OrdersPage orders={orders} session={session} onChangeOrders={setOrders} /></RequireRole>} />
          <Route path="/delivery/:id" element={<RequireRole session={session} role="buyer"><DeliveryNote orders={orders} session={session} /></RequireRole>} />
          <Route path="/seller/delivery/:id" element={<RequireRole session={session} role="seller"><DeliveryNote orders={orders} session={session} sellerView /></RequireRole>} />
          <Route
            path="/seller/*"
            element={<RequireRole session={session} role="seller"><SellerConsole orders={orders} onChangeOrders={setOrders} session={session} /></RequireRole>}
          />
          <Route path="/account/*" element={<RequireRole session={session} role="buyer"><AccountHub orders={orders} session={session} /></RequireRole>} />
          <Route path="/tool-selector" element={<ToolSelector add={add} />} />
          <Route path="/batch-order" element={<BatchOrder add={add} />} />
          <Route path="/purchase-analysis" element={<RequireRole session={session} role="buyer"><PurchaseAnalysis orders={orders} session={session} /></RequireRole>} />
          <Route path="/quote" element={<Navigate replace to="/checkout" />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthScreen && <Footer />}
      {!isAuthScreen && <MobileNav cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} session={session} />}
      {!isAuthScreen && announcementOpen && location.pathname === "/" && (
        <Announcement onClose={() => {
          localStorage.setItem(ANNOUNCEMENT_KEY, "1");
          setAnnouncementOpen(false);
        }} />
      )}
      {toast && (
        <div className={s.toast} role="status">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
    </div>
  );
}

function Header({ cartCount, session, onLogout }: { cartCount: number; session: DemoSession | null; onLogout: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/search?q=" + encodeURIComponent(query));
  };
  return (
    <>
      <a className={s.skip} href="#main">跳至主要内容</a>
      <div className={s.topBar}>
        <div>杰帜数控刀具 · 企业采购支持</div>
        <div>
          <span><Clock3 size={14} /> 18:30 前下单当天发</span>
          <span>品质与型号核验</span>
        </div>
      </div>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link className={s.brand} to="/" aria-label="杰帜数控刀具首页">
            <span className={s.mark}>JZ</span>
            <span>
              <b>杰帜数控刀具</b>
              <small>JIEZHI CNC TOOLS</small>
            </span>
          </Link>
          <form className={s.search} onSubmit={submit}>
            <Search size={19} />
            <input
              aria-label="搜索型号、规格或品牌"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索型号、规格、品牌，例如 PCLNR / CNMG120408 / D10"
            />
            <button data-testid="global-search" type="submit">搜索</button>
          </form>
          <div className={s.actions}>
            <Link to="/tool-selector"><Sparkles /> 选型</Link>
            {session?.role === "seller" ? <Link to="/seller/orders"><ClipboardList /> 订单处理</Link> : <Link to="/orders"><ClipboardList /> 订单</Link>}
            {session ? <Link to={session.role === "seller" ? "/seller" : "/account"}><UserRound /> {session.role === "seller" ? "卖家工作台" : "我的"}</Link> : <Link data-testid="header-login" to="/login"><UserRound /> 登录 / 注册</Link>}
            <Link className={s.cartLink} to="/cart"><ShoppingCart /> 采购车 <i>{cartCount}</i></Link>
            {session && <button className={s.logoutButton} type="button" onClick={onLogout} aria-label="退出当前账号"><LogOut /> 退出</button>}
          </div>
        </div>
        <nav className={s.nav} aria-label="主导航">
          <Link to="/">首页</Link>
          <Link to="/products?category=主夹">主夹</Link>
          <Link to="/products?category=背夹">背夹</Link>
          <Link to="/products">型号分类</Link>
          <Link to="/batch-order">快速下单</Link>
          <Link to={session?.role === "seller" ? "/seller" : "/login?role=seller&returnTo=%2Fseller"}>卖家中心</Link>
          <Link to="/support">企业服务</Link>
        </nav>
      </header>
    </>
  );
}

function RequireRole({ session, role, children }: { session: DemoSession | null; role: AccountRole; children: React.ReactNode }) {
  const location = useLocation();
  if (!session || session.role !== role) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/login?role=${role}&returnTo=${returnTo}`} />;
  }
  return <>{children}</>;
}

function LoginPage({ session, onLogin, onToast }: { session: DemoSession | null; onLogin: (session: DemoSession) => void; onToast: (message: string) => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role") === "seller" ? "seller" : "buyer";
  const [role, setRole] = useState<AccountRole>(requestedRole);
  const [codeSent, setCodeSent] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");
  const returnTo = searchParams.get("returnTo");

  const resolveTarget = (activeRole: AccountRole) => {
    // 登录页允许切换买卖家身份，因此不能把另一个身份的回跳地址继续带过去。
    // 例如：从 /account 跳到登录页后改选卖家，必须进入 /seller，而不是再被买家守卫拦回登录页。
    if (activeRole === "seller") {
      return returnTo?.startsWith("/seller") ? returnTo : "/seller";
    }

    const buyerPaths = ["/account", "/checkout", "/order-success", "/orders", "/delivery", "/purchase-analysis"];
    return returnTo && buyerPaths.some((path) => returnTo.startsWith(path)) ? returnTo : "/account";
  };

  const finishLogin = (company: string, phone: string) => {
    const next = createDemoSession({ role, company, phone });
    onLogin(next);
    onToast(role === "seller" ? "已进入卖家工作台（演示账号）" : "已进入买家采购中心（演示账号）");
    navigate(resolveTarget(role), { replace: true });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const company = String(data.get("company") || "").trim();
    const phone = String(data.get("phone") || "").replace(/\s/g, "");
    const code = String(data.get("code") || "").trim();
    if (role === "seller" && !company) {
      setError("请输入注册企业名称后再登录卖家工作台。");
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的 11 位手机号码。");
      return;
    }
    if (code.length < 4) {
      setError("请输入至少 4 位验证码；当前仅演示界面，不会发送真实短信。");
      return;
    }
    if (!agreed) {
      setError("请先阅读并同意《用户协议》和《隐私政策》。");
      return;
    }
    finishLogin(company, phone);
  };

  const quickLogin = () => finishLogin(role === "seller" ? "东莞市杰帜数控刀具有限公司" : "精工机械制造有限公司", role === "seller" ? "13902607662" : "13812345678");

  return <div className={s.authPage}>
    <section className={s.authCard} aria-labelledby="login-title">
      <div className={s.authMark}><Cog aria-hidden="true" /></div>
      <h1 id="login-title">杰帜数控刀具</h1>
      <p>数控精密刀具 · 企业采购服务</p>
      <div className={s.roleTabs} role="tablist" aria-label="选择登录身份">
        <button data-testid="login-buyer-tab" type="button" role="tab" aria-selected={role === "buyer"} className={role === "buyer" ? s.active : ""} onClick={() => { setRole("buyer"); setError(""); setCodeSent(false); }}>我是买家</button>
        <button data-testid="login-seller-tab" type="button" role="tab" aria-selected={role === "seller"} className={role === "seller" ? s.active : ""} onClick={() => { setRole("seller"); setError(""); setCodeSent(false); }}>我是卖家</button>
      </div>
      {role === "seller" && <p className={s.sellerLoginNotice}><ShieldCheck aria-hidden="true" /> 卖家账号应由杰帜管理员开通；测试时可直接点击下方“一键进入卖家工作台（演示）”。</p>}
      <form className={s.loginForm} onSubmit={submit} noValidate>
        {role === "seller" && <label><span>注册企业名称</span><div><Building2 aria-hidden="true" /><input name="company" autoComplete="organization" placeholder="请输入注册企业全称" /></div></label>}
        <label><span>手机号码</span><div><Phone aria-hidden="true" /><input name="phone" type="tel" autoComplete="tel" inputMode="numeric" placeholder="请输入手机号" /></div></label>
        <label><span>验证码</span><div className={s.codeField}><span><ShieldCheck aria-hidden="true" /><input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" /></span><button data-testid="send-demo-code" type="button" onClick={() => { setCodeSent(true); setError(""); }}>获取验证码</button></div></label>
        {codeSent && <p className={s.codeHint} role="status">演示验证码已就绪：可输入任意 4 位数字继续。</p>}
        {error && <p className={s.formError} role="alert">{error}</p>}
        <button data-testid="login-submit" className={s.loginSubmit} type="submit">登录 / 注册</button>
        <label className={s.agreement}><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已阅读并同意《用户协议》和《隐私政策》</span></label>
      </form>
      <div className={s.authDivider}><span>其他方式</span></div>
      <button data-testid="quick-demo-login" className={s.wechatDemo} type="button" onClick={quickLogin}>{role === "seller" ? "一键进入卖家工作台（演示）" : "一键进入买家采购中心（演示）"}</button>
      <small className={s.authHint}>当前为前端原型：不会发送短信、不会接入微信，也不创建真实账号。{session ? " 登录将切换当前演示身份。" : ""}</small>
    </section>
  </div>;
}

function Home({ add }: { add: (id: string, quantity?: number) => void }) {
  const primaryCategories = categories.slice(0, 6);
  return (
    <>
      <section className={s.hero}>
        <div className={s.heroPhoto}>
          <img src={cncWaterjet} alt="CNC 数控加工现场实拍" />
          <small>加工场景实拍 · 公共领域素材 · 非具体 SKU 商品图</small>
        </div>
        <div className={s.heroInner}>
          <div className={s.heroCopy}>
            <span className={s.eyebrow}>JIEZHI CNC · MODEL FIRST</span>
            <h1>按型号选对刀具，<em>按规格直接下单</em></h1>
            <p>主夹、背夹与刀具型号集中管理；同型号的尺寸、左右向、牌号和包装在同一页核对后再下单。</p>
            <div className={s.heroButtons}>
              <Link className={s.primary} to="/products"><Search /> 搜型号 / 规格 <ChevronRight /></Link>
              <Link className={s.secondary} to="/tool-selector"><Sparkles /> 工艺选型助手</Link>
            </div>
            <div className={s.shippingPromise}>
              <Truck />
              <div><b>发货承诺</b><span>18:30 前完成下单，现货规格当天发；18:30 后次日发货。</span></div>
            </div>
          </div>
          <aside className={s.heroPanel}>
            <span>型号优先采购</span>
            <h2>先选型号，再选规格</h2>
            <ol>
              <li><b>01</b><span>输入型号或从主夹 / 背夹分类进入</span></li>
              <li><b>02</b><span>在规格矩阵确认尺寸、方向、库存和 MOQ</span></li>
              <li><b>03</b><span>提交订单后系统自动生成固定送货单</span></li>
            </ol>
            <Link to="/batch-order">批量输入型号 <ArrowRight /></Link>
          </aside>
        </div>
      </section>
      <section className={s.container}>
        <div className={s.sectionHead}>
          <div><span>PRODUCT CATEGORIES</span><h2>按产品大类快速进入</h2></div>
          <Link to="/products">查看全部型号 <ChevronRight /></Link>
        </div>
        <div className={s.categoryGrid}>
          {primaryCategories.map(([name, description], index) => {
            const icons = [Box, ClipboardCheck, Factory, Cog, CircleHelp, PackageCheck];
            const Icon = icons[index];
            return (
              <Link key={name} to={"/products?category=" + encodeURIComponent(name)}>
                <span className={s.categoryIcon}><Icon /></span>
                <b>{name}</b>
                <small>{description}</small>
                <ChevronRight />
              </Link>
            );
          })}
        </div>
      </section>
      <section className={s.featureBand}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div><span>MODEL FAMILIES</span><h2>高频型号 · 规格集中选择</h2></div>
            <Link to="/products">进入型号中心 <ChevronRight /></Link>
          </div>
          <div className={s.productGrid}>
            {productFamilies.slice(0, 4).map((item) => <FamilyCard key={item.id} family={item} add={add} />)}
          </div>
        </div>
      </section>
      <section className={cx(s.container, s.homeWorkflow)}>
        <div><span>ORDER TO DELIVERY NOTE</span><h2>订单与固定送货单自动关联</h2><p>客户提交订单后即时生成送货单编号和不可变订单快照。卖家审核、打印、人工盖章和人工发货仍由商家确认。</p></div>
        <div className={s.workflowSteps}>
          {[
            ["选择型号", "同型号规格归类"],
            ["提交订单", "税务、结款、物流一起记录"],
            ["自动送货单", "固定 XS 编号与模板"],
            ["卖家发货", "审核、打印、盖章、发货"],
          ].map(([title, detail], index) => (
            <div key={title}><b>0{index + 1}</b><strong>{title}</strong><span>{detail}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}

function FamilyCard({ family, add }: { family: ProductFamily; add: (id: string, quantity?: number) => void }) {
  const first = family.variants[0];
  const industryPhoto = family.category === "可转位刀片"
    ? carbideInsertsPhoto
    : family.category === "主夹" || family.category === "背夹"
      ? toolHolderPhoto
      : undefined;
  return (
    <article className={s.familyCard} data-testid={"family-" + family.id}>
      <Link to={"/product/" + family.id} className={s.productVisual}>
        {family.tag && <span>{family.tag}</span>}
        {industryPhoto ? <>
          <img className={s.industryPhoto} src={industryPhoto} alt={`${family.category}行业实拍，非杰帜具体 SKU 商品图`} />
          <i className={s.industryPhotoNote}>行业实拍 · 非 SKU 图</i>
        </> : <ToolArt color={family.color} label={family.name} />}
      </Link>
      <div className={s.familyBody}>
        <small>{family.category} · {family.subcategory}</small>
        <Link to={"/product/" + family.id}><h3>{family.name}</h3><b>{family.model}</b></Link>
        <p>{family.variants.length} 个可选规格 · {family.materialHint}</p>
        <div className={s.familyBottom}>
          <strong>{money(familyMinPrice(family))}<small> 起</small></strong>
          <button onClick={() => add(first.id, first.moq)}><Plus /> 加购</button>
        </div>
      </div>
    </article>
  );
}

function Catalog({ add }: { add: (id: string, quantity?: number) => void }) {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "全部");
  const [material, setMaterial] = useState("全部");
  const [sort, setSort] = useState("推荐");
  const list = useMemo(() => {
    const result = findFamilies(query, category).filter((family) =>
      material === "全部" ||
      family.materialHint.includes(material) ||
      family.variants.some((variant) => variant.material.includes(material)),
    );
    return [...result].sort((a, b) => {
      if (sort === "价格") return familyMinPrice(a) - familyMinPrice(b);
      if (sort === "规格数") return b.variants.length - a.variants.length;
      return 0;
    });
  }, [category, material, query, sort]);
  return (
    <div className={s.catalogPage}>
      <div className={s.breadcrumb}>首页 <ChevronRight /> 商品中心</div>
      <section className={s.catalogIntro}>
        <div><span>MODEL CATALOG</span><h1>按型号集中管理商品规格</h1><p>列表展示主型号；进入详情页后再选择精确的尺寸、方向、牌号或包装规格。</p></div>
        <label className={s.catalogSearch}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索型号、SKU、规格或品牌" /></label>
      </section>
      <div className={s.catalogLayout}>
        <aside className={s.filters}>
          <div className={s.filterTitle}><SlidersHorizontal /><b>筛选型号</b></div>
          <h2>一级分类</h2>
          {["全部", ...categories.map(([name]) => name)].map((name) => (
            <button className={category === name ? s.active : ""} key={name} onClick={() => setCategory(name)}>
              {name}<span>{name === "全部" ? productFamilies.length : productFamilies.filter((item) => item.category === name).length}</span>
            </button>
          ))}
          <h2>常见材质</h2>
          {["全部", "硬质合金", "42CrMo", "合金钢", "HSS-Co"].map((name) => (
            <label key={name}><input type="radio" name="material" checked={material === name} onChange={() => setMaterial(name)} /> {name}</label>
          ))}
          <div className={s.filterHint}><ShieldCheck /> 实际库存、价格与交期将在接入商品主数据后同步；当前为可操作演示数据。</div>
        </aside>
        <section className={s.results}>
          <div className={s.resultBar}><span>找到 <b>{list.length}</b> 个型号家族</span><label>排序 <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="推荐">推荐</option><option value="价格">价格从低到高</option><option value="规格数">规格数</option></select></label></div>
          {list.length ? <div className={s.productGrid}>{list.map((family) => <FamilyCard key={family.id} family={family} add={add} />)}</div> : <Empty icon={<Search />} title="没有找到匹配型号" description="请检查型号、规格或清除筛选条件后再试。" action={<button onClick={() => { setQuery(""); setCategory("全部"); setMaterial("全部"); }}>重置筛选</button>} />}
        </section>
      </div>
    </div>
  );
}

function ProductDetailRoute({ add }: { add: (id: string, quantity?: number) => void }) {
  const { id } = useParams();
  return <ProductDetail key={id} add={add} />;
}

function ProductDetail({ add }: { add: (id: string, quantity?: number) => void }) {
  const { id } = useParams();
  const family = getFamily(id);
  const [selected, setSelected] = useState<ProductVariant>(family.variants[0]);
  const [quantity, setQuantity] = useState(family.variants[0].moq);
  const [tab, setTab] = useState("规格参数");
  const navigate = useNavigate();
  const delivery = shippingPromise(new Date(), selected.stock > 0);
  const selectVariant = (variant: ProductVariant) => {
    setSelected(variant);
    setQuantity(variant.moq);
  };
  const buyNow = () => {
    add(selected.id, quantity);
    navigate("/checkout");
  };
  return (
    <div className={s.detailPage}>
      <div className={s.breadcrumb}>首页 <ChevronRight /> {family.category} <ChevronRight /> {family.model}</div>
      <section className={s.detailTop}>
        <div className={s.detailVisual}>
          <ToolArt color={family.color} label={family.name} />
          <small>当前为型号结构示意；请在卖家后台上传对应 SKU 实物图、尺寸图或 PDF。</small>
        </div>
        <div className={s.detailInfo}>
          <span className={s.productType}>{family.category} · {family.subcategory}</span>
          <h1>{family.name}</h1>
          <div className={s.modelLine}><b>{family.model}</b><span>{family.brand}</span></div>
          <p className={s.detailLead}>{family.description}</p>
          <div className={s.priceBox}><span>当前所选规格参考价</span><strong>{money(selected.price)}</strong><small>演示价格；正式成交价、税率与结款权限以卖家确认/系统规则为准</small></div>
          <div className={s.deliveryLine}><Truck /><div><b>{delivery.text}</b><span>现货 {selected.stock} · 起订 {selected.moq} · {selected.packaging}</span></div></div>
          <section className={s.variantSection}>
            <div className={s.variantHead}><b>选择规格</b><span>型号相同，规格不同</span></div>
            <div className={s.variantGrid}>
              {family.variants.map((variant) => <button key={variant.id} className={selected.id === variant.id ? s.selected : ""} onClick={() => selectVariant(variant)}><strong>{variant.label}</strong><span>{variant.sku}</span><small>{money(variant.price)} · 库存 {variant.stock}</small></button>)}
            </div>
          </section>
          <div className={s.purchaseRow}>
            <div className={s.stepper}><button aria-label="减少数量" onClick={() => setQuantity((value) => Math.max(selected.moq, value - 1))}><Minus /></button><input aria-label="采购数量" type="number" min={selected.moq} value={quantity} onChange={(event) => setQuantity(Math.max(selected.moq, Number(event.target.value) || selected.moq))} /><button aria-label="增加数量" onClick={() => setQuantity((value) => value + 1)}><Plus /></button></div>
            <button className={s.secondaryButton} onClick={() => add(selected.id, quantity)}><ShoppingCart /> 加入采购车</button>
            <button className={s.primaryButton} onClick={buyNow}>立即下单 <ArrowRight /></button>
          </div>
          <div className={s.detailAssurances}><span><ShieldCheck /> 型号与规格二次核对</span><span><PackageCheck /> 下单后自动送货单</span><span><Headphones /> 人工技术支持</span></div>
        </div>
      </section>
      <section className={s.detailTabs}>
        {["规格参数", "应用说明", "交付与送货单"].map((item) => <button key={item} className={tab === item ? s.active : ""} onClick={() => setTab(item)}>{item}</button>)}
      </section>
      <section className={s.detailContent}>
        {tab === "规格参数" && <div className={s.specTable}>{Object.entries({ "商品型号": family.model, "当前 SKU": selected.sku, "规格": selected.size, "材质": selected.material, "表面/涂层": selected.coating, "起订量": String(selected.moq), "库存": String(selected.stock), ...selected.specifications }).map(([key, value]) => <div key={key}><b>{key}</b><span>{value}</span></div>)}</div>}
        {tab === "应用说明" && <div className={s.richText}><h2>适用说明</h2><p>{family.application}</p><p>型号匹配、刀片/刀柄兼容性及实际切削参数需由现场工程师按工件材料、机床刚性、冷却和工艺要求确认。</p></div>}
        {tab === "交付与送货单" && <div className={s.richText}><h2>订单后自动生成送货单</h2><p>提交订单后，系统自动生成固定模板送货单与 <b>XS 固定前缀流水号</b>，并锁定商品、规格、数量、税务、结款、收货及物流快照。</p><p>纸质单据请由卖家审核、打印并按业务要求加盖实体章；系统不生成电子印章。</p></div>}
      </section>
    </div>
  );
}

function CartPage({ items, updateCart, add }: { items: Array<{ product: Product; quantity: number }>; updateCart: (id: string, quantity: number) => void; add: (id: string, quantity?: number) => void }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <div className={s.page}>
      <PageTitle eyebrow="PURCHASE CART" title="采购车" note={items.length + " 个规格已加入"} />
      {items.length ? <div className={s.cartLayout}>
        <section className={s.cartPanel}>
          {items.map(({ product, quantity }) => <div className={s.cartItem} key={product.id}>
            <ToolArt color={product.color} label={product.familyName} compact />
            <div className={s.cartDescription}><Link to={"/product/" + product.familyId}><b>{product.familyName}</b><strong>{product.model} · {product.sku}</strong></Link><span>{product.label} · {product.size}</span><small>起订 {product.moq} · 现货 {product.stock} · {product.packaging}</small></div>
            <div className={s.stepper}><button aria-label="减少数量" onClick={() => updateCart(product.id, Math.max(product.moq, quantity - 1))}><Minus /></button><input aria-label="数量" value={quantity} onChange={(event) => updateCart(product.id, Math.max(product.moq, Number(event.target.value) || product.moq))} /><button aria-label="增加数量" onClick={() => add(product.id, 1)}><Plus /></button></div>
            <strong>{money(product.price * quantity)}</strong>
            <button className={s.textDanger} aria-label="删除商品" onClick={() => updateCart(product.id, 0)}><X /></button>
          </div>)}
        </section>
        <aside className={s.summary}>
          <h2>订单汇总</h2><div><span>型号规格</span><b>{items.length} 项</b></div><div><span>采购数量</span><b>{items.reduce((sum, item) => sum + item.quantity, 0)} 件</b></div><div className={s.total}><span>商品合计</span><strong>{money(total)}</strong></div><p>结算方式、税务状态和物流将在确认订单时选择，并会写入自动生成的送货单。</p><Link className={s.primary} to="/checkout">去结算 <ChevronRight /></Link>
        </aside>
      </div> : <Empty icon={<ShoppingCart />} title="采购车还是空的" description="先按型号和规格选择需要的刀具，再提交订单。" action={<Link to="/products">进入型号中心</Link>} />}
    </div>
  );
}

function Checkout({ items, orders, onOrder, session }: { items: Array<{ product: Product; quantity: number }>; orders: Order[]; onOrder: (order: Order) => void; session: DemoSession | null }) {
  const navigate = useNavigate();
  const [taxMode, setTaxMode] = useState<TaxMode>("含税");
  const [settlement, setSettlement] = useState<Settlement>("现金");
  const [logistics, setLogistics] = useState("顺丰快递");
  const [error, setError] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (!items.length) return <Navigate replace to="/cart" />;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const company = String(data.get("company") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const address = String(data.get("address") || "").trim();
    if (!company || !contact || !phone || !address) {
      setError("请完整填写企业、联系人、联系电话与收货地址。");
      return;
    }
    const now = new Date();
    const promise = shippingPromise(now, items.every((item) => item.product.stock >= item.quantity));
    const taxRate = taxMode === "含税" ? 13 : 0;
    const created: Order = {
      id: createClientOrderId(),
      buyerId: session?.id || "buyer:guest",
      orderNo: orderNo(orders.length),
      deliveryNo: nextDeliveryNo(),
      createdAt: now.toISOString(),
      expectedShipDate: promise.date,
      expectedShipText: promise.text,
      status: "待卖家审核",
      deliveryStatus: "已自动生成",
      paymentStatus: settlement === "现金" ? "模拟待支付" : "待确认",
      company,
      contact,
      phone,
      address,
      logistics,
      taxMode,
      taxRate,
      settlement,
      remark: String(data.get("remark") || "").trim(),
      items: items.map(({ product, quantity }) => ({
        familyId: product.familyId,
        familyName: product.familyName,
        model: product.model,
        sku: product.sku,
        spec: product.label + " · " + product.size,
        quantity,
        price: product.price,
        total: product.price * quantity,
        taxRate,
      })),
      total: subtotal,
      events: [{ action: "买家提交订单", actorRole: "buyer", at: now.toISOString(), note: "系统已预生成送货单编号" }],
    };
    onOrder(created);
    navigate("/order-success/" + created.id);
  };
  return (
    <div className={s.page}>
      <PageTitle eyebrow="DIRECT ORDER" title="确认订单" note="提交后自动生成固定送货单" />
      <form className={s.checkoutLayout} onSubmit={submit}>
        <div className={s.checkoutMain}>
          <section className={s.formCard}><h2><span>01</span> 收货信息</h2><div className={s.formGrid}><label>企业名称 *<input name="company" required defaultValue={session?.company} placeholder="请输入完整企业名称" /></label><label>联系人 *<input name="contact" required defaultValue={session?.contact} placeholder="姓名" /></label><label>联系电话 *<input name="phone" required defaultValue={session?.phone} type="tel" placeholder="手机或座机" /></label><label>物流方式 *<select value={logistics} onChange={(event) => setLogistics(event.target.value)}><option>顺丰快递</option><option>圆通快递</option><option>中通快递</option><option>同城跑腿</option><option>客户自提</option><option>其他物流</option></select></label><label className={s.full}>收货地址 *<input name="address" required placeholder="省 / 市 / 区 / 详细收货地址" /></label></div></section>
          <section className={s.formCard}><h2><span>02</span> 结算与税务</h2><div className={s.optionRows}><label><b>税务状态</b><select value={taxMode} onChange={(event) => setTaxMode(event.target.value as TaxMode)}><option value="含税">含税（演示税率 13%）</option><option value="未税">未税</option></select><small>正式税率与价税计算规则须由卖家后台配置；当前为演示参数。</small></label><label><b>结算方式</b><select value={settlement} onChange={(event) => setSettlement(event.target.value as Settlement)}><option value="现金">现金 / 转账</option><option value="月结">月结（需卖家审批）</option><option value="当月结">当月结（需卖家审批）</option></select><small>月结不会自动生效，将进入卖家审核。</small></label></div></section>
          <section className={s.formCard}><h2><span>03</span> 订单备注</h2><label><textarea name="remark" rows={4} placeholder="如有指定发票、送货、包装、收货时间等要求，请在此说明。" /></label></section>
          {error && <p className={s.formError}>{error}</p>}
        </div>
        <aside className={s.orderSummary}>
          <h2>商品清单</h2>{items.map(({ product, quantity }) => <div className={s.orderLine} key={product.id}><span><b>{product.model}</b><small>{product.label} · {product.sku}</small></span><em>×{quantity}</em><strong>{money(product.price * quantity)}</strong></div>)}<div className={s.checkoutTotal}><span>应付参考总额</span><strong>{money(subtotal)}</strong><small>下单时生成送货单；实际结款、价格与库存由卖家最终审核。</small></div><div className={s.shipNotice}><CalendarCheck /><span><b>{shippingPromise(new Date()).text}</b>节假日和缺货规格以仓库确认结果为准。</span></div><button className={s.submitOrder} type="submit">提交订单并生成送货单 <ArrowRight /></button>
        </aside>
      </form>
    </div>
  );
}

function OrderSuccess({ orders, clearCart }: { orders: Order[]; clearCart: () => void }) {
  const { id } = useParams();
  const order = orders.find((item) => item.id === id);
  const didClear = useRef(false);
  useEffect(() => {
    if (order && !didClear.current) {
      didClear.current = true;
      clearCart();
    }
  }, [clearCart, order]);
  if (!order) return <NotFound />;
  return <div className={s.page}><div className={s.successPanel}><CheckCircle2 /><span>ORDER CREATED</span><h1>订单已提交，送货单已自动生成</h1><p>订单 <b>{order.orderNo}</b> 已进入卖家审核；固定送货单编号为 <b>{order.deliveryNo}</b>。</p><div className={s.successFacts}><div><small>预计发货</small><b>{order.expectedShipText}</b></div><div><small>结算方式</small><b>{order.taxMode} · {order.settlement}</b></div><div><small>物流方式</small><b>{order.logistics}</b></div></div><div className={s.successActions}><Link className={s.primary} to={"/delivery/" + order.id}><ReceiptText /> 查看送货单</Link><Link className={s.secondary} to="/orders">进入订单中心</Link></div></div></div>;
}

type BuyerOrderFilter = "全部" | "待审核" | "待发货" | "待收货" | "已完成";

const buyerOrderState = (order: Order): Exclude<BuyerOrderFilter, "全部"> => {
  if (order.status === "待卖家审核" || order.status === "已拒绝") return "待审核";
  if (order.status === "已发货") return "待收货";
  if (order.status === "已完成") return "已完成";
  return "待发货";
};

function OrdersPage({ orders, session, onChangeOrders }: { orders: Order[]; session: DemoSession | null; onChangeOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const [status, setStatus] = useState<BuyerOrderFilter>("全部");
  const ownOrders = orders.filter((order) => !order.buyerId || order.buyerId === session?.id);
  const filtered = ownOrders.filter((order) => status === "全部" || buyerOrderState(order) === status);
  const confirmReceipt = (order: Order) => onChangeOrders((current) => current.map((item) => item.id === order.id ? withOrderEvent(order, { status: "已完成", deliveryStatus: "已签收" }, "买家确认收货", "buyer") : item));
  return <div className={cx(s.page, s.buyerOrdersPage)}><PageTitle eyebrow="BUYER ORDER CENTER" title="我的订单" note="可查看审核状态、送货单和发货进度" /><div className={cx(s.orderTabs, s.buyerOrderTabs)}>{(["全部", "待审核", "待发货", "待收货", "已完成"] as const).map((item) => <button data-testid={`buyer-order-tab-${item}`} key={item} className={status === item ? s.active : ""} onClick={() => setStatus(item)}>{item}</button>)}</div>{filtered.length ? <div className={s.orderCards}>{filtered.map((order) => <OrderCard key={order.id} order={order} onBuyerReceipt={confirmReceipt} />)}</div> : <Empty icon={<ClipboardList />} title="还没有订单" description="登录后选择型号和规格并提交订单，系统会预生成送货单编号。" action={<Link to="/products">去选购</Link>} />}</div>;
}

const withOrderEvent = (order: Order, patch: Partial<Order>, action: string, actorRole: AccountRole, note?: string): Order => ({
  ...order,
  ...patch,
  events: [...(order.events || []), { action, actorRole, at: new Date().toISOString(), note }],
});

function OrderCard({ order, seller = false, onUpdate, onReject, onGenerateDelivery, onBuyerReceipt }: { order: Order; seller?: boolean; onUpdate?: (next: Order) => void; onReject?: (order: Order) => void; onGenerateDelivery?: (order: Order) => void; onBuyerReceipt?: (order: Order) => void }) {
  const statusClass = order.status === "已发货" || order.status === "已完成" ? s.successStatus : order.status === "已拒绝" ? s.dangerStatus : s.pendingStatus;
  const statusText = seller ? order.status : buyerOrderState(order);
  const deliveryPath = seller ? "/seller/delivery/" + order.id : "/delivery/" + order.id;
  return <article className={s.orderCard}><div className={s.orderCardTop}><span>{seller ? order.company : "订单号：" + order.orderNo}</span><b className={statusClass}>{statusText}</b></div><div className={s.orderCardBody}><div><small>下单时间：{formatDateTime(order.createdAt)}</small><strong>{order.items[0].familyName} · {order.items[0].model}</strong><span>{order.items.map((item) => item.spec).join("；")}</span>{seller && <p>收货：{order.contact} · {order.phone}<br />{order.address}</p>}</div><div className={s.orderCardAmount}><small>{order.items.length} 项 · {order.taxMode} · {order.settlement}</small><b>{money(order.total)}</b></div></div><div className={s.orderCardFoot}><span><Truck /> {order.expectedShipText}</span><div><Link to={deliveryPath}>送货单 {order.deliveryNo}</Link>{!seller && order.status === "已发货" && <button data-testid="buyer-confirm-receipt" onClick={() => onBuyerReceipt?.(order)}>确认收货</button>}{!seller && order.status === "已完成" && <Link to="/products">再次购买</Link>}{seller && order.status === "待卖家审核" && <><button className={s.outlineDanger} data-testid="seller-reject-order" onClick={() => onReject?.(order)}>拒绝</button><button data-testid="seller-confirm-order" onClick={() => onUpdate?.(withOrderEvent(order, { status: "已确认", deliveryStatus: "已自动生成", paymentStatus: "待确认" }, "卖家确认订单", "seller"))}>确认订单</button></>}{seller && order.status === "待支付" && <button data-testid="seller-confirm-payment" onClick={() => onUpdate?.(withOrderEvent(order, { status: "已确认", deliveryStatus: "已自动生成", paymentStatus: "已模拟支付" }, "卖家确认款项", "seller"))}>确认收款</button>}{seller && order.status === "已确认" && order.deliveryStatus === "已自动生成" && <button data-testid="seller-generate-delivery" onClick={() => onGenerateDelivery?.(order)}>生成送货单</button>}{seller && order.status === "已确认" && order.deliveryStatus === "待发货" && <button data-testid="seller-ship-order" onClick={() => onUpdate?.(withOrderEvent(order, { status: "已发货", deliveryStatus: "已发货" }, "卖家确认发货", "seller"))}>发货</button>}</div></div></article>;
}

function DeliveryNote({ orders, session, sellerView = false }: { orders: Order[]; session: DemoSession | null; sellerView?: boolean }) {
  const { id } = useParams();
  const order = orders.find((item) => item.id === id);
  if (!order || (!sellerView && order.buyerId && order.buyerId !== session?.id)) return <NotFound />;
  const exportCsv = () => {
    const headers = ["送货单号", "订单号", "客户", "型号", "SKU", "规格", "数量", "含税单价", "金额", "税率", "结算方式", "下单时间", "预计发货"];
    const rows = order.items.map((item) => [order.deliveryNo, order.orderNo, order.company, item.model, item.sku, item.spec, String(item.quantity), item.price.toFixed(2), item.total.toFixed(2), String(item.taxRate) + "%", order.settlement, formatDateTime(order.createdAt), order.expectedShipDate]);
    const content = [headers, ...rows].map((row) => row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = order.deliveryNo + "-送货单.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return <div className={s.deliveryPage}><div className={s.deliveryActions}><Link to={sellerView ? "/seller/deliveries" : "/orders"}><ChevronRight className={s.backIcon} /> {sellerView ? "返回送货单管理" : "返回订单"}</Link><span>固定模板预览 · 打印前请卖家审核并加盖实体章</span><div><button onClick={exportCsv}><Download /> 导出 Excel（CSV）</button><button className={s.primaryButton} onClick={() => window.print()}><Printer /> 打印送货单</button></div></div><section className={s.deliverySheet}>
    <div className={s.deliveryPerforation} aria-hidden="true" />
    <header><div><small>电话：13902607662</small><small>客户：{order.company}</small><small>备注：{order.remark || "—"}</small></div><div className={s.deliveryTitle}><h1>东莞市杰帜数控刀具有限公司</h1><b>送货单</b></div><div><small>送货时间：{formatDateTime(order.createdAt)}</small><small>单号：<strong>{order.deliveryNo}</strong></small><small>关联订单：{order.orderNo}</small></div></header>
    <div className={s.deliveryCustomer}><span>收货单位：<b>{order.company}</b></span><span>联系人：{order.contact}</span><span>联系电话：{order.phone}</span><span className={s.addressLine}>收货地址：{order.address}</span><span>物流：{order.logistics}</span><span>结算：{order.taxMode} · {order.settlement}</span></div>
    <table><thead><tr><th>序号</th><th>商品</th><th>型号 / SKU</th><th>规格</th><th>数量</th><th>税率(%)</th><th>单价</th><th>金额</th><th>备注</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={item.sku}><td>{index + 1}</td><td>{item.familyName}</td><td>{item.model}<br />{item.sku}</td><td>{item.spec}</td><td>{item.quantity}</td><td>{item.taxRate}</td><td>{item.price.toFixed(2)}</td><td>{item.total.toFixed(2)}</td><td>—</td></tr>)}{Array.from({ length: Math.max(0, 4 - order.items.length) }).map((_, index) => <tr className={s.blankRow} key={"blank-" + index}><td>{order.items.length + index + 1}</td><td /><td /><td /><td /><td /><td /><td /><td /></tr>)}</tbody><tfoot><tr><td colSpan={4}>合计</td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>—</td><td>—</td><td>{order.total.toFixed(2)}</td><td>人民币（含税/未税以订单为准）</td></tr></tfoot></table>
    <footer><span>制单人：系统自动生成</span><span>审核人：________________</span><span>客户签字：________________</span><span>实际发货：{order.expectedShipDate}</span></footer>
    <div className={s.stampNote}>打印后加盖实体章</div><div className={s.deliveryPerforation} aria-hidden="true" />
  </section></div>;
}

type SellerTab = "dashboard" | "orders" | "deliveries" | "products" | "customers" | "stats" | "announcement";

const sellerTabs: Array<{ id: SellerTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "工作台", icon: LayoutDashboard },
  { id: "orders", label: "订单管理", icon: ClipboardList },
  { id: "deliveries", label: "送货单管理", icon: Truck },
  { id: "products", label: "商品管理", icon: Box },
  { id: "customers", label: "客户管理", icon: Users },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "announcement", label: "公告管理", icon: FileText },
];

const sellerTitle: Record<SellerTab, string> = {
  dashboard: "卖家中心",
  orders: "订单管理",
  deliveries: "送货单管理",
  products: "商品型号管理",
  customers: "客户管理",
  stats: "经营数据",
  announcement: "公告管理",
};

function SellerConsole({ orders, onChangeOrders, session }: { orders: Order[]; onChangeOrders: React.Dispatch<React.SetStateAction<Order[]>>; session: DemoSession | null }) {
  const location = useLocation();
  const pathSegment = location.pathname.split("/")[2] as SellerTab | undefined;
  const tab: SellerTab = sellerTabs.some((item) => item.id === pathSegment) ? pathSegment as SellerTab : "dashboard";
  const update = (next: Order) => onChangeOrders((current) => current.map((item) => item.id === next.id ? next : item));
  const current = shippingPromise(new Date());
  const metrics = [{ label: "待审核订单", value: orders.filter((order) => order.status === "待卖家审核").length, icon: ClipboardCheck }, { label: "待发货", value: orders.filter((order) => order.deliveryStatus === "待发货").length, icon: Truck }, { label: "预生成送货单", value: orders.length, icon: ReceiptText }, { label: "客户数", value: new Set(orders.map((order) => order.company)).size, icon: Users }];
  return <div className={s.sellerPage}><aside className={s.sellerSide}><Link className={s.sellerBrand} to="/seller"><span>JZ</span><b>杰帜卖家中心</b></Link>{sellerTabs.map(({ id, label, icon: Icon }) => <Link key={id} className={tab === id ? s.active : ""} to={id === "dashboard" ? "/seller" : "/seller/" + id}><Icon /> {label}</Link>)}<Link to="/"><Store /> 返回商城</Link></aside><section className={s.sellerContent}><div className={s.sellerTop}><div><span>SELLER WORKSPACE · 演示权限</span><h1>{sellerTitle[tab]}</h1></div><div className={s.sellerIdentity}><Bell aria-hidden="true" /><span>{session?.company || "杰帜卖家管理员"}</span></div></div>{tab !== "dashboard" && <div className={s.metricGrid}>{metrics.map(({ label, value, icon: Icon }) => <div key={label}><Icon /><span>{label}</span><b>{value}</b></div>)}</div>}{tab === "dashboard" && <SellerDashboard orders={orders} metrics={metrics} />}{tab === "orders" && <SellerOrders orders={orders} onUpdate={update} />}{tab === "deliveries" && <SellerDelivery orders={orders} onUpdate={update} />}{tab === "products" && <SellerProducts />}{tab === "customers" && <SellerCustomers orders={orders} />}{tab === "stats" && <SellerStats orders={orders} />}{tab === "announcement" && <SellerAnnouncement current={current.text} />}</section></div>;
}

function SellerDashboard({ orders, metrics }: { orders: Order[]; metrics: Array<{ label: string; value: number; icon: typeof ClipboardCheck }> }) {
  const turnover = orders.reduce((sum, order) => sum + order.total, 0);
  return <><section className={s.sellerHeroMetric}><div><span>SELLER CENTER</span><h2>今天，准备处理什么？</h2><p>审核订单、生成固定送货单、安排人工发货，并维护型号与规格库存。</p><div><Link to="/seller/orders">处理订单</Link><Link to="/seller/products">管理商品</Link></div></div><aside><b>{orders.length || 0}</b><span>当前订单</span><small>当前浏览器演示数据</small></aside></section><div className={s.sellerDashboardStats}><div><span>今日访客</span><b>128</b></div><div><span>本月订单</span><b>{orders.length || 15}</b></div><div><span>本月成交额</span><b>{turnover ? money(turnover) : "¥24.5k"}</b></div></div><section className={s.sellerActionGrid}>{[{ icon: Box, title: "商品管理", note: "型号、规格、库存", to: "/seller/products" }, { icon: ClipboardList, title: "订单管理", note: `${metrics[0].value} 笔待审核`, to: "/seller/orders" }, { icon: Users, title: "客户管理", note: "企业采购信息", to: "/seller/customers" }, { icon: BarChart3, title: "数据统计", note: "采购与成交趋势", to: "/seller/stats" }, { icon: ReceiptText, title: "送货单", note: "生成、打印、发货", to: "/seller/deliveries" }, { icon: FileText, title: "公告管理", note: "18:30 发货规则", to: "/seller/announcement" }].map(({ icon: Icon, title, note, to }) => <Link key={title} to={to}><Icon /><span><b>{title}</b><small>{note}</small></span><ChevronRight /></Link>)}</section><section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>在售型号（{productFamilies.length} 个演示型号）</h2><p>商品由“大类 → 型号 → 规格 SKU”管理，主夹和背夹是并列一级类目。</p></div><Link to="/seller/products"><Upload /> 上传新商品</Link></div><div className={s.sellerSkuList}>{productFamilies.slice(0, 3).map((family) => <article key={family.id}><ToolArt compact color={family.color} label={family.name} /><div><b>{family.model}</b><span>{family.name}</span><small>{family.category} · {family.variants.length} 个规格 SKU</small></div><em>在售</em><Link to={`/product/${family.id}`}>查看</Link></article>)}</div></section></>;
}

function SellerOrders({ orders, onUpdate }: { orders: Order[]; onUpdate: (next: Order) => void }) {
  const [filter, setFilter] = useState<"全部" | "待处理" | "待发货" | "已发货" | "已完成">("全部");
  const [deliveryTarget, setDeliveryTarget] = useState<Order | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null);
  const filtered = orders.filter((order) => filter === "全部" || filter === "待处理" && order.status === "待卖家审核" || filter === "待发货" && (order.deliveryStatus === "已自动生成" || order.deliveryStatus === "待发货") || filter === "已发货" && order.status === "已发货" || filter === "已完成" && order.status === "已完成");
  const reject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectTarget) return;
    const reason = String(new FormData(event.currentTarget).get("reason") || "库存或规格需要人工确认").trim();
    onUpdate(withOrderEvent(rejectTarget, { status: "已拒绝" }, "卖家拒绝订单", "seller", reason));
    setRejectTarget(null);
  };
  const generate = () => {
    if (!deliveryTarget) return;
    onUpdate(withOrderEvent(deliveryTarget, { deliveryStatus: "待发货" }, "卖家正式生成送货单", "seller", "已可预览、打印并安排发货"));
    setDeliveryTarget(null);
  };
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>订单处理队列</h2><p>买家提交订单时会预生成送货单编号；卖家确认订单后，再正式生成、打印并安排送货单发货。</p></div><Link to="/products"><Plus /> 新建手工订单</Link></div><div className={s.sellerOrderTabs}>{(["全部", "待处理", "待发货", "已发货", "已完成"] as const).map((item) => <button key={item} className={filter === item ? s.active : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>{filtered.length ? <div className={s.orderCards}>{filtered.map((order) => <OrderCard key={order.id} seller order={order} onUpdate={onUpdate} onReject={setRejectTarget} onGenerateDelivery={setDeliveryTarget} />)}</div> : <Empty icon={<ClipboardList />} title="暂无匹配订单" description="切换处理状态，或等待买家提交新的订单。" />}{deliveryTarget && <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="generate-delivery-title"><section className={s.confirmSheet}><ReceiptText /><h2 id="generate-delivery-title">确认生成送货单？</h2><p>将为订单 <b>{deliveryTarget.orderNo}</b> 确认固定送货单 <b>{deliveryTarget.deliveryNo}</b>，随后可打印单据并安排发货。</p><div><button type="button" className={s.secondaryButton} onClick={() => setDeliveryTarget(null)}>取消</button><button data-testid="confirm-generate-delivery" type="button" className={s.primaryButton} onClick={generate}>确认生成</button></div></section></div>}{rejectTarget && <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="reject-order-title"><form className={s.confirmSheet} onSubmit={reject}><X aria-hidden="true" /><h2 id="reject-order-title">拒绝订单</h2><p>请写明原因，买家将能在订单中心看到本次处理结果。</p><label>处理说明<textarea name="reason" rows={3} placeholder="例如：规格需重新确认，暂不能安排发货" /></label><div><button type="button" className={s.secondaryButton} onClick={() => setRejectTarget(null)}>取消</button><button type="submit" className={s.dangerButton}>确认拒绝</button></div></form></div>}</section>;
}

function SellerDelivery({ orders, onUpdate }: { orders: Order[]; onUpdate: (next: Order) => void }) {
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>固定模板送货单</h2><p>默认固定前缀为 XS，顺序编号从 XS348999 连续递增；正式版本可在后台配置前缀和流水规则。</p></div><Link to="/seller/announcement"><Cog /> 模板与公告</Link></div>{orders.length ? <div className={s.deliveryList}>{orders.map((order) => <article key={order.id}><div><ReceiptText /><span><b>{order.deliveryNo}</b><small>关联订单：{order.orderNo} · {formatDateTime(order.createdAt)}</small></span></div><span>{order.company}</span><b>{order.deliveryStatus}</b><div><Link to={"/seller/delivery/" + order.id}>预览/打印</Link>{order.deliveryStatus === "待发货" && <button data-testid="seller-confirm-shipping" onClick={() => onUpdate(withOrderEvent(order, { deliveryStatus: "已发货", status: "已发货" }, "卖家确认发货", "seller"))}>确认发货</button>}</div></article>)}</div> : <Empty icon={<ReceiptText />} title="暂无送货单" description="买家提交订单后，系统会先预生成固定模板送货单编号。" />}</section>;
}

function SellerProducts() {
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>商品型号与规格</h2><p>大类 → 型号 → 规格 SKU。主夹、背夹是并列一级商品类目。</p></div><button><Upload /> 上传商品</button></div><div className={s.productAdminList}>{productFamilies.map((family) => <article key={family.id}><ToolArt compact color={family.color} label={family.name} /><div><b>{family.name}</b><span>{family.category} · 型号 {family.model}</span><small>{family.variants.length} 个规格 SKU · {family.variants.reduce((sum, item) => sum + item.stock, 0)} 件演示库存</small></div><Link to={"/product/" + family.id}>查看规格</Link></article>)}</div></section>;
}

function SellerCustomers({ orders }: { orders: Order[] }) {
  const customers = Array.from(new Map(orders.map((order) => [order.company, order])).values());
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>客户信息</h2><p>订单成功提交后创建客户关联；真实上线应由权限与数据库控制访问。</p></div></div>{customers.length ? <div className={s.customerGrid}>{customers.map((customer) => <article key={customer.company}><Building2 /><b>{customer.company}</b><span>{customer.contact} · {customer.phone}</span><small>{customer.address}</small><Link to={"/delivery/" + customer.id}>最近送货单</Link></article>)}</div> : <Empty icon={<Users />} title="暂无客户数据" description="客户创建订单后会自动归集到这里。" />}</section>;
}

function SellerStats({ orders }: { orders: Order[] }) {
  const total = orders.reduce((sum, order) => sum + order.total, 0);
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>经营数据（演示）</h2><p>数据直接由当前浏览器订单聚合；真实版本需从订单数据库与财务系统读取。</p></div></div><div className={s.analysisGrid}><div><span>订单金额</span><b>{money(total)}</b><small>当前浏览器演示数据</small></div><div><span>已发货</span><b>{orders.filter((order) => order.status === "已发货").length}</b><small>订单</small></div><div><span>平均订单</span><b>{orders.length ? money(total / orders.length) : "—"}</b><small>按订单金额计算</small></div></div></section>;
}

function SellerAnnouncement({ current }: { current: string }) {
  const [content, setContent] = useState("现货规格 18:30 前下单当天发货；18:30 后下单次日发货。节假日和缺货规格以仓库确认结果为准。");
  const [saved, setSaved] = useState(false);
  return <section className={s.sellerCard}><div className={s.sellerCardHead}><div><h2>商城公告</h2><p>当前系统公告计算结果：{current}</p></div></div><label className={s.announcementEditor}>公告内容<textarea rows={6} value={content} onChange={(event) => setContent(event.target.value)} /></label><button className={s.primaryButton} onClick={() => setSaved(true)}>{saved ? <><Check /> 已保存（演示）</> : "保存公告"}</button></section>;
}

function AccountHub({ orders, session }: { orders: Order[]; session: DemoSession | null }) {
  const ownOrders = orders.filter((order) => !order.buyerId || order.buyerId === session?.id);
  const total = ownOrders.reduce((sum, order) => sum + order.total, 0);
  const statusItems = [
    { label: "待审核", value: ownOrders.filter((order) => buyerOrderState(order) === "待审核").length, icon: ClipboardCheck },
    { label: "待发货", value: ownOrders.filter((order) => buyerOrderState(order) === "待发货").length, icon: Truck },
    { label: "待收货", value: ownOrders.filter((order) => buyerOrderState(order) === "待收货").length, icon: PackageCheck },
    { label: "待付款", value: ownOrders.filter((order) => order.paymentStatus === "模拟待支付").length, icon: ReceiptText },
    { label: "已完成", value: ownOrders.filter((order) => buyerOrderState(order) === "已完成").length, icon: CheckCircle2 },
  ];
  return <div className={cx(s.page, s.buyerAccountPage)}><section className={s.buyerProfile}><div className={s.buyerProfileTop}><div className={s.accountAvatar}><UserRound /></div><div><span>企业采购账户 · 演示身份</span><h1>{session?.company || "企业采购账号"}</h1><p>{session?.phone || "—"} · 登录后可管理订单、地址和常购型号</p></div><Link to="/login" className={s.buyerSwitch}>切换账号</Link></div><div className={s.buyerSpend}><span>本月采购金额</span><b>{total ? money(total) : "¥0.00"}</b><small>仅统计当前演示账号的浏览器订单</small></div></section><div className={s.buyerStatusGrid}>{statusItems.map(({ label, value, icon: Icon }) => <Link key={label} to="/orders"><span><Icon /><i>{value}</i></span><b>{label}</b></Link>)}</div><section className={s.buyerQuickSection}><h2>企业工具箱</h2><div className={s.buyerQuickGrid}><Link to="/orders"><ClipboardList /><span><b>我的订单</b><small>{ownOrders.length} 笔订单</small></span><ChevronRight /></Link><Link to="/orders"><ReceiptText /><span><b>送货单</b><small>查看与打印单据</small></span><ChevronRight /></Link><Link to="/account/addresses"><MapPin /><span><b>收货地址</b><small>常用地址（演示）</small></span><ChevronRight /></Link><Link to="/batch-order"><Upload /><span><b>批量下单</b><small>粘贴型号与数量</small></span><ChevronRight /></Link><Link to="/tool-selector"><Sparkles /><span><b>刀具选型助手</b><small>按工艺辅助推荐</small></span><ChevronRight /></Link><Link to="/purchase-analysis"><BarChart3 /><span><b>采购分析</b><small>当前账号采购汇总</small></span><ChevronRight /></Link></div></section><section className={s.buyerSellerEntry}><Store /><div><b>卖家服务</b><span>商品发布、订单管理与送货单处理需使用卖家账号。</span></div><Link to="/login?role=seller&returnTo=%2Fseller">卖家登录</Link></section><section className={s.contactCard}><div><span>MANUAL SUPPORT</span><h2>需要型号、规格或兼容性核对？</h2><p>与杰帜人工客服联系，确认刀片、主夹、背夹、刀柄与工艺的适配关系。</p></div><Link to="/support">查看联系方式</Link></section></div>;
}

function ToolSelector({ add }: { add: (id: string, quantity?: number) => void }) {
  const [step, setStep] = useState(1);
  const [process, setProcess] = useState("车削");
  const [material, setMaterial] = useState("钢件（ISO P）");
  const [precision, setPrecision] = useState("半精加工");
  const recommended = process === "车削" ? [getFamily("pclnr"), getFamily("cnmg120408")] : [getFamily("em4f"), getFamily("dr5d")];
  return <div className={s.page}><PageTitle eyebrow="TOOL SELECTOR" title="刀具选型助手" note="规则推荐，不替代现场工程师确认" /><div className={s.selectorShell}><aside>{["加工类型", "工件材料", "精度要求", "推荐结果"].map((label, index) => <button className={step === index + 1 ? s.active : ""} key={label} onClick={() => setStep(index + 1)}><b>0{index + 1}</b>{label}</button>)}</aside><section>{step === 1 && <SelectorOptions title="选择加工类型" options={["车削", "铣削"]} value={process} onChange={setProcess} onNext={() => setStep(2)} />}{step === 2 && <SelectorOptions title="选择工件材料" options={["钢件（ISO P）", "不锈钢（ISO M）", "铸铁（ISO K）", "铝合金（ISO N）"]} value={material} onChange={setMaterial} onNext={() => setStep(3)} />}{step === 3 && <SelectorOptions title="选择精度要求" options={["粗加工", "半精加工", "精加工"]} value={precision} onChange={setPrecision} onNext={() => setStep(4)} />}{step === 4 && <div className={s.selectorResult}><span>匹配依据：{process} · {material} · {precision}</span><h2>推荐先核对以下型号</h2>{recommended.map((family) => <article key={family.id}><ToolArt compact color={family.color} label={family.name} /><div><b>{family.model}</b><strong>{family.name}</strong><p>{family.application}</p></div><button onClick={() => add(family.variants[0].id, family.variants[0].moq)}>加入采购车</button><Link to={"/product/" + family.id}>查看规格</Link></article>)}<p className={s.selectorDisclaimer}>推荐使用公开的产品属性规则，不会凭空生成精确切削参数。实际型号与参数应由工程师按现场工况核验。</p></div>}</section></div></div>;
}

function SelectorOptions({ title, options, value, onChange, onNext }: { title: string; options: string[]; value: string; onChange: (value: string) => void; onNext: () => void }) {
  return <div className={s.selectorOptions}><h2>{title}</h2><div>{options.map((option) => <button key={option} className={value === option ? s.selected : ""} onClick={() => onChange(option)}>{option}</button>)}</div><button className={s.primaryButton} onClick={onNext}>下一步 <ArrowRight /></button></div>;
}

function BatchOrder({ add }: { add: (id: string, quantity?: number) => void }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<Array<{ product: Product; quantity: number }>>([]);
  const parse = () => {
    const parsed = value.split(/\n|,/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [code, rawQty] = line.split(/\s*[×x*]\s*/i);
      const product = productFamilies.flatMap((family) => family.variants).map((variant) => getProduct(variant.id)).find((item) => item.sku.toLowerCase() === code.toLowerCase());
      return product ? { product, quantity: Math.max(product.moq, Number(rawQty) || product.moq) } : null;
    }).filter((item): item is { product: Product; quantity: number } => Boolean(item));
    setResults(parsed);
  };
  return <div className={s.page}><PageTitle eyebrow="BATCH PURCHASE" title="批量输入型号下单" note="支持一行一个 SKU，格式：PCLNR2525M12 × 2" /><div className={s.batchLayout}><section className={s.formCard}><h2>粘贴型号与数量</h2><textarea rows={10} value={value} onChange={(event) => setValue(event.target.value)} placeholder={"PCLNR2525M12 × 2\nCNMG120408-PM4325 × 50\nEM-4F-D10-75 × 10"} /><button className={s.primaryButton} onClick={parse}><Search /> 识别 SKU</button><p>当前演示仅识别已建立的 SKU；真实版本将支持 Excel 导入、错误行提示、客户料号映射和库存校验。</p></section><section className={s.batchResult}><h2>识别结果</h2>{results.length ? <>{results.map(({ product, quantity }) => <div key={product.id}><span><b>{product.sku}</b><small>{product.familyName} · {product.label}</small></span><strong>×{quantity}</strong><button onClick={() => add(product.id, quantity)}>加购</button></div>)}<Link className={s.primary} to="/cart">前往采购车 <ChevronRight /></Link></> : <Empty icon={<Upload />} title="等待识别型号" description="请输入系统已建立的 SKU 与数量。" />}</section></div></div>;
}

function PurchaseAnalysis({ orders, session }: { orders: Order[]; session: DemoSession | null }) {
  const ownOrders = orders.filter((order) => !order.buyerId || order.buyerId === session?.id);
  const total = ownOrders.reduce((sum, order) => sum + order.total, 0);
  return <div className={s.page}><PageTitle eyebrow="PURCHASE ANALYSIS" title="采购分析" note="当前为本演示账号的浏览器订单汇总" /><div className={s.analysisGrid}><div><span>累计订单</span><b>{ownOrders.length}</b><small>笔</small></div><div><span>累计采购额</span><b>{money(total)}</b><small>参考金额</small></div><div><span>常购型号</span><b>{new Set(ownOrders.flatMap((order) => order.items.map((item) => item.model))).size}</b><small>个</small></div></div><section className={s.sellerCard}><h2>后续真实版本</h2><ul className={s.plainList}><li>按企业、时间、型号、供应商与结算方式统计；</li><li>导出真实订单与送货单数据；</li><li>接入 ERP/WMS 后展示真实库存、交期和采购频次。</li></ul></section></div>;
}

function SupportPage() {
  return <div className={s.page}><PageTitle eyebrow="ENTERPRISE SERVICE" title="企业服务与人工支持" note="国内一期以人工客服和业务核对为主" /><div className={s.supportGrid}><article><Headphones /><h2>型号与规格核对</h2><p>下单前协助核对主夹、背夹、刀片、刀柄及加工对象的适配关系。</p><b>电话：13902607662</b></article><article><Truck /><h2>发货与物流</h2><p>18:30 前下单的现货规格预计当天发；之后预计次日发。</p><b>物流：顺丰 / 圆通 / 中通 / 自提</b></article><article><ReceiptText /><h2>送货单与结算</h2><p>订单自动生成固定模板送货单，卖家审核后可打印、导出和人工盖章。</p><b>单据前缀：XS</b></article></div></div>;
}

function AboutPage() {
  return <div className={s.page}><PageTitle eyebrow="ABOUT JIEZHI" title="杰帜数控刀具" note="工业刀具 B2B 采购与订单管理原型" /><section className={s.aboutCard}><Building2 /><div><h2>面向型号化采购的工业刀具商城</h2><p>当前版本聚焦国内客户的型号搜索、规格选择、直接下单、送货单和卖家处理流程。商品图片、库存、售价、税率与切削参数必须在接入真实商品资料后更新。</p><p>网站使用的加工场景照片为公共领域素材，详情见项目素材来源清单。</p></div></section></div>;
}

function Announcement({ onClose }: { onClose: () => void }) {
  return <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="announcement-title"><section className={s.announcement}><button aria-label="关闭公告" onClick={onClose}><X /></button><span><Truck /> 发货公告</span><h2 id="announcement-title">当天发货截止时间：18:30</h2><p>现货规格在 <b>18:30 前</b> 完成下单，预计当天发货；<b>18:30 后</b> 下单，预计次日发货。缺货、预售与节假日以仓库确认结果为准。</p><div><Link className={s.primary} to="/products" onClick={onClose}>去选型号</Link><button className={s.secondaryButton} onClick={onClose}>我知道了</button></div></section></div>;
}

function PageTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return <div className={s.pageTitle}><div><span>{eyebrow}</span><h1>{title}</h1></div><small>{note}</small></div>;
}

function Empty({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className={s.empty}>{icon}<h2>{title}</h2><p>{description}</p>{action}</div>;
}

function NotFound() {
  return <div className={s.page}><Empty icon={<Menu />} title="页面不存在" description="请从型号中心、采购车或订单中心继续操作。" action={<Link to="/">返回首页</Link>} /></div>;
}

function Footer() {
  return <footer className={s.footer}><div className={s.footerMain}><div><Link className={s.brand} to="/"><span className={s.mark}>JZ</span><span><b>杰帜数控刀具</b><small>JIEZHI CNC TOOLS</small></span></Link><p>以型号、规格、订单与送货单为核心的工业刀具采购系统原型。</p></div><div><b>采购入口</b><Link to="/products">型号中心</Link><Link to="/products?category=主夹">主夹</Link><Link to="/products?category=背夹">背夹</Link></div><div><b>企业功能</b><Link to="/batch-order">批量下单</Link><Link to="/orders">订单中心</Link><Link to="/seller">卖家中心</Link></div><div><b>订单服务</b><span>18:30 前下单当天发</span><span>电话：13902607662</span><Link to="/support">人工技术支持</Link></div></div><small>商品、库存、价格、税率及规格参数当前均为演示数据；上线前须由杰帜商品主数据核验。CNC 场景图：美国国防部公共领域素材。</small></footer>;
}

function MobileNav({ cartCount, session }: { cartCount: number; session: DemoSession | null }) {
  if (session?.role === "seller") {
    return <nav className={s.mobileNav} aria-label="卖家底部导航"><Link to="/seller"><LayoutDashboard /><span>工作台</span></Link><Link to="/seller/orders"><ClipboardList /><span>订单</span></Link><Link to="/seller/products"><Box /><span>商品</span></Link><Link to="/seller/deliveries"><ReceiptText /><span>送货单</span></Link><Link to="/login"><UserRound /><span>我的</span></Link></nav>;
  }
  return <nav className={s.mobileNav} aria-label="买家底部导航"><Link to="/"><Store /><span>首页</span></Link><Link to="/products"><Box /><span>分类</span></Link><Link to="/tool-selector"><Sparkles /><span>选型</span></Link><Link to="/cart"><ShoppingCart /><span>采购车</span>{cartCount ? <i>{cartCount}</i> : null}</Link><Link to={session ? "/account" : "/login"}><UserRound /><span>我的</span></Link></nav>;
}

export default App;
