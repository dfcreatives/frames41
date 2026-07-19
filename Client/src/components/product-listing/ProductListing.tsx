// <!DOCTYPE html>

// <html class="light" lang="en"><head>
// <meta charset="utf-8"/>
// <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&amp;display=swap" rel="stylesheet"/>
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
// <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
// <script id="tailwind-config">
//       tailwind.config = {
//         darkMode: "class",
//         theme: {
//           extend: {
//             "colors": {
//                 "primary": "#800020",
//                 "on-primary": "#ffffff",
//                 "background": "#F8F8F6",
//                 "on-background": "#111110",
//                 "surface": "#ffffff",
//                 "on-surface": "#111110",
//                 "surface-container": "#F1F1EF",
//                 "outline": "#D1D1CF",
//                 "outline-variant": "#E2E2E0",
//                 "secondary": "#525250"
//             },
//             "borderRadius": {
//                 "DEFAULT": "0.125rem",
//                 "lg": "0.25rem",
//                 "xl": "0.5rem",
//                 "full": "9999px"
//             },
//             "spacing": {
//                 "gutter": "24px",
//                 "md": "24px",
//                 "xs": "4px",
//                 "container-max": "1280px",
//                 "lg": "48px",
//                 "sm": "12px",
//                 "xl": "80px"
//             },
//             "fontFamily": {
//                 "headline": ["Inter", "sans-serif"],
//                 "body": ["Inter", "sans-serif"],
//             },
//             "fontSize": {
//                 "h1": ["56px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "400"}],
//                 "h2": ["40px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "400"}],
//                 "h3": ["28px", {"lineHeight": "1.3", "fontWeight": "400"}],
//                 "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
//                 "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
//                 "label-caps": ["12px", {"lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "700"}]
//             }
//           },
//         },
//       }
//     </script>
// <style>
//         .material-symbols-outlined {
//             font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24
//         }
//         body {
//             font-family: 'Inter', sans-serif;
//         }
//         h1, h2, h3, .font-headline {
//             font-family: 'Inter', sans-serif;
//         }
//     </style>
// </head>
// <body class="bg-background font-body text-on-background">
// <!-- TopNavBar -->
// <header class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
// <div class="flex justify-between items-center w-full px-6 py-5 max-w-[1280px] mx-auto">
// <div class="text-3xl font-headline tracking-tight text-on-background italic">Frames 41</div>
// <nav class="hidden md:flex gap-10 items-center text-sm font-medium uppercase tracking-widest">
// <a class="text-primary border-b-2 border-primary pb-1" href="#">Shop</a>
// <a class="text-secondary hover:text-on-background transition-colors" href="#">DIY Kits</a>
// <a class="text-secondary hover:text-on-background transition-colors" href="#">Gifts</a>
// <a class="text-secondary hover:text-on-background transition-colors" href="#">Our Story</a>
// </nav>
// <div class="flex items-center gap-6">
// <div class="relative hidden lg:block">
// <span class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-background text-xl">search</span>
// <input class="pl-8 pr-0 py-1 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-outline-variant focus:border-on-background focus:ring-0 text-sm transition-all w-48 placeholder:text-secondary" placeholder="Search crafts..." type="text"/>
// </div>
// <div class="flex items-center gap-4">
// <button class="text-on-background hover:text-primary transition-colors"><span class="material-symbols-outlined">person</span></button>
// <button class="text-on-background hover:text-primary transition-colors relative">
// <span class="material-symbols-outlined">shopping_cart</span>
// <span class="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
// </button>
// </div>
// </div>
// </div>
// </header>
// <main class="max-w-[1280px] mx-auto px-6 py-12">
// <div class="flex flex-col lg:flex-row gap-16">
// <!-- SideNavBar (Filter Context) -->
// <aside class="w-full lg:w-64 flex-shrink-0">
// <div class="sticky top-32">
// <h3 class="text-h3 mb-8 border-b border-on-background pb-2">Filters</h3>
// <!-- Category Filter -->
// <div class="mb-10">
// <label class="text-label-caps mb-6 block uppercase">Categories</label>
// <div class="space-y-4">
// <label class="flex items-center justify-between cursor-pointer group">
// <span class="text-body-md group-hover:underline">MDF Cutouts</span>
// <input checked="" class="rounded-none border-outline text-on-background focus:ring-on-background h-4 w-4" type="checkbox"/>
// </label>
// <label class="flex items-center justify-between cursor-pointer group">
// <span class="text-body-md group-hover:underline">DIY Painting Kits</span>
// <input class="rounded-none border-outline text-on-background focus:ring-on-background h-4 w-4" type="checkbox"/>
// </label>
// <label class="flex items-center justify-between cursor-pointer group">
// <span class="text-body-md group-hover:underline">Wooden Nameplates</span>
// <input class="rounded-none border-outline text-on-background focus:ring-on-background h-4 w-4" type="checkbox"/>
// </label>
// <label class="flex items-center justify-between cursor-pointer group">
// <span class="text-body-md group-hover:underline">Home Decor</span>
// <input class="rounded-none border-outline text-on-background focus:ring-on-background h-4 w-4" type="checkbox"/>
// </label>
// </div>
// </div>
// <!-- Price Range -->
// <div class="mb-10">
// <label class="text-label-caps mb-6 block uppercase">Price Range</label>
// <input class="w-full h-px bg-outline appearance-none cursor-pointer accent-on-background" max="5000" min="0" type="range"/>
// <div class="flex justify-between mt-4 text-xs font-bold">
// <span>₹0</span>
// <span>₹5000+</span>
// </div>
// </div>
// <!-- Material Texture Filters -->
// <div class="mb-10">
// <label class="text-label-caps mb-6 block uppercase">Finish</label>
// <div class="flex flex-col gap-3">
// <button class="text-left text-sm py-2 border-b border-outline-variant hover:border-on-background transition-colors">Raw MDF</button>
// <button class="text-left text-sm py-2 border-b border-outline-variant hover:border-on-background transition-colors">Polished Oak</button>
// <button class="text-left text-sm py-2 border-b border-outline-variant hover:border-on-background transition-colors">Varnished Pine</button>
// </div>
// </div>
// <button class="w-full py-4 bg-on-background text-white uppercase tracking-widest text-xs font-bold hover:bg-primary transition-all">
//                     Apply Filters
//                 </button>
// </div>
// </aside>
// <!-- Product Canvas -->
// <section class="flex-grow">
// <!-- Sorting and Header -->
// <div class="flex flex-col sm:flex-row justify-between items-start mb-12 gap-8">
// <div>
// <h1 class="text-h1 mb-4 italic">Artisanal Frames &amp; Kits</h1>
// <p class="text-body-lg text-secondary max-w-xl">Curated collection of hand-finished MDF cutouts and DIY kits, designed for the conscious creator.</p>
// </div>
// <div class="flex items-center gap-4 border-b border-on-background pb-2">
// <span class="text-xs font-bold uppercase tracking-tighter">Sort</span>
// <select class="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold cursor-pointer">
// <option>New Arrivals</option>
// <option>Price: Low to High</option>
// <option>Price: High to Low</option>
// <option>Most Popular</option>
// </select>
// </div>
// </div>
// <!-- Product Grid -->
// <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
// <!-- Product Card 1 (Large Feature) -->
// <div class="md:col-span-2 group">
// <div class="relative overflow-hidden aspect-[21/9]">
// <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" data-alt="Mandala Master DIY Kit" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSjowuXtxHdA_IwbfkmnKweSfAXB5QCSl1uUytZ2kWS--iM93ZcBKhbB3mTIYIb2704OLhV6nllllSlZEZ4RQ39V8ZMODD4niFMHWhgjZiuPs7I2Q57Sq5ZwPC3HprkYRPBXDTTgChYnS1SHbGrdF0crOXv04BkPb8kq4qKjcke_QnrwLtSbETGeLyKxFuQGO4uQ8LEmKGjnIovYa0fXsU45xqUMjGhavV6hfAhDoHMhO-Q1HZ-N-tuTj_dwpojJQcWay5f-zjCBM"/>
// <div class="absolute top-6 left-6 bg-primary text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Featured Kit</div>
// </div>
// <div class="mt-8 flex flex-col md:flex-row justify-between items-start gap-6">
// <div class="max-w-xl">
// <h3 class="text-h2 italic mb-3">Mandala Master DIY Kit</h3>
// <p class="text-body-md text-secondary">Complete set featuring a 12-inch precision-cut MDF mandala base, premium pigments, and sealing varnish for a professional finish.</p>
// </div>
// <div class="flex flex-col items-end gap-4 min-w-[140px]">
// <span class="text-3xl font-headline tracking-tighter">₹1,499</span>
// <button class="w-full px-8 py-4 bg-primary text-white uppercase tracking-widest text-xs font-bold hover:bg-on-background transition-all">
//                                 Add to Cart
//                             </button>
// </div>
// </div>
// </div>
// <!-- Product Card 2 -->
// <div class="group">
// <div class="aspect-[4/5] overflow-hidden bg-surface-container mb-6">
// <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Geometric Elephant Cutout" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-PYmrl4qA5bTYuRei2u0x6Dq48H9H8BA-fhyaVpBnr1oOlDHexLNHZlUshHJaaC2NC6sYMeBfx49W9BfTN8J8n4DrqrZOHjKt82V5GiS8i6H1Kmojbca2JpahR6k-bhZbDmuLBEyZ2z0qFVBSO2axWeWYR1p2KLkwFTf71GZwhbYe5KgyazvfK8Qs32_zHIK-wo6RkczVsACwHw0oPIT2VndK_9R_EUXq8CvhsvIbbZ8ge_pfMQsYjFWP85KY22uIyBobKbkgOzA"/>
// </div>
// <div class="flex justify-between items-start">
// <div>
// <h3 class="text-xl font-headline italic">Geometric Elephant Cutout</h3>
// <p class="text-sm text-secondary mt-1 uppercase tracking-wider">18" Raw MDF Base</p>
// </div>
// <div class="text-right">
// <span class="text-xl font-headline block">₹650</span>
// <button class="mt-2 text-on-background hover:text-primary transition-colors">
// <span class="material-symbols-outlined">add_shopping_cart</span>
// </button>
// </div>
// </div>
// </div>
// <!-- Product Card 3 -->
// <div class="group">
// <div class="aspect-[4/5] overflow-hidden bg-surface-container mb-6">
// <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Custom Walnut Nameplate" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6FRx9p7Wc8M1GZV45PK-TUIfjSdHBq6vFqhGO1LFnMmjUIGvr0HVCD4jHQqukSad2SzUtsz01T4MD9fHVYTS6GRdVHnNDChGkgY6pzL-7MJYTwoNMXklCggzOwUWUfXs_Je5LPJPeSvj_C2yV_nX01M3ni2esA-D7RC7yu8UVP0qsUtgHcEWQHVxqhRVAU7miDPdrsUNWXV8YFX8bVIe5UMvF64WsQIXw9PIDkr2z7D4PNCBaZ3ZFnnaYe-nt8-x93iDgnuo6G8k"/>
// </div>
// <div class="flex justify-between items-start">
// <div>
// <h3 class="text-xl font-headline italic">Custom Walnut Nameplate</h3>
// <p class="text-sm text-secondary mt-1 uppercase tracking-wider">Hand-engraved Solid Wood</p>
// </div>
// <div class="text-right">
// <span class="text-xl font-headline block">₹2,200</span>
// <button class="mt-2 text-on-background hover:text-primary transition-colors">
// <span class="material-symbols-outlined">add_shopping_cart</span>
// </button>
// </div>
// </div>
// </div>
// <!-- Product Card 4 -->
// <div class="group">
// <div class="aspect-[4/5] overflow-hidden bg-surface-container mb-6">
// <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Boho Coaster Set" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCebYyjWLK2KfAV-UMbfmEyBbJYfEnR_lXUDks_jWLsa-VyltHIBtqXmEJ1CLwhC5-d65d5AjGpgdkLWi9u3yZsQb2RMra9hbyQigJgP0Strmoe0FvUuBFpUr38TCnpiM-QU1F5yCiaOyfM0yYGAAVNmYsDgi3vdBrnkCu38cVZBDLx9imWHYBEiIAJYeRfgrGEcIfY2uND5T56Doc-rKLuikeCCCzceCVjzH9xakFrAq3VrTuzonqdJNygauQn8elrlZTpZdLDtvg"/>
// </div>
// <div class="flex justify-between items-start">
// <div>
// <h3 class="text-xl font-headline italic">Boho Coaster Set (6pc)</h3>
// <p class="text-sm text-secondary mt-1 uppercase tracking-wider">DIY Painting Series</p>
// </div>
// <div class="text-right">
// <span class="text-xl font-headline block">₹450</span>
// <button class="mt-2 text-on-background hover:text-primary transition-colors">
// <span class="material-symbols-outlined">add_shopping_cart</span>
// </button>
// </div>
// </div>
// </div>
// <!-- Product Card 5 -->
// <div class="group">
// <div class="aspect-[4/5] overflow-hidden bg-surface-container mb-6">
// <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Minimalist Pine Mirror Frame" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOSB38phca-NIFH5xLhw8uHaUNdHk8u-c8AlvilRqLjqzQmU4f3DoLFAxJfkBFeMLCXnaZ8eKob7jeIW1tY0RfbjFrhYt2cFi1yNqecP-HBJTT4EOTfNe-gwwFtBS3Hfg0skeZjCwe-ZwrTFBcLIpJKdL3lqaVu-2mMADM8eBfAg_holRtN4VIw9A10Myl5jeqYk-dVU9ACvYzH6g-1PBQa13OJM36b005JVPiAmRq3peGSmj5D-k-urzpB6pPlvP4SketxeWuqo"/>
// </div>
// <div class="flex justify-between items-start">
// <div>
// <h3 class="text-xl font-headline italic">Minimalist Pine Mirror Frame</h3>
// <p class="text-sm text-secondary mt-1 uppercase tracking-wider">24" x 36" Signature Piece</p>
// </div>
// <div class="text-right">
// <span class="text-xl font-headline block">₹3,800</span>
// <button class="mt-2 text-on-background hover:text-primary transition-colors">
// <span class="material-symbols-outlined">add_shopping_cart</span>
// </button>
// </div>
// </div>
// </div>
// </div>
// <!-- Pagination -->
// <div class="mt-24 flex justify-center items-center gap-12 border-t border-outline-variant pt-12">
// <button class="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
// <span class="material-symbols-outlined text-base">west</span> Prev
//                 </button>
// <div class="flex gap-8">
// <button class="text-primary font-bold">01</button>
// <button class="hover:text-primary transition-colors">02</button>
// <button class="hover:text-primary transition-colors">03</button>
// <span class="text-outline">...</span>
// <button class="hover:text-primary transition-colors">12</button>
// </div>
// <button class="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
//                     Next <span class="material-symbols-outlined text-base">east</span>
// </button>
// </div>
// </section>
// </div>
// </main>
// <!-- Footer -->
// <footer class="bg-on-background text-background w-full">
// <div class="w-full py-20 px-6 flex flex-col items-center gap-16 max-w-[1280px] mx-auto text-center">
// <div>
// <div class="text-4xl font-headline italic mb-4">Frames 41</div>
// <p class="text-sm uppercase tracking-widest text-secondary">Crafting tools for the conscious creator since 2018.</p>
// </div>
// <nav class="flex flex-wrap justify-center gap-x-12 gap-y-6 text-xs font-bold uppercase tracking-widest">
// <a class="hover:text-primary transition-colors" href="#">Privacy Policy</a>
// <a class="hover:text-primary transition-colors" href="#">Terms of Service</a>
// <a class="hover:text-primary transition-colors" href="#">Shipping Info</a>
// <a class="hover:text-primary transition-colors" href="#">Contact Us</a>
// </nav>
// <div class="flex gap-8">
// <a class="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-primary transition-colors rounded-full" href="#">
// <img alt="Instagram" class="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBREZo-ocpQeBy1krCy77m3WCOl0gO217yLbjbKR7ZbhjRQgflrcP3xS5JZtau-l6oqv9HUhZlNaXJi9OMKHYFykg1c8pwqpzq2uYTAs2mgSDOHRSGDJSrP11uYlg9A8hJUeADa-hGSl3aY91yC9t7Ta85GsN8iqwx79q8dPhqb11jmrZGexDPskWH-FE3fdJC9mu8uHU0VPvqHpv9TX0IdFUtLiwJ51emG9kphOlLLcNzFFa0YHpwbF5dUnenaNlSXEcL-8cEX9EU"/>
// </a>
// <a class="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-primary transition-colors rounded-full" href="#">
// <img alt="Pinterest" class="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTFwbPJsIQ-Fn_ThAECsTl9u94RM_EaFHnf-qCp8vLPIHp6htq0lIR-AOyqYJmGyT0NnNSy1N2nkSrKxhfqzSMTEHO406O5kN9UqEktx36TGvJfi5d4Hl_5rOLKT8p3_YmtnMAfIEQgF5aosEE4YCJqw2iFEzRnQTGBx49h5Ll6kihHgJAC-6DoFgEr7r2_YJmS0aG_Kg1YHbA5nPGR6pjVGFHGT70MSopMYUFMstTGPbOyXC6BKSug6gKsUyX_MGS3cu13MbO3Nk"/>
// </a>
// </div>
// <div class="pt-8 border-t border-white/5 w-full text-[10px] uppercase tracking-widest text-secondary">
//             © 2024 Frames 41. All Rights Reserved.
//         </div>
// </div>
// </footer>
// </body></html>