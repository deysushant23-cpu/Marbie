const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!data.carousel) {
  data.carousel = [
    {
      id: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g",
      title: "Timeless Elegance",
      subtitle: "LUXURY REDEFINED",
      active: true
    },
    {
      id: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU5GyugSuyr6C--PwVe1hM0gMwITQmzadOQ5tygnjMd5Zs-SY09oU50p9t3AQemU0q4OMnloyHYvIe4Mi48GAhCoSlOuzO5XdSSw0xcIP-opTGbUW_0xokqXN9P8hunm7o-e9ZyoL9rM-ochRk-nOk3jfewQgm6srCts-r7TUbrG4sdRzmsHpj_Rp-yDvSExhYS-tntX2jU1ic5aL5bie-Fz-Zw06kyaz8KPCgF9QumT3PMMaR90-L0wzAbXfE7HsN3Q8IDGr2hT_7",
      title: "Bridal Collection",
      subtitle: "YOUR SPECIAL DAY",
      active: true
    },
    {
      id: 3,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASqiSfToQfLYslZDiBNtAHzem1wtT7rMHyvKoBVPgr_sqccZ8UWFTTlGD7enhlZtLAInxiUdKBOjaHnHiJGaFPqXphiFGhU9s2s0mL1s75c7sii41Sigpq5RIWrfPtd7Y1jF4arCFiNAVkeT28dnCVb8f3zDWpMxUp1yjApcZLQKGR-rHQWtw1ciihK7yiuhVxocEwyasRaRUKGqDf9s4ECgGO0wSqcYawtRaB2i9G-12grz_ZjJM-Krwzs4h-yrPuEf4kwYCl9N-y",
      title: "New Arrivals",
      subtitle: "DISCOVER TRENDS",
      active: true
    }
  ];
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log('Added carousel to db.json');
} else {
  console.log('Carousel already exists in db.json');
}
