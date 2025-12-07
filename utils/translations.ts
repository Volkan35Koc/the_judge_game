export const t = {
  menuTitle: "Ağır Ceza Mahkemesi",
  menuSubtitle: "Adalet, Mülkün Temelidir.",
  callCase: "Celseyi Başlat",
  aiPowered: "Yapay Zeka Destekli Yargı Simülasyonu",
  loadingSummon: "Mahkeme Heyeti Teşkil Ediliyor...",
  loadingDeliberate: "Heyet Müzakere Ediyor...",
  verdictTitle: "Hüküm",
  guilty: "MAHKUMİYET",
  notGuilty: "BERAAT",
  sentenceLabel: "Hüküm Fıkrası (Müeyyide)",
  sentencePlaceholder: "Hükmedilen ceza süresini ve infaz şartlarını giriniz...",
  reasoningLabel: "Gerekçeli Karar",
  reasoningPlaceholder: "Kararın yasal dayanaklarını, delillerin değerlendirilmesini ve vicdani kanaatinizi açıklayınız...",
  backToTrial: "Duruşmaya Devam Et",
  deliverJudgment: "Hükmü Tefhim Et",
  courtRecord: "Duruşma Tutanağı",
  evidenceFile: "Dava Dosyası",
  incidentReport: "İddianame ve Olay Özeti",
  exhibits: "Maddi Deliller ve Emareler",
  witnessList: "Tanık ve Taraf Listesi",
  beginTrial: "Yargılamayı Başlat",
  targetPlaceholder: "Muhatap Seçiniz...",
  questionPlaceholder: "Sorunuzu yöneltiniz...",
  prosecution: "Katılan Vekili", 
  defense: "Sanık Müdafii",
  witnessStand: "Tanık Kürsüsü",
  judge: "Mahkeme Başkanı (Siz)",
  performance: "Yargısal Denetim",
  correctVerdict: "Hukuka Uygun Karar",
  caseClosed: "Dava Sonuçlandı",
  evaluation: "Temyiz İncelemesi",
  menu: "Ana Menü",
  nextCase: "Sıradaki Dosya",
  officialRecord: "Resmi Duruşma Tutanağı",
  certifiedTranscript: "Görevli Mahkeme: Ağır Ceza Mahkemesi",
  prosecutor: "Katılan Vekili", 
  defenseAttorney: "Sanık Müdafii",
  defendant: "Sanık",
  viewEvidence: "Dosyayı İncele",
  presentEvidence: "Delil Göster",
  selectEvidence: "Gösterilecek delili seçiniz...",
  evidencePresented: "Mahkemeye Sunulan Delil:",
  cancel: "Vazgeç",
  
  // Menu & Settings
  resetConfirm: "Tüm ilerlemeyi sıfırlayıp en başa dönmek istediğinize emin misiniz?",
  exitConfirm: "Ana menüye dönmek istediğinize emin misiniz? Mevcut dava durumu kaydedilecektir.",
  quitConfirm: "Oyunu kapatmak istediğinize emin misiniz?",
  continueGame: "Devam Et",
  startGame: "Oyuna Başla",
  newGame: "Yeni Oyun",
  exitGame: "Oyundan Çık",
  saveGame: "Oyunu Kaydet",
  settings: "Ayarlar",
  volume: "Ses Düzeyi",
  volMusic: "Müzik Sesi",
  volAmbience: "Ortam Sesi",
  volSfx: "Efektler",
  brightness: "Parlaklık",
  close: "Kapat",
  restartCase: "Davayı Yeniden Başlat",
  
  // Notebook & Deliberation
  notebook: "Hakim Not Defteri",
  notebookPlaceholder: "Duruşma sırasında önemli gördüğünüz notları buraya alabilirsiniz...",
  deliberationRoom: "Müzakere Odası",
  keyPoints: "Kritik Bulgular ve Çelişkiler"
};

export const getRoleName = (role: string): string => {
  switch (role) {
    case 'Prosecutor': return 'Katılan Vekili';
    case 'Defense Attorney': return 'Sanık Müdafii';
    case 'Witness': return 'Tanık';
    case 'Defendant': return 'Sanık';
    case 'System': return 'Mübaşir';
    case 'Judge': return 'Mahkeme Başkanı';
    default: return role;
  }
};