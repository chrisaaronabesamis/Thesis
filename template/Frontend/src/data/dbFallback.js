export const FALLBACK_COLLECTIONS = [
  {
    collection_id: 1,
    group_community_id: 1,
    name: "BiniVerse",
    img_url: "https://th.bing.com/th/id/OIP.zqP7PjZvldppMNNBP-D2AwHaHa?w=166&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
    description: null,
  },
  {
    collection_id: 3,
    group_community_id: 1,
    name: "Binified",
    img_url: "https://store.abs-cbn.com/cdn/shop/collections/BINIfied_Website_Thumbnail.jpg?v=1763106912&width=1500",
    description: "test",
  },
];

export const FALLBACK_PRODUCTS = [
  {
    product_id: 1,
    name: "BINIverse World Tour - T-Shirt",
    collection_id: 1,
    product_category: "Apparel",
    image_url: "https://store.abs-cbn.com/cdn/shop/files/BINI_World_Tour_SHIRT_BACK.png?v=1738236935&width=493",
  },
  {
    product_id: 2,
    name: "BiniFied T-shirt",
    collection_id: 3,
    product_category: "Apparel",
    image_url: "https://store.abs-cbn.com/cdn/shop/files/BINIfiedProductImages-TShirt-Back.png?v=1763017728&width=360",
  },
  {
    product_id: 3,
    name: "BIniFied Pullover",
    collection_id: 3,
    product_category: "Apparel",
    image_url: "https://store.abs-cbn.com/cdn/shop/files/BINIfiedProductImages-LongSleeves-Front.png?v=1763018103&width=360",
  },
  {
    product_id: 4,
    name: "BiniFied Cap",
    collection_id: 3,
    product_category: "Apparel",
    image_url: "https://store.abs-cbn.com/cdn/shop/files/BINIfiedProductImages-Cap_0621ebe1-b936-4e6d-bead-bbd6a705980c.png?v=1763016405&width=360",
  },
];

export const FALLBACK_VARIANTS = [
  { variant_id: 1, product_id: 1, variant_name: "Size", variant_values: "Small", price: 100, stock: 8, weight_g: 0 },
  { variant_id: 2, product_id: 1, variant_name: "Size", variant_values: "Medium", price: 80, stock: 10, weight_g: 0 },
  { variant_id: 3, product_id: 1, variant_name: "Size", variant_values: "Large", price: 120, stock: 10, weight_g: 0 },
  { variant_id: 4, product_id: 2, variant_name: "Size", variant_values: "Small", price: 1299, stock: 19, weight_g: 0 },
  { variant_id: 5, product_id: 2, variant_name: "Size", variant_values: "Medium", price: 1500, stock: 10, weight_g: 0 },
  { variant_id: 6, product_id: 2, variant_name: "Size", variant_values: "Large", price: 2000, stock: 20, weight_g: 0 },
  { variant_id: 7, product_id: 3, variant_name: "Size", variant_values: "Small", price: 1499, stock: 1, weight_g: 0 },
  { variant_id: 8, product_id: 3, variant_name: "Size", variant_values: "Medium", price: 2000, stock: 10, weight_g: 0 },
  { variant_id: 9, product_id: 3, variant_name: "Size", variant_values: "Large", price: 3000, stock: 10, weight_g: 0 },
  { variant_id: 10, product_id: 4, variant_name: "Size", variant_values: "Small", price: 500, stock: 14, weight_g: 0 },
];

export const FALLBACK_DISCOGRAPHY = [
  {
    album_id: 4,
    title: "Flames",
    songs: 7,
    year: "2025",
    cover_image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772443809/uploads/mrchkjei0tj6mfqxdum9.png",
    album_link: "https://open.spotify.com/album/42s2X3WQppxdHafUT2dfmF?si=1&nd=1&dlsi=9b6451ab7eb84595",
  },
  {
    album_id: 9,
    title: "Talaarawan",
    songs: 6,
    year: "2024",
    cover_image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444388/uploads/wvskulgfuajgleflki4b.png",
    album_link: "https://open.spotify.com/album/2eT1XApzS0GmkJLMlCBdVv?si=1&nd=1&dlsi=2e4b8be088a24ef8",
  },
  {
    album_id: 12,
    title: "Pantropiko",
    songs: 1,
    year: "2023",
    cover_image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444748/uploads/ct7rk0mpwa9m0bwl9xoi.png",
    album_link: "https://open.spotify.com/album/3NYOeU6Uwj2FP1Zz1rWVz8?si=1&nd=1&dlsi=d5617df4860e4716",
  },
];

export const FALLBACK_EVENTS = [
  {
    event_id: 1,
    ticket_link: "https://www.ticketnet.com.ph/event-detail/BINIfied",
    image_url: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772448361/uploads/lpvxoohb6rwiosuhtlpp.png",
    title: "BINIfied",
    event_date: "2026-06-20T19:00:00+08:00",
    venue: "Smart Araneta Coliseum",
    city: "Quezon City",
    barangay: "Socorro",
    description: "Special fan meet segments, live performances, and exclusive merch booth.",
  },
  {
    event_id: 2,
    ticket_link: "https://www.ticketnet.com.ph/event-detail/BINIverse-The-First-Solo-Concert",
    image_url: "https://res.cloudinary.com/dfuglnaz2/image/upload/v1759407990/1000010193_ueru7w.png",
    title: "BINIverse The First Solo Concert",
    event_date: "2026-09-13T20:00:00+08:00",
    venue: "SM Mall of Asia Arena",
    city: "Pasay City",
    barangay: "Barangay 76",
    description: "Full concert set with opening acts and limited VIP soundcheck access.",
  },
];

export const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "BINI Cosmetics Livestream",
    venue: "BINI.Global Livestream",
    date: "2026-06-11",
    author: "Admin",
    is_pinned: 0,
  },
  {
    id: 6,
    title: "Complete the BINI FLAMES experience with the newest merch!",
    venue: "Do not miss your chance to own the limited-edition BINI FLAMES Shirt.",
    date: "2026-03-11",
    author: "Admin",
    is_pinned: 1,
  },
];

export const FALLBACK_ABOUT = {
  community_id: 1,
  name: "bini",
  description:
    "BINI is an 8-member Filipino girl group formed by ABS-CBN Star Hunt Academy. Known for their powerful vocals, synchronized choreography, and inspiring message of empowerment.",
};

export const FALLBACK_MEMBERS = [
  {
    id: "member-aiah",
    name: "Aiah",
    role: "Leader, Rapper",
    description: "Calm leadership and confident stage identity.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444748/uploads/ct7rk0mpwa9m0bwl9xoi.png",
  },
  {
    id: "member-colet",
    name: "Colet",
    role: "Main Vocal",
    description: "Power vocals with clean, emotional delivery.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444388/uploads/wvskulgfuajgleflki4b.png",
  },
  {
    id: "member-maloi",
    name: "Maloi",
    role: "Lead Vocal",
    description: "Distinct tone and expressive performance style.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444559/uploads/jxdatozr2zkeirrfyysa.png",
  },
  {
    id: "member-gwen",
    name: "Gwen",
    role: "Main Dancer",
    description: "Strong choreography precision and stage control.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444649/uploads/gdlwwz0nvhwh5dvtzc61.png",
  },
  {
    id: "member-jhoanna",
    name: "Jhoanna",
    role: "Leader, Lead Vocal",
    description: "Grounded leadership with expressive live delivery.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772443809/uploads/mrchkjei0tj6mfqxdum9.png",
  },
  {
    id: "member-mikha",
    name: "Mikha",
    role: "Main Rapper",
    description: "Sharp rap tone and strong stage charisma.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444079/uploads/amwk3ojmmp33c9hq9blp.png",
  },
  {
    id: "member-stacey",
    name: "Stacey",
    role: "Lead Rapper",
    description: "Stylish flow with clean performance timing.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444186/uploads/v0ca82ede66bbfh0emih.png",
  },
  {
    id: "member-sheena",
    name: "Sheena",
    role: "Main Dancer",
    description: "Powerful movement control and fan-favorite energy.",
    image: "https://res.cloudinary.com/dv7b0rwzl/image/upload/v1772444279/uploads/uxqpbnon3sn8hrai1koh.png",
  },
];
