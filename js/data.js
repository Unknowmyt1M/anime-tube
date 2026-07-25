/* ==========================================================================
   ANITUBE MOCK DATASET & SHORTS DATA
   ========================================================================== */

const ANITUBE_DATA = {
  hero: {
    id: "solo-leveling",
    title: "Solo Leveling: Arise",
    subtitle: "Season 1 • Episode 12",
    rating: "9.8",
    year: "2024",
    quality: "4K HDR",
    description: "In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the weakest hunter, obtains a secret power to level up infinitely.",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1400&auto=format&fit=crop",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },

  shows: [
    {
      id: "solo-leveling",
      title: "Solo Leveling",
      genres: ["Action", "Fantasy"],
      rating: "9.8",
      episodesCount: 12,
      banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "demon-slayer",
      title: "Demon Slayer: Kimetsu no Yaiba",
      genres: ["Action", "Supernatural"],
      rating: "9.2",
      episodesCount: 55,
      banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      genres: ["Dark Fantasy", "Action"],
      rating: "9.5",
      episodesCount: 47,
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop"
    }
  ],

  continueWatching: [
    {
      id: "demon-slayer",
      title: "Demon Slayer: Kimetsu no Yaiba",
      episode: "Ep 8 • Swordsmith Village",
      progress: 65,
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
      rating: "9.2"
    },
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      episode: "Ep 18 • Shibuya Incident",
      progress: 40,
      posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop",
      rating: "9.5"
    },
    {
      id: "attack-on-titan",
      title: "Attack on Titan",
      episode: "Ep 24 • The Final Chapters",
      progress: 88,
      posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
      rating: "9.7"
    }
  ],

  trending: [
    {
      id: "solo-leveling",
      title: "Solo Leveling",
      genres: ["Action", "Fantasy"],
      rating: "9.8",
      episodesCount: 12,
      posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "demon-slayer",
      title: "Demon Slayer S3",
      genres: ["Action", "Supernatural"],
      rating: "9.2",
      episodesCount: 55,
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen S2",
      genres: ["Dark Fantasy", "Action"],
      rating: "9.5",
      episodesCount: 47,
      posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "chainsaw-man",
      title: "Chainsaw Man",
      genres: ["Action", "Horror"],
      rating: "8.9",
      episodesCount: 12,
      posterUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
    }
  ],

  recommendations: [
    {
      id: "one-piece",
      title: "One Piece",
      genres: ["Adventure", "Action"],
      rating: "9.6",
      episodesCount: 1090,
      posterUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "naruto-shippuden",
      title: "Naruto Shippuden",
      genres: ["Ninja", "Action"],
      rating: "9.1",
      episodesCount: 500,
      posterUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "bleach-tybw",
      title: "Bleach: Thousand-Year Blood War",
      genres: ["Action", "Supernatural"],
      rating: "9.3",
      episodesCount: 26,
      posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // SHORTS DATASET
  shorts: [
    {
      id: "short-1",
      title: "Sung Jinwoo Leveling Up Epic Aura ⚡ #SoloLeveling",
      anime: "Solo Leveling",
      showId: "solo-leveling",
      likes: "245K",
      comments: "1.8K",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-anime-character-in-a-futuristic-city-41556-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "short-2",
      title: "Muichiro Tokito Mist Breathing 7th Form 🌫️ #DemonSlayer",
      anime: "Demon Slayer",
      showId: "demon-slayer",
      likes: "189K",
      comments: "950",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fantasy-anime-style-landscape-41555-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "short-3",
      title: "Gojo Satoru Unlimited Void Domain Expansion 🤞 #JujutsuKaisen",
      anime: "Jujutsu Kaisen",
      showId: "jujutsu-kaisen",
      likes: "520K",
      comments: "4.2K",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-looking-at-the-sky-41554-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop"
    }
  ],

  episodes: {
    "demon-slayer": Array.from({ length: 55 }, (_, i) => ({
      number: i + 1,
      num: i + 1,
      title: i === 7 ? "Sabito and Makomo" : (i === 11 ? "Swordsmith Village Arc" : `Episode ${i + 1}: The Battle Begins`),
      duration: "23m",
      thumbnail: i % 2 === 0 
        ? "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop"
    })),

    "solo-leveling": Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      num: i + 1,
      title: `Episode ${i + 1}: Arise & Conquer`,
      duration: "24m",
      thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop"
    })),

    "jujutsu-kaisen": Array.from({ length: 47 }, (_, i) => ({
      number: i + 1,
      num: i + 1,
      title: `Episode ${i + 1}: Shibuya Incident`,
      duration: "23m",
      thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&auto=format&fit=crop"
    }))
  }
};

window.ANITUBE_DATA = ANITUBE_DATA;
