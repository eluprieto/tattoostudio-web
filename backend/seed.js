/* ================================================================
   TATTOOSTUDIO – SEED de productos
   Uso: node seed.js
   ================================================================ */
require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./src/models/Product');

const PRODUCTS = [
  /* ── ARITOS ─────────────────────────────────────────────────── */
  {
    name:     'Aro Helix Titanio Anodizado',
    category: 'aritos',
    bodyPart: 'oreja',
    material: 'titanio',
    price:    4200,
    stock:    18,
    popular:  true,
    desc:     'Aro de titanio implant-grade anodizado. Apto para piercings recientes. Cierre de bolita a rosca interna. Diámetro 8 mm, grosor 16G.'
  },
  {
    name:     'Arito Argolla Acero Quirúrgico 8mm',
    category: 'aritos',
    bodyPart: 'oreja',
    material: 'acero',
    price:    1800,
    stock:    35,
    popular:  false,
    desc:     'Argolla clásica de acero 316L, ideal para lóbulo, tragus y hélix. Sin níquel, hipoalergénica. Diámetro 8 mm, 16G.'
  },
  {
    name:     'Aro Conch Titanio Rosado',
    category: 'aritos',
    bodyPart: 'oreja',
    material: 'titanio',
    price:    5500,
    stock:    12,
    popular:  true,
    desc:     'Aro para conch o daith en titanio G23 anodizado color rosado. Rosca interna, bolita de zirconia. 14G, diámetro 10 mm.'
  },
  {
    name:     'Arito Daith Corazón Acero Negro',
    category: 'aritos',
    bodyPart: 'oreja',
    material: 'negro',
    price:    3200,
    stock:    20,
    popular:  false,
    desc:     'Argolla para daith con charm corazón, acabado negro matte. Acero 316L PVD negro, sin níquel. 16G, diámetro 8 mm.'
  },
  {
    name:     'Aro Septum Titanio Dorado',
    category: 'aritos',
    bodyPart: 'nariz',
    material: 'titanio',
    price:    4800,
    stock:    15,
    popular:  true,
    desc:     'Aro de septum en titanio anodizado dorado. Rosca interna con bolita de cierre. 16G, diámetro 10 mm. Implant-grade.'
  },
  {
    name:     'Aro Labret Acero con Zirconia',
    category: 'aritos',
    bodyPart: 'labio',
    material: 'acero',
    price:    2900,
    stock:    22,
    popular:  false,
    desc:     'Aro labret plano en acero quirúrgico con piedra zirconia frontal transparente. Rosca interna plana, cómodo para uso diario. 16G, 8 mm.'
  },

  /* ── PIERCINGS ───────────────────────────────────────────────── */
  {
    name:     'Barbell Lengua Titanio Bicolor',
    category: 'piercings',
    bodyPart: 'lengua',
    material: 'titanio',
    price:    5200,
    stock:    10,
    popular:  true,
    desc:     'Barbell recto para lengua en titanio G23. Bolas anodizadas en dos colores a elección. 14G, largo 16 mm. Rosca externa.'
  },
  {
    name:     'Microdermal Acero Titanio con Gema',
    category: 'piercings',
    bodyPart: 'otro',
    material: 'titanio',
    price:    6800,
    stock:    8,
    popular:  false,
    desc:     'Base microdermal de titanio implant-grade con cabeza intercambiable de acero y gema de colores. Incluye base plana y base 45°.'
  },
  {
    name:     'Piercing Nariz Tornillo Oro 14k',
    category: 'piercings',
    bodyPart: 'nariz',
    material: 'oro',
    price:    12500,
    stock:    6,
    popular:  true,
    desc:     'Nostril screw en oro amarillo 14k sólido. Punta redondeada con bola de 1.5 mm. 20G. Apto para pieles sensibles. Made in Argentina.'
  },
  {
    name:     'Barbell Industrial Acero Bandera',
    category: 'piercings',
    bodyPart: 'oreja',
    material: 'acero',
    price:    3600,
    stock:    14,
    popular:  false,
    desc:     'Barbell recto industrial de 38 mm en acero 316L. Con charm de bandera argentina central. Rosca externa, 14G.'
  },
  {
    name:     'Curved Barbell Ceja Titanio',
    category: 'piercings',
    bodyPart: 'ceja',
    material: 'titanio',
    price:    4500,
    stock:    16,
    popular:  true,
    desc:     'Barra curva para ceja en titanio anodizado. Bolas de 3 mm con acabado espejo. 16G, largo 8 mm. Rosca interna.'
  },
  {
    name:     'Banana Ombligo Acero con Cristal',
    category: 'piercings',
    bodyPart: 'ombligo',
    material: 'acero',
    price:    2500,
    stock:    30,
    popular:  false,
    desc:     'Banana para ombligo en acero 316L con cristal colgante multicolor. 14G, largo 10 mm. Varios colores disponibles.'
  },
  {
    name:     'Banana Ombligo Titanio Rosado Gold',
    category: 'piercings',
    bodyPart: 'ombligo',
    material: 'titanio',
    price:    6200,
    stock:    11,
    popular:  true,
    desc:     'Banana para ombligo en titanio G23 anodizado rose gold. Bolita superior de 4 mm y gema inferior de zirconia. 14G, 10 mm.'
  },

  /* ── EXPANSORES ──────────────────────────────────────────────── */
  {
    name:     'Expansor Acrílico Neón 6mm',
    category: 'expansores',
    bodyPart: 'oreja',
    material: 'otro',
    price:    1500,
    stock:    40,
    popular:  false,
    desc:     'Plug liso de acrílico en color neón (amarillo/verde/naranja/rosa). Para lóbulos expandidos. Talla 6 mm (4G). Venta individual.'
  },
  {
    name:     'Expansor Madera Ebony 8mm',
    category: 'expansores',
    bodyPart: 'oreja',
    material: 'otro',
    price:    2800,
    stock:    18,
    popular:  false,
    desc:     'Saddle plug en madera ebony natural. Acabado liso y pulido, 100% orgánico. Talla 8 mm (0G). Par incluido.'
  },
  {
    name:     'Expansor Acero Doble Flare 10mm',
    category: 'expansores',
    bodyPart: 'oreja',
    material: 'acero',
    price:    3400,
    stock:    14,
    popular:  true,
    desc:     'Plug double flare de acero 316L espejo. Sin o-rings. Para lóbulos con túnel establecido. Talla 10 mm (00G). Par incluido.'
  },
  {
    name:     'Túnel Acrílico UV Multicolor 12mm',
    category: 'expansores',
    bodyPart: 'oreja',
    material: 'multicolor',
    price:    2200,
    stock:    25,
    popular:  false,
    desc:     'Túnel hollow de acrílico que brilla con luz UV en colores varios. Single flare con o-ring. Talla 12 mm. Par incluido.'
  },

  /* ── RETENCIONES ─────────────────────────────────────────────── */
  {
    name:     'Retención Transparente Nariz 0.8mm',
    category: 'retenciones',
    bodyPart: 'nariz',
    material: 'otro',
    price:    1600,
    stock:    50,
    popular:  false,
    desc:     'Retención bioplast transparente para nostril. Ideal para trabajo, deporte o cirugías. 20G (0.8 mm). Pack x 3 unidades.'
  },
  {
    name:     'Retención Lengua Acrílico 16mm',
    category: 'retenciones',
    bodyPart: 'lengua',
    material: 'otro',
    price:    1900,
    stock:    35,
    popular:  false,
    desc:     'Barbell de retención en acrílico transparente para lengua. Bolas blancas no visibles. 14G, largo 16 mm. Pack x 2 unidades.'
  },
  {
    name:     'Retención Ombligo PTFE Flexible',
    category: 'retenciones',
    bodyPart: 'ombligo',
    material: 'otro',
    price:    2100,
    stock:    28,
    popular:  false,
    desc:     'Banana flexible de PTFE para ombligo, ideal durante el embarazo o para esconder el piercing. 14G, largo 10 mm. Con 2 bolas de repuesto.'
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI no está definido en .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅  MongoDB conectado:', uri);

    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`⚠️   Ya hay ${existing} producto(s) en la base de datos.`);
      const args = process.argv.slice(2);
      if (!args.includes('--force')) {
        console.log('   Pasá --force para borrar todo y reinsertar.');
        await mongoose.disconnect();
        process.exit(0);
      }
      await Product.deleteMany({});
      console.log('🗑️   Productos anteriores eliminados.');
    }

    const inserted = await Product.insertMany(PRODUCTS);
    console.log(`\n🎉  ${inserted.length} productos insertados:\n`);
    inserted.forEach(p =>
      console.log(`   [${p.category.padEnd(12)}] ${p.name} — $${p.price.toLocaleString('es-AR')}${p.popular ? ' ⭐' : ''}`)
    );

    await mongoose.disconnect();
    console.log('\n✅  Seed completado.');
  } catch (err) {
    console.error('❌  Error en el seed:', err.message);
    process.exit(1);
  }
}

seed();
