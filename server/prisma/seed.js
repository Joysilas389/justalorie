const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Justalorie database...');

  // Skip if already seeded
  const existingFoods = await prisma.foodItem.count();
  if (existingFoods > 0) {
    console.log(`✅ Database already has ${existingFoods} food items. Skipping seed.`);
    return;
  }

  // ─── Categories ──────────────────────────────────────────────────────────
  const categories = [
    { name: 'Local Dishes', slug: 'local-dishes', icon: 'bi-egg-fried', sortOrder: 1, description: 'Traditional Ghanaian main dishes' },
    { name: 'Local Fruits', slug: 'local-fruits', icon: 'bi-apple', sortOrder: 2, description: 'Ghanaian and West African fruits' },
    { name: 'Local Vegetables', slug: 'local-vegetables', icon: 'bi-flower1', sortOrder: 3, description: 'Local Ghanaian vegetables' },
    { name: 'Continental Dishes', slug: 'continental-dishes', icon: 'bi-globe', sortOrder: 4, description: 'International / continental foods' },
    { name: 'Fruits', slug: 'fruits', icon: 'bi-apple', sortOrder: 5, description: 'General fruits' },
    { name: 'Vegetables', slug: 'vegetables', icon: 'bi-tree', sortOrder: 6, description: 'General vegetables' },
    { name: 'Local Drinks', slug: 'local-drinks', icon: 'bi-cup-straw', sortOrder: 7, description: 'Ghanaian beverages' },
    { name: 'Snacks / Street Foods', slug: 'snacks-street-foods', icon: 'bi-shop', sortOrder: 8, description: 'Ghanaian street food and snacks' },
    { name: 'Canned / Tinned Foods', slug: 'canned-tinned-foods', icon: 'bi-box-seam', sortOrder: 9, description: 'Canned and tinned food products' },
    { name: 'Bottled & Canned Drinks', slug: 'bottled-canned-drinks', icon: 'bi-cup', sortOrder: 10, description: 'Soft drinks, minerals, and malt drinks' },
    { name: 'Malt Drinks', slug: 'malt-drinks', icon: 'bi-cup-hot', sortOrder: 11, description: 'Malt-based beverages' },
    { name: 'Bread & Bakery', slug: 'bread-bakery', icon: 'bi-basket', sortOrder: 12, description: 'Bread, pastries, and bakery items' },
  ];

  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.foodCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    catMap[cat.slug] = created.id;
  }

  // ─── Food Items ──────────────────────────────────────────────────────────
  const foods = [
    // LOCAL DISHES
    { name: 'Waakye', localName: 'Waakye', categoryId: catMap['local-dishes'], caloriesPer100g: 130, standardServingG: 350, servingDescription: '1 plate waakye', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 4.5, carbsPer100g: 24, fatPer100g: 1.5 },
    { name: 'Banku', localName: 'Banku', categoryId: catMap['local-dishes'], caloriesPer100g: 100, standardServingG: 300, servingDescription: '1 ball of banku', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 2, carbsPer100g: 22, fatPer100g: 0.5 },
    { name: 'Kenkey', localName: 'Kenkey (Ga/Fante)', categoryId: catMap['local-dishes'], caloriesPer100g: 110, standardServingG: 280, servingDescription: '1 ball of kenkey', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 2.5, carbsPer100g: 24, fatPer100g: 0.8 },
    { name: 'Fufu', localName: 'Fufu', categoryId: catMap['local-dishes'], caloriesPer100g: 155, standardServingG: 400, servingDescription: '1 serving fufu', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 1.5, carbsPer100g: 37, fatPer100g: 0.3 },
    { name: 'Tuo Zaafi', localName: 'TZ / Tuo Zaafi', categoryId: catMap['local-dishes'], caloriesPer100g: 95, standardServingG: 350, servingDescription: '1 ball of TZ', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 2.5, carbsPer100g: 20, fatPer100g: 0.5 },
    { name: 'Ampesi (Yam)', localName: 'Ampesi', categoryId: catMap['local-dishes'], caloriesPer100g: 120, standardServingG: 300, servingDescription: '1 plate ampesi', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 1.5, carbsPer100g: 28, fatPer100g: 0.2 },
    { name: 'Jollof Rice', localName: 'Jollof', categoryId: catMap['local-dishes'], caloriesPer100g: 170, standardServingG: 300, servingDescription: '1 plate jollof rice', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 3.5, carbsPer100g: 28, fatPer100g: 5 },
    { name: 'Plain Rice', localName: 'Plain Rice', categoryId: catMap['local-dishes'], caloriesPer100g: 130, standardServingG: 250, servingDescription: '1 plate plain rice', preparationType: 'BOILED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
    { name: 'Fried Rice', localName: 'Fried Rice', categoryId: catMap['local-dishes'], caloriesPer100g: 185, standardServingG: 300, servingDescription: '1 plate fried rice', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 4, carbsPer100g: 25, fatPer100g: 7 },
    { name: 'Red Red', localName: 'Red Red (Beans & Plantain)', categoryId: catMap['local-dishes'], caloriesPer100g: 145, standardServingG: 350, servingDescription: '1 plate red red', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 6, carbsPer100g: 22, fatPer100g: 4 },
    { name: 'Gob3 / Beans & Gari', localName: 'Gob3', categoryId: catMap['local-dishes'], caloriesPer100g: 160, standardServingG: 350, servingDescription: '1 plate beans and gari', preparationType: 'MIXED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 7, carbsPer100g: 26, fatPer100g: 3 },
    { name: 'Gari Soakings', localName: 'Gari Soakings', categoryId: catMap['local-dishes'], caloriesPer100g: 150, standardServingG: 250, servingDescription: '1 bowl gari soakings', preparationType: 'MIXED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 3, carbsPer100g: 32, fatPer100g: 2 },
    { name: 'Boiled Yam', localName: 'Boiled Yam', categoryId: catMap['local-dishes'], caloriesPer100g: 118, standardServingG: 250, servingDescription: '2-3 pieces boiled yam', preparationType: 'BOILED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.5, carbsPer100g: 28, fatPer100g: 0.2 },
    { name: 'Fried Yam', localName: 'Fried Yam', categoryId: catMap['local-dishes'], caloriesPer100g: 220, standardServingG: 250, servingDescription: '1 plate fried yam', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 2, carbsPer100g: 30, fatPer100g: 10 },
    { name: 'Boiled Plantain', localName: 'Boiled Plantain', categoryId: catMap['local-dishes'], caloriesPer100g: 122, standardServingG: 200, servingDescription: '2-3 pieces boiled plantain', preparationType: 'BOILED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.3, carbsPer100g: 32, fatPer100g: 0.4 },
    { name: 'Kontomire Stew', localName: 'Kontomire Stew', categoryId: catMap['local-dishes'], caloriesPer100g: 80, standardServingG: 150, servingDescription: '1 ladle kontomire stew', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 3, carbsPer100g: 6, fatPer100g: 5 },
    { name: 'Okro Stew', localName: 'Okro Stew / Soup', categoryId: catMap['local-dishes'], caloriesPer100g: 65, standardServingG: 200, servingDescription: '1 ladle okro stew', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 3, carbsPer100g: 8, fatPer100g: 2.5 },
    { name: 'Light Soup', localName: 'Light Soup', categoryId: catMap['local-dishes'], caloriesPer100g: 45, standardServingG: 250, servingDescription: '1 bowl light soup', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 4, carbsPer100g: 5, fatPer100g: 1.5 },
    { name: 'Groundnut Soup', localName: 'Groundnut Soup / Nkate Nkwan', categoryId: catMap['local-dishes'], caloriesPer100g: 120, standardServingG: 250, servingDescription: '1 bowl groundnut soup', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 5, carbsPer100g: 8, fatPer100g: 8 },
    { name: 'Palm Nut Soup', localName: 'Palm Nut Soup / Abenkwan', categoryId: catMap['local-dishes'], caloriesPer100g: 130, standardServingG: 250, servingDescription: '1 bowl palm nut soup', preparationType: 'STEWED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 4, carbsPer100g: 7, fatPer100g: 10 },

    // SNACKS / STREET FOODS
    { name: 'Kelewele', localName: 'Kelewele', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 230, standardServingG: 150, servingDescription: '1 portion kelewele', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 1.5, carbsPer100g: 35, fatPer100g: 9 },
    { name: 'Hausa Koko', localName: 'Hausa Koko', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 55, standardServingG: 300, servingDescription: '1 bowl (300ml) hausa koko', preparationType: 'BOILED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 0.5 },
    { name: 'Koose', localName: 'Koose / Akara', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 280, caloriesPerUnit: 70, standardServingG: 25, servingDescription: '1 piece koose', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 12, carbsPer100g: 20, fatPer100g: 16 },
    { name: 'Bofrot', localName: 'Bofrot / Puff Puff', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 350, caloriesPerUnit: 105, standardServingG: 30, servingDescription: '1 piece bofrot', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 5, carbsPer100g: 45, fatPer100g: 16 },
    { name: 'Roasted Corn', localName: 'Roasted Corn', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 168, caloriesPerUnit: 200, standardServingG: 120, servingDescription: '1 cob roasted corn', preparationType: 'ROASTED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 5, carbsPer100g: 32, fatPer100g: 2.5 },
    { name: 'Roasted Plantain', localName: 'Roasted Plantain (Kaklo)', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 135, caloriesPerUnit: 180, standardServingG: 130, servingDescription: '1 finger roasted plantain', preparationType: 'ROASTED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 1.5, carbsPer100g: 33, fatPer100g: 0.5 },
    { name: 'Meat Pie', localName: 'Meat Pie', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 310, caloriesPerUnit: 340, standardServingG: 110, servingDescription: '1 meat pie', preparationType: 'BAKED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 8, carbsPer100g: 30, fatPer100g: 18 },
    { name: 'Spring Roll', localName: 'Spring Roll', categoryId: catMap['snacks-street-foods'], caloriesPer100g: 250, caloriesPerUnit: 150, standardServingG: 60, servingDescription: '1 spring roll', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 5, carbsPer100g: 28, fatPer100g: 13 },

    // LOCAL DRINKS
    { name: 'Sobolo', localName: 'Sobolo / Hibiscus Drink', categoryId: catMap['local-drinks'], caloriesPer100g: 40, standardServingG: 300, servingDescription: '1 sachet/cup sobolo', preparationType: 'MIXED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 0.2, carbsPer100g: 10, fatPer100g: 0 },
    { name: 'Asaana', localName: 'Asaana', categoryId: catMap['local-drinks'], caloriesPer100g: 45, standardServingG: 300, servingDescription: '1 cup/sachet asaana', preparationType: 'MIXED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.1 },
    { name: 'Fresh Coconut Water', localName: 'Coconut Water', categoryId: catMap['local-drinks'], caloriesPer100g: 19, standardServingG: 330, servingDescription: '1 coconut (~330ml)', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.7, carbsPer100g: 3.7, fatPer100g: 0.2 },
    { name: 'Palm Wine', localName: 'Palm Wine', categoryId: catMap['local-drinks'], caloriesPer100g: 55, standardServingG: 250, servingDescription: '1 glass palm wine', preparationType: 'RAW', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 0.5, carbsPer100g: 10, fatPer100g: 0 },

    // LOCAL FRUITS
    { name: 'Mango', localName: 'Mango', categoryId: catMap['local-fruits'], caloriesPer100g: 60, caloriesPerUnit: 135, standardServingG: 225, servingDescription: '1 medium mango', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
    { name: 'Papaya (Pawpaw)', localName: 'Pawpaw', categoryId: catMap['local-fruits'], caloriesPer100g: 43, caloriesPerUnit: 120, standardServingG: 280, servingDescription: '1 cup sliced pawpaw', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3 },
    { name: 'Pineapple', localName: 'Pineapple', categoryId: catMap['local-fruits'], caloriesPer100g: 50, standardServingG: 165, servingDescription: '1 cup pineapple chunks', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
    { name: 'Banana', localName: 'Banana', categoryId: catMap['local-fruits'], caloriesPer100g: 89, caloriesPerUnit: 105, standardServingG: 118, servingDescription: '1 medium banana', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
    { name: 'Orange', localName: 'Orange', categoryId: catMap['local-fruits'], caloriesPer100g: 47, caloriesPerUnit: 62, standardServingG: 130, servingDescription: '1 medium orange', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
    { name: 'Watermelon', localName: 'Watermelon', categoryId: catMap['local-fruits'], caloriesPer100g: 30, standardServingG: 280, servingDescription: '1 slice watermelon', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2 },
    { name: 'Coconut Flesh', localName: 'Coconut', categoryId: catMap['local-fruits'], caloriesPer100g: 354, standardServingG: 80, servingDescription: '1 piece coconut', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 3.3, carbsPer100g: 15, fatPer100g: 33 },
    { name: 'Avocado (Pear)', localName: 'Avocado Pear', categoryId: catMap['local-fruits'], caloriesPer100g: 160, caloriesPerUnit: 240, standardServingG: 150, servingDescription: '1 medium avocado', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
    { name: 'Soursop', localName: 'Soursop', categoryId: catMap['local-fruits'], caloriesPer100g: 66, standardServingG: 200, servingDescription: '1 cup soursop', preparationType: 'RAW', confidenceLevel: 'ESTIMATED', sourceNote: 'USDA', proteinPer100g: 1, carbsPer100g: 17, fatPer100g: 0.3 },

    // LOCAL VEGETABLES
    { name: 'Kontomire (Cocoyam Leaves)', localName: 'Kontomire', categoryId: catMap['local-vegetables'], caloriesPer100g: 42, standardServingG: 100, servingDescription: '1 cup kontomire', preparationType: 'RAW', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 4, carbsPer100g: 6, fatPer100g: 0.7 },
    { name: 'Garden Eggs', localName: 'Garden Eggs', categoryId: catMap['local-vegetables'], caloriesPer100g: 25, caloriesPerUnit: 20, standardServingG: 80, servingDescription: '1 garden egg', preparationType: 'RAW', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2 },
    { name: 'Okro', localName: 'Okro', categoryId: catMap['local-vegetables'], caloriesPer100g: 33, standardServingG: 100, servingDescription: '1 cup sliced okro', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.9, carbsPer100g: 7, fatPer100g: 0.2 },
    { name: 'Tomato (Local)', localName: 'Local Tomato', categoryId: catMap['local-vegetables'], caloriesPer100g: 18, standardServingG: 120, servingDescription: '1 medium tomato', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },

    // CONTINENTAL DISHES
    { name: 'Spaghetti (Cooked)', categoryId: catMap['continental-dishes'], caloriesPer100g: 158, standardServingG: 220, servingDescription: '1 plate spaghetti', preparationType: 'BOILED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9 },
    { name: 'Grilled Chicken Breast', categoryId: catMap['continental-dishes'], caloriesPer100g: 165, standardServingG: 150, servingDescription: '1 piece chicken breast', preparationType: 'GRILLED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: 'Fried Chicken', categoryId: catMap['continental-dishes'], caloriesPer100g: 250, caloriesPerUnit: 300, standardServingG: 120, servingDescription: '1 piece fried chicken', preparationType: 'FRIED', confidenceLevel: 'ESTIMATED', sourceNote: 'USDA', proteinPer100g: 25, carbsPer100g: 8, fatPer100g: 14 },
    { name: 'French Fries', categoryId: catMap['continental-dishes'], caloriesPer100g: 312, standardServingG: 150, servingDescription: '1 serving french fries', preparationType: 'FRIED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15 },
    { name: 'Scrambled Eggs', categoryId: catMap['continental-dishes'], caloriesPer100g: 149, standardServingG: 100, servingDescription: '2 scrambled eggs', preparationType: 'FRIED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 10, carbsPer100g: 1.6, fatPer100g: 11 },
    { name: 'Boiled Egg', categoryId: catMap['continental-dishes'], caloriesPer100g: 155, caloriesPerUnit: 78, standardServingG: 50, servingDescription: '1 boiled egg', preparationType: 'BOILED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },

    // CANNED / TINNED FOODS
    { name: 'Canned Corned Beef', categoryId: catMap['canned-tinned-foods'], caloriesPer100g: 250, standardServingG: 340, servingDescription: '1 tin corned beef', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'TIN', packageWeightG: 340, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 16 },
    { name: 'Canned Baked Beans', categoryId: catMap['canned-tinned-foods'], caloriesPer100g: 94, standardServingG: 415, servingDescription: '1 tin baked beans', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'TIN', packageWeightG: 415, proteinPer100g: 5, carbsPer100g: 15, fatPer100g: 0.5 },
    { name: 'Canned Sardines in Oil', categoryId: catMap['canned-tinned-foods'], caloriesPer100g: 208, standardServingG: 125, servingDescription: '1 tin sardines', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'TIN', packageWeightG: 125, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 12 },
    { name: 'Canned Mackerel', categoryId: catMap['canned-tinned-foods'], caloriesPer100g: 200, standardServingG: 155, servingDescription: '1 tin mackerel', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'TIN', packageWeightG: 155, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 12 },
    { name: 'Canned Tuna in Water', categoryId: catMap['canned-tinned-foods'], caloriesPer100g: 116, standardServingG: 170, servingDescription: '1 tin tuna', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'TIN', packageWeightG: 170, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },

    // BOTTLED & CANNED DRINKS
    { name: 'Coca-Cola (Can)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 42, standardServingG: 330, servingDescription: '1 can Coca-Cola (330ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'CAN', packageVolumeMl: 330, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 },
    { name: 'Coca-Cola (Bottle)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 42, standardServingG: 500, servingDescription: '1 bottle Coca-Cola (500ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'BOTTLE', packageVolumeMl: 500, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 },
    { name: 'Fanta Orange (Can)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 44, standardServingG: 330, servingDescription: '1 can Fanta (330ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'CAN', packageVolumeMl: 330, proteinPer100g: 0, carbsPer100g: 11.5, fatPer100g: 0 },
    { name: 'Fanta Orange (Bottle)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 44, standardServingG: 500, servingDescription: '1 bottle Fanta (500ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'BOTTLE', packageVolumeMl: 500, proteinPer100g: 0, carbsPer100g: 11.5, fatPer100g: 0 },
    { name: 'Sprite (Can)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 40, standardServingG: 330, servingDescription: '1 can Sprite (330ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'CAN', packageVolumeMl: 330, proteinPer100g: 0, carbsPer100g: 10, fatPer100g: 0 },
    { name: 'Sprite (Bottle)', categoryId: catMap['bottled-canned-drinks'], caloriesPer100g: 40, standardServingG: 500, servingDescription: '1 bottle Sprite (500ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'BOTTLE', packageVolumeMl: 500, proteinPer100g: 0, carbsPer100g: 10, fatPer100g: 0 },

    // MALT DRINKS
    { name: 'Malta Guinness (Can)', categoryId: catMap['malt-drinks'], caloriesPer100g: 50, standardServingG: 330, servingDescription: '1 can Malta Guinness (330ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'CAN', packageVolumeMl: 330, proteinPer100g: 0.3, carbsPer100g: 12, fatPer100g: 0 },
    { name: 'Malta Guinness (Bottle)', categoryId: catMap['malt-drinks'], caloriesPer100g: 50, standardServingG: 330, servingDescription: '1 bottle Malta Guinness (330ml)', preparationType: 'OTHER', confidenceLevel: 'VERIFIED', sourceNote: 'Label', packageType: 'BOTTLE', packageVolumeMl: 330, proteinPer100g: 0.3, carbsPer100g: 12, fatPer100g: 0 },
    { name: 'Alvaro (Bottle)', categoryId: catMap['malt-drinks'], caloriesPer100g: 45, standardServingG: 330, servingDescription: '1 bottle Alvaro (330ml)', preparationType: 'OTHER', confidenceLevel: 'ESTIMATED', sourceNote: 'Label', packageType: 'BOTTLE', packageVolumeMl: 330, proteinPer100g: 0.2, carbsPer100g: 11, fatPer100g: 0 },
    { name: 'Beta Malt (Can)', categoryId: catMap['malt-drinks'], caloriesPer100g: 48, standardServingG: 330, servingDescription: '1 can Beta Malt (330ml)', preparationType: 'OTHER', confidenceLevel: 'ESTIMATED', sourceNote: 'Label', packageType: 'CAN', packageVolumeMl: 330, proteinPer100g: 0.3, carbsPer100g: 12, fatPer100g: 0 },

    // BREAD & BAKERY
    { name: 'White Bread (Sliced)', categoryId: catMap['bread-bakery'], caloriesPer100g: 265, caloriesPerSlice: 79, slicesPerLoaf: 20, standardServingG: 30, servingDescription: '1 slice white bread', preparationType: 'BAKED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', packageType: 'LOAF', packageWeightG: 600, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2 },
    { name: 'Wheat Bread (Sliced)', categoryId: catMap['bread-bakery'], caloriesPer100g: 247, caloriesPerSlice: 69, slicesPerLoaf: 20, standardServingG: 28, servingDescription: '1 slice wheat bread', preparationType: 'BAKED', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', packageType: 'LOAF', packageWeightG: 560, proteinPer100g: 10, carbsPer100g: 43, fatPer100g: 4 },
    { name: 'Sugar Bread', localName: 'Sugar Bread', categoryId: catMap['bread-bakery'], caloriesPer100g: 310, caloriesPerSlice: 93, slicesPerLoaf: 18, standardServingG: 30, servingDescription: '1 slice sugar bread', preparationType: 'BAKED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', packageType: 'LOAF', packageWeightG: 540, proteinPer100g: 7, carbsPer100g: 55, fatPer100g: 7 },
    { name: 'Butter Bread', localName: 'Butter Bread', categoryId: catMap['bread-bakery'], caloriesPer100g: 290, caloriesPerSlice: 87, slicesPerLoaf: 18, standardServingG: 30, servingDescription: '1 slice butter bread', preparationType: 'BAKED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', packageType: 'LOAF', packageWeightG: 540, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 8 },
    { name: 'Tea Bread Roll', localName: 'Tea Bread', categoryId: catMap['bread-bakery'], caloriesPer100g: 270, caloriesPerUnit: 160, standardServingG: 60, servingDescription: '1 tea bread roll', preparationType: 'BAKED', confidenceLevel: 'ESTIMATED', sourceNote: 'Local estimate', proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 4 },

    // GENERAL FRUITS
    { name: 'Apple', categoryId: catMap['fruits'], caloriesPer100g: 52, caloriesPerUnit: 95, standardServingG: 182, servingDescription: '1 medium apple', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
    { name: 'Grapes', categoryId: catMap['fruits'], caloriesPer100g: 69, standardServingG: 150, servingDescription: '1 cup grapes', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2 },
    { name: 'Strawberries', categoryId: catMap['fruits'], caloriesPer100g: 32, standardServingG: 150, servingDescription: '1 cup strawberries', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.7, carbsPer100g: 8, fatPer100g: 0.3 },

    // GENERAL VEGETABLES
    { name: 'Carrots', categoryId: catMap['vegetables'], caloriesPer100g: 41, standardServingG: 128, servingDescription: '1 cup sliced carrots', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
    { name: 'Cabbage', categoryId: catMap['vegetables'], caloriesPer100g: 25, standardServingG: 90, servingDescription: '1 cup shredded cabbage', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.3, carbsPer100g: 6, fatPer100g: 0.1 },
    { name: 'Cucumber', categoryId: catMap['vegetables'], caloriesPer100g: 15, standardServingG: 120, servingDescription: '1/2 cucumber', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
    { name: 'Onion', categoryId: catMap['vegetables'], caloriesPer100g: 40, standardServingG: 110, servingDescription: '1 medium onion', preparationType: 'RAW', confidenceLevel: 'VERIFIED', sourceNote: 'USDA', proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1 },
  ];

  for (const food of foods) {
    await prisma.foodItem.create({ data: food });
  }
  console.log(`✅ Created ${foods.length} food items`);

  // ─── Serving Options ─────────────────────────────────────────────────────
  // Get inserted food IDs by name
  const allFoods = await prisma.foodItem.findMany();
  const foodByName = {};
  allFoods.forEach(f => { foodByName[f.name] = f.id; });

  const servingOptions = [
    { foodId: foodByName['Banku'], label: '1 ball', gramsEquiv: 300, isDefault: true },
    { foodId: foodByName['Banku'], label: '1 small ball', gramsEquiv: 200 },
    { foodId: foodByName['Kenkey'], label: '1 ball', gramsEquiv: 280, isDefault: true },
    { foodId: foodByName['Kenkey'], label: '1 small ball', gramsEquiv: 180 },
    { foodId: foodByName['Fufu'], label: '1 serving', gramsEquiv: 400, isDefault: true },
    { foodId: foodByName['Fufu'], label: '1 small serving', gramsEquiv: 250 },
    { foodId: foodByName['Waakye'], label: '1 plate', gramsEquiv: 350, isDefault: true },
    { foodId: foodByName['Waakye'], label: '1 small plate', gramsEquiv: 200 },
    { foodId: foodByName['Jollof Rice'], label: '1 plate', gramsEquiv: 300, isDefault: true },
    { foodId: foodByName['Jollof Rice'], label: '1 small plate', gramsEquiv: 180 },
    { foodId: foodByName['Groundnut Soup'], label: '1 ladle', gramsEquiv: 120 },
    { foodId: foodByName['Groundnut Soup'], label: '1 bowl', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Light Soup'], label: '1 ladle', gramsEquiv: 120 },
    { foodId: foodByName['Light Soup'], label: '1 bowl', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Palm Nut Soup'], label: '1 ladle', gramsEquiv: 120 },
    { foodId: foodByName['Palm Nut Soup'], label: '1 bowl', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Kontomire Stew'], label: '1 ladle', gramsEquiv: 150, isDefault: true },
    { foodId: foodByName['Okro Stew'], label: '1 ladle', gramsEquiv: 200, isDefault: true },
    { foodId: foodByName['Hausa Koko'], label: '1 bowl', gramsEquiv: 300, isDefault: true },
    { foodId: foodByName['Hausa Koko'], label: '1 cup', gramsEquiv: 200 },
    { foodId: foodByName['Gari Soakings'], label: '1 bowl', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Gari Soakings'], label: '0.5 cup gari', gramsEquiv: 60 },
    { foodId: foodByName['Tuo Zaafi'], label: '1 ball', gramsEquiv: 350, isDefault: true },
    { foodId: foodByName['Boiled Yam'], label: '100g', gramsEquiv: 100 },
    { foodId: foodByName['Boiled Yam'], label: '1 serving (250g)', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Fried Yam'], label: '1 plate', gramsEquiv: 250, isDefault: true },
    { foodId: foodByName['Sobolo'], label: '1 sachet', gramsEquiv: 300, isDefault: true },
    { foodId: foodByName['Sobolo'], label: '1 cup', gramsEquiv: 250 },
    { foodId: foodByName['Koose'], label: '1 piece', gramsEquiv: 25, isDefault: true },
    { foodId: foodByName['Koose'], label: '3 pieces', gramsEquiv: 75 },
    { foodId: foodByName['Bofrot'], label: '1 piece', gramsEquiv: 30, isDefault: true },
    { foodId: foodByName['Bofrot'], label: '3 pieces', gramsEquiv: 90 },
    { foodId: foodByName['White Bread (Sliced)'], label: '1 slice', gramsEquiv: 30, isDefault: true },
    { foodId: foodByName['White Bread (Sliced)'], label: '2 slices', gramsEquiv: 60 },
    { foodId: foodByName['White Bread (Sliced)'], label: '3 slices', gramsEquiv: 90 },
    { foodId: foodByName['Wheat Bread (Sliced)'], label: '1 slice', gramsEquiv: 28, isDefault: true },
    { foodId: foodByName['Wheat Bread (Sliced)'], label: '2 slices', gramsEquiv: 56 },
  ];

  for (const so of servingOptions) {
    if (so.foodId) {
      await prisma.foodServingOption.create({ data: so });
    }
  }
  console.log(`✅ Created ${servingOptions.length} serving options`);

  // ─── Default Profile ─────────────────────────────────────────────────────
  await prisma.userProfileLocal.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'User',
      sex: 'male',
      age: 30,
      weightKg: 75,
      heightCm: 170,
      activityLevel: 'MODERATELY_ACTIVE',
      goal: 'MAINTAIN',
      targetWeeklyChangeKg: 0.5,
      dailyCalorieTarget: 2400,
      dailyStepTarget: 10000,
    },
  });

  // ─── Default Settings ────────────────────────────────────────────────────
  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      theme: 'light',
      language: 'en',
      timezone: 'Africa/Accra',
      unitSystem: 'metric',
    },
  });

  console.log('✅ Created default profile and settings');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
