const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

// Define categories
const categories = [
  { name: "Electronics", slug: "electronics", description: "Latest electronic devices and gadgets" },
  { name: "Clothing", slug: "clothing", description: "Fashionable clothing for men and women" },
  { name: "Home & Living", slug: "home-living", description: "Beautiful home decor and furniture" },
  { name: "Sports", slug: "sports", description: "Sports equipment and gear" },
  { name: "Books", slug: "books", description: "Best-selling books and magazines" },
  { name: "Toys", slug: "toys", description: "Fun toys and games for all ages" },
  { name: "Beauty", slug: "beauty", description: "Cosmetics and beauty products" },
  { name: "Groceries", slug: "groceries", description: "Fresh groceries and staples" },
];

// Define products for each category
const productsData = {
  Electronics: [
    { name: "Wireless Headphones", price: 99.99, comparePrice: 149.99, stock: 45, featured: true },
    { name: "Smart Watch Pro", price: 249.99, comparePrice: 299.99, stock: 30, featured: true },
    { name: "Bluetooth Speaker", price: 79.99, comparePrice: 119.99, stock: 60 },
    { name: "4K Action Camera", price: 199.99, comparePrice: 279.99, stock: 25 },
    { name: "Gaming Mouse", price: 49.99, comparePrice: 69.99, stock: 120 },
    { name: "Mechanical Keyboard", price: 89.99, comparePrice: 129.99, stock: 75 },
    { name: "USB-C Hub", price: 39.99, comparePrice: 59.99, stock: 200 },
    { name: "Laptop Stand", price: 34.99, stock: 90 },
    { name: "HD Webcam", price: 69.99, comparePrice: 99.99, stock: 40 },
    { name: "Noise Cancelling Earbuds", price: 129.99, comparePrice: 199.99, stock: 55, featured: true },
    { name: "Tablet 10 Inch", price: 299.99, comparePrice: 399.99, stock: 20 },
    { name: "Smartphone Gimbal", price: 89.99, comparePrice: 129.99, stock: 35 },
    { name: "Portable SSD", price: 119.99, comparePrice: 169.99, stock: 45 },
    { name: "WiFi Router", price: 79.99, comparePrice: 109.99, stock: 50 },
  ],
  Clothing: [
    { name: "Cotton T-Shirt", price: 24.99, comparePrice: 39.99, stock: 200, featured: true },
    { name: "Denim Jeans", price: 59.99, comparePrice: 89.99, stock: 150 },
    { name: "Winter Jacket", price: 129.99, comparePrice: 199.99, stock: 50, featured: true },
    { name: "Running Shoes", price: 89.99, comparePrice: 129.99, stock: 100 },
    { name: "Baseball Cap", price: 19.99, comparePrice: 29.99, stock: 250 },
    { name: "Wool Scarf", price: 29.99, comparePrice: 49.99, stock: 80 },
    { name: "Leather Belt", price: 34.99, comparePrice: 54.99, stock: 120 },
    { name: "Polarized Sunglasses", price: 49.99, comparePrice: 79.99, stock: 90 },
    { name: "Laptop Backpack", price: 69.99, comparePrice: 99.99, stock: 60 },
    { name: "Classic Watch", price: 149.99, comparePrice: 229.99, stock: 40 },
    { name: "Hoodie Sweatshirt", price: 54.99, comparePrice: 79.99, stock: 130 },
    { name: "Summer Dress", price: 44.99, comparePrice: 69.99, stock: 110 },
    { name: "Formal Shirt", price: 39.99, comparePrice: 59.99, stock: 140 },
    { name: "Yoga Pants", price: 34.99, comparePrice: 54.99, stock: 160 },
  ],
  "Home & Living": [
    { name: "Floor Lamp", price: 79.99, comparePrice: 119.99, stock: 30 },
    { name: "Decorative Vase", price: 39.99, comparePrice: 59.99, stock: 45 },
    { name: "Wall Clock", price: 49.99, comparePrice: 79.99, stock: 60 },
    { name: "Coffee Table", price: 199.99, comparePrice: 299.99, stock: 20, featured: true },
    { name: "Throw Pillow", price: 29.99, comparePrice: 49.99, stock: 100 },
    { name: "Area Rug", price: 149.99, comparePrice: 229.99, stock: 25 },
    { name: "Bookshelf", price: 179.99, comparePrice: 269.99, stock: 15 },
    { name: "Bed Sheets Set", price: 59.99, comparePrice: 89.99, stock: 80 },
    { name: "Kitchen Knife Set", price: 89.99, comparePrice: 139.99, stock: 50 },
    { name: "Cookware Set", price: 129.99, comparePrice: 199.99, stock: 35 },
    { name: "Ceramic Dinner Set", price: 79.99, comparePrice: 119.99, stock: 40 },
    { name: "Bath Towel Set", price: 34.99, comparePrice: 54.99, stock: 90 },
    { name: "Picture Frame", price: 24.99, comparePrice: 39.99, stock: 120 },
    { name: "Scented Candles", price: 19.99, comparePrice: 29.99, stock: 150 },
  ],
  Sports: [
    { name: "Yoga Mat", price: 29.99, comparePrice: 49.99, stock: 120 },
    { name: "Dumbbell Set", price: 79.99, comparePrice: 119.99, stock: 40 },
    { name: "Jump Rope", price: 14.99, comparePrice: 24.99, stock: 200 },
    { name: "Resistance Bands", price: 24.99, comparePrice: 39.99, stock: 150 },
    { name: "Basketball", price: 34.99, comparePrice: 54.99, stock: 80 },
    { name: "Soccer Ball", price: 39.99, comparePrice: 59.99, stock: 75 },
    { name: "Tennis Racket", price: 59.99, comparePrice: 89.99, stock: 45 },
    { name: "Fitness Tracker", price: 69.99, comparePrice: 99.99, stock: 60, featured: true },
    { name: "Water Bottle", price: 19.99, comparePrice: 29.99, stock: 300 },
    { name: "Gym Bag", price: 44.99, comparePrice: 69.99, stock: 90 },
    { name: "Boxing Gloves", price: 49.99, comparePrice: 79.99, stock: 55 },
    { name: "Exercise Ball", price: 29.99, comparePrice: 44.99, stock: 70 },
    { name: "Running Belt", price: 24.99, comparePrice: 34.99, stock: 110 },
    { name: "Foam Roller", price: 19.99, comparePrice: 29.99, stock: 130 },
  ],
};

// Product images
const productImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
];

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log("🌱 Starting to seed products...\n");

  // Create categories
  console.log("📁 Creating categories...");
  const categoryMap = {};
  
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });
    
    if (!existing) {
      const created = await prisma.category.create({
        data: category,
      });
      categoryMap[category.name] = created;
      console.log(`  ✅ Created category: ${category.name}`);
    } else {
      categoryMap[category.name] = existing;
      console.log(`  ⏭️ Category already exists: ${category.name}`);
    }
  }

  console.log("\n📦 Creating products...\n");

  let totalProducts = 0;

  // Create products for each category
  for (const [categoryName, products] of Object.entries(productsData)) {
    const category = categoryMap[categoryName];
    if (!category) {
      console.log(`  ⚠️ Category not found: ${categoryName}`);
      continue;
    }

    console.log(`\n  📂 Processing ${categoryName}...`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const slug = generateSlug(product.name);
      const uniqueSlug = `${slug}-${Date.now()}-${i}`;
      const imageIndex = totalProducts % productImages.length;
      
      const tags = [categoryName.toLowerCase(), "popular"];
      if (product.featured) tags.push("featured");
      
      try {
        await prisma.product.create({
          data: {
            name: product.name,
            slug: uniqueSlug,
            description: `Experience the best quality with our ${product.name}. Perfect for everyday use. Made with premium materials.`,
            shortDescription: `${product.name} - Premium quality product.`,
            price: product.price,
            comparePrice: product.comparePrice || null,
            sku: `SKU-${String(totalProducts + 1).padStart(4, '0')}`,
            quantity: product.stock,
            lowStockThreshold: 5,
            status: "ACTIVE",
            visibility: "PUBLISHED",
            featured: product.featured || false,
            tags: tags,
            categoryId: category.id,
            images: {
              create: [
                {
                  url: productImages[imageIndex],
                  altText: product.name,
                  isPrimary: true,
                  order: 0,
                },
              ],
            },
          },
        });
        
        totalProducts++;
        
        if (totalProducts % 10 === 0) {
          console.log(`    ✅ Created ${totalProducts} products...`);
        }
      } catch (error) {
        console.error(`    ❌ Failed to create product: ${product.name}`, error.message);
      }
    }
  }

  console.log(`\n🎉 Successfully created ${totalProducts} products!`);
  
  // Get final counts
  const finalProductCount = await prisma.product.count();
  const finalCategoryCount = await prisma.category.count();
  
  console.log("\n📊 Database Summary:");
  console.log(`  - Categories: ${finalCategoryCount}`);
  console.log(`  - Products: ${finalProductCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });