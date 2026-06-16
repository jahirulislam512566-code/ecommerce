"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Settings, 
  Store, 
  DollarSign, 
  Truck, 
  CreditCard, 
  Bell, 
  Shield, 
  Globe, 
  Mail,
  Smartphone,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Share2, // Add this if using Share2
} from "lucide-react";
import Image from "next/image";

// Types
interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCurrency: string;
  timezone: string;
  dateFormat: string;
  logo?: string;
  favicon?: string;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  domesticDeliveryDays: number;
  internationalDeliveryDays: number;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankDetails: string;
}

interface NotificationSettings {
  orderConfirmation: boolean;
  paymentReceived: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
  newUserRegistered: boolean;
  newReview: boolean;
  adminEmail: string;
  adminEmailNotifications: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  requireEmailVerification: boolean;
}

interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
}

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  github: string;
}

export default function AdminSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "payment" | "notifications" | "security" | "seo" | "social">("general");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Form states
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    storeName: "E-Store",
    storeEmail: "admin@estore.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Commerce Street, New York, NY 10001",
    storeCurrency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
  });
  
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 50,
    standardShippingCost: 5,
    expressShippingCost: 15,
    internationalShipping: false,
    domesticDeliveryDays: 5,
    internationalDeliveryDays: 14,
  });
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalEnabled: false,
    paypalClientId: "",
    paypalClientSecret: "",
    codEnabled: true,
    bankTransferEnabled: false,
    bankDetails: "Bank: Chase Bank\nAccount: 123456789\nRouting: 021000021",
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderConfirmation: true,
    paymentReceived: true,
    orderShipped: true,
    orderDelivered: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    newUserRegistered: false,
    newReview: false,
    adminEmail: "admin@estore.com",
    adminEmailNotifications: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    requireEmailVerification: true,
  });
  
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    metaTitle: "E-Store - Best Online Shopping",
    metaDescription: "Shop the best products at unbeatable prices. Free shipping on orders over $50. 30-day return policy.",
    metaKeywords: "ecommerce, shop, online shopping, best deals, buy online",
    googleAnalyticsId: "",
    facebookPixelId: "",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://estore.com/sitemap.xml",
    sitemapEnabled: true,
  });
  
  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    facebook: "https://facebook.com/estore",
    twitter: "https://twitter.com/estore",
    instagram: "https://instagram.com/estore",
    youtube: "https://youtube.com/estore",
    linkedin: "https://linkedin.com/company/estore",
    github: "https://github.com/estore",
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.general) setGeneralSettings(data.general);
        if (data.shipping) setShippingSettings(data.shipping);
        if (data.payment) setPaymentSettings(data.payment);
        if (data.notifications) setNotificationSettings(data.notifications);
        if (data.security) setSecuritySettings(data.security);
        if (data.seo) setSeoSettings(data.seo);
        if (data.social) setSocialSettings(data.social);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSaved(false);
    
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general: generalSettings,
          shipping: shippingSettings,
          payment: paymentSettings,
          notifications: notificationSettings,
          security: securitySettings,
          seo: seoSettings,
          social: socialSettings,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to save settings");
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // In the tabs array, you can also use a simple div with emoji:
const tabs = [
  { id: "general", label: "General", icon: Store },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "social", label: "Social", icon: () => <span className="text-lg">🌐</span> },
];

  if (isLoading && !generalSettings.storeName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your store configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Settings saved successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={generalSettings.storeName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={generalSettings.storeEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Phone
              </label>
              <input
                type="tel"
                value={generalSettings.storePhone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={generalSettings.storeCurrency}
                onChange={(e) => setGeneralSettings({ ...generalSettings, storeCurrency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone
              </label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT (London)</option>
                <option value="Asia/Dubai">GST (Dubai)</option>
                <option value="Asia/Tokyo">JST (Tokyo)</option>
                <option value="Australia/Sydney">AEDT (Sydney)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Format
              </label>
              <select
                value={generalSettings.dateFormat}
                onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Store Address
            </label>
            <textarea
              rows={3}
              value={generalSettings.storeAddress}
              onChange={(e) => setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === "shipping" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Shipping Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingSettings.freeShippingThreshold}
                onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Standard Shipping Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingSettings.standardShippingCost}
                onChange={(e) => setShippingSettings({ ...shippingSettings, standardShippingCost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Express Shipping Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingSettings.expressShippingCost}
                onChange={(e) => setShippingSettings({ ...shippingSettings, expressShippingCost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domestic Delivery Days
              </label>
              <input
                type="number"
                value={shippingSettings.domesticDeliveryDays}
                onChange={(e) => setShippingSettings({ ...shippingSettings, domesticDeliveryDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                International Delivery Days
              </label>
              <input
                type="number"
                value={shippingSettings.internationalDeliveryDays}
                onChange={(e) => setShippingSettings({ ...shippingSettings, internationalDeliveryDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="internationalShipping"
              checked={shippingSettings.internationalShipping}
              onChange={(e) => setShippingSettings({ ...shippingSettings, internationalShipping: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="internationalShipping" className="text-sm text-gray-700 dark:text-gray-300">
              Enable International Shipping
            </label>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === "payment" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Payment Settings</h2>
          
          {/* Stripe */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Stripe</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.stripeEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {paymentSettings.stripeEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publishable Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.stripePublishable ? "text" : "password"}
                      value={paymentSettings.stripePublishableKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublishableKey: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                      placeholder="pk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("stripePublishable")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showKeys.stripePublishable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.stripeSecret ? "text" : "password"}
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                      placeholder="sk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("stripeSecret")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showKeys.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* PayPal */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">PayPal</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.paypalEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {paymentSettings.paypalEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.paypalClientId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.paypalSecret ? "text" : "password"}
                      value={paymentSettings.paypalClientSecret}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientSecret: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("paypalSecret")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showKeys.paypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Other Payment Methods */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Cash on Delivery (COD)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.codEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, codEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Bank Transfer</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.bankTransferEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransferEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {paymentSettings.bankTransferEnabled && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Details
                </label>
                <textarea
                  rows={4}
                  value={paymentSettings.bankDetails}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bankDetails: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Order Confirmation</p>
                <p className="text-sm text-gray-500">Send email when order is placed</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.orderConfirmation}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, orderConfirmation: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Payment Received</p>
                <p className="text-sm text-gray-500">Send email when payment is received</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.paymentReceived}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentReceived: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Order Shipped</p>
                <p className="text-sm text-gray-500">Send email when order is shipped</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.orderShipped}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, orderShipped: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Order Delivered</p>
                <p className="text-sm text-gray-500">Send email when order is delivered</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.orderDelivered}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, orderDelivered: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Low Stock Alert</p>
                <p className="text-sm text-gray-500">Notify when product stock is low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.lowStockAlert}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlert: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {notificationSettings.lowStockAlert && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={notificationSettings.lowStockThreshold}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-48 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Notify when stock falls below this number</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Email for Notifications
            </label>
            <input
              type="email"
              value={notificationSettings.adminEmail}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, adminEmail: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                id="adminEmailNotifications"
                checked={notificationSettings.adminEmailNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, adminEmailNotifications: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="adminEmailNotifications" className="text-sm text-gray-700 dark:text-gray-300">
                Send admin email notifications
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your admin account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordExpiryDays}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiryDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Lock account after this many failed attempts</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={securitySettings.requireEmailVerification}
                onChange={(e) => setSecuritySettings({ ...securitySettings, requireEmailVerification: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="requireEmailVerification" className="text-sm text-gray-700 dark:text-gray-300">
                Require email verification for new users
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === "seo" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">SEO Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={seoSettings.metaTitle}
                onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended length: 50-60 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={seoSettings.metaDescription}
                onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended length: 150-160 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={seoSettings.metaKeywords}
                onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="ecommerce, shop, online shopping"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={seoSettings.googleAnalyticsId}
                  onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={seoSettings.facebookPixelId}
                  onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXXXXXXXXXXXXX"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                robots.txt
              </label>
              <textarea
                rows={6}
                value={seoSettings.robotsTxt}
                onChange={(e) => setSeoSettings({ ...seoSettings, robotsTxt: e.target.value })}
                className="w-full px-3 py-2 font-mono text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sitemapEnabled"
                checked={seoSettings.sitemapEnabled}
                onChange={(e) => setSeoSettings({ ...seoSettings, sitemapEnabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="sitemapEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                Auto-generate sitemap
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Settings */}
      {activeTab === "social" && (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Social Media Links</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">📘</span>
          Facebook
        </label>
        <input
          type="url"
          value={socialSettings.facebook}
          onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://facebook.com/yourpage"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">🐦</span>
          Twitter / X
        </label>
        <input
          type="url"
          value={socialSettings.twitter}
          onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://twitter.com/yourhandle"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">📷</span>
          Instagram
        </label>
        <input
          type="url"
          value={socialSettings.instagram}
          onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://instagram.com/yourhandle"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">📺</span>
          YouTube
        </label>
        <input
          type="url"
          value={socialSettings.youtube}
          onChange={(e) => setSocialSettings({ ...socialSettings, youtube: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://youtube.com/c/yourchannel"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">🔗</span>
          LinkedIn
        </label>
        <input
          type="url"
          value={socialSettings.linkedin}
          onChange={(e) => setSocialSettings({ ...socialSettings, linkedin: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://linkedin.com/company/yourcompany"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span className="text-lg inline mr-2">🐙</span>
          GitHub
        </label>
        <input
          type="url"
          value={socialSettings.github}
          onChange={(e) => setSocialSettings({ ...socialSettings, github: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/yourusername"
        />
      </div>
    </div>
  </div>
)}
      </div>
  );
}