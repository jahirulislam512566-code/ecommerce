import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return default settings
    // In production, fetch from database
    const settings = {
      general: {
        storeName: "E-Store",
        storeEmail: "admin@estore.com",
        storePhone: "+1 (555) 123-4567",
        storeAddress: "123 Commerce Street, New York, NY 10001",
        storeCurrency: "USD",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
      },
      shipping: {
        freeShippingThreshold: 50,
        standardShippingCost: 5,
        expressShippingCost: 15,
        internationalShipping: false,
        domesticDeliveryDays: 5,
        internationalDeliveryDays: 14,
      },
      payment: {
        stripeEnabled: false,
        stripePublishableKey: "",
        stripeSecretKey: "",
        paypalEnabled: false,
        paypalClientId: "",
        paypalClientSecret: "",
        codEnabled: true,
        bankTransferEnabled: false,
        bankDetails: "",
      },
      notifications: {
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
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 60,
        passwordExpiryDays: 90,
        maxLoginAttempts: 5,
        ipWhitelist: [],
        requireEmailVerification: true,
      },
      seo: {
        metaTitle: "E-Store - Best Online Shopping",
        metaDescription: "Shop the best products at unbeatable prices. Free shipping on orders over $50.",
        metaKeywords: "ecommerce, shop, online shopping",
        googleAnalyticsId: "",
        facebookPixelId: "",
        robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/",
        sitemapEnabled: true,
      },
      social: {
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: "",
        linkedin: "",
        github: "",
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();
    
    // In production, save to database
    // await prisma.settings.upsert({ ... });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}