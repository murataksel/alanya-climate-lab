# Alanya İklim Laboratuvarı · v1.1

Gerçek Alanya coğrafyasında müdahale tasarlama ve alternatif karşılaştırma oyunu. Türkçe / English. Merkez, Oba çevresi ve Mahmutlar hazır alanları vardır; Alanya haritasından başka bir 1 km² alan da seçilebilir.

## Başlatma

Bağımsız paketi açıp `index.html` dosyasını çift tıklayın. Kaynak depo içindeyseniz dosya `dist/index.html` konumundadır. Kurulum, API anahtarı veya model sunucusu gerekmez. Veriler ve kütüphane pakettedir. Senaryolar tarayıcıda saklanır; başka cihazda açmak veya yedeklemek için JSON indirin.

## Sokak haritası altlığı

Web sürümü, OpenStreetMap France tarafından sunulan OpenStreetMap sokak haritasıyla açılır. Haritanın üstündeki **Harita altlığı** seçicisinden çevrimdışı veri altlığına geçilebilir. **Arazi örtüsü görünürlüğü** kaydırıcısı WorldCover katmanını %0–100 arasında ayarlar; çizilen müdahaleler, geometrik gölgeler ve seçili tehlike ayrı katmanlarda kalır. Altlık ve görünürlük tercihleri bu tarayıcıda saklanır.

OpenStreetMap internet bağlantısı gerektirir. `index.html` dosyasını yerel dosya olarak açtığınızda çevrimdışı altlık kullanılır. Sokak görüntüleri yüklenemezse veri altlığı kullanılabilir. Altlıkta görünen binalar ve yollar yalnızca görsel bağlamdır; hesap envanterine otomatik aktarılmaz ve sayısal sonuçları değiştirmez.

Harita verisi © OpenStreetMap katkıcıları (ODbL); kartografya © OpenStreetMap France (CC BY-SA 2.0). Atıflar haritada görünürdür. Sokak görüntüleri pakete alınmaz veya toplu indirilmez. Bu herkese açık akademik site, hizmeti ticari olmayan, makul trafikli etkileşimli kullanım koşullarıyla kullanır: https://www.openstreetmap.fr/usage/.

## İlk deneme

1. Merkez alanında **Örnek tasarımı ekle** düğmesine basın.
2. **Dengeli dönüşüm** görevini seçin. Bina aracıyla karşılıklı iki köşeye tıklayarak yapı ekleyin.
3. Öğeye veya müdahale listesindeki adına tıklayıp yüksekliğini / kat sayısını düzenleyin. Merkez tutamacını sürükleyerek taşıyın; Geri al ile işlemi geri döndürün.
4. Yağışı veya güneş saatini değiştirerek aynı tasarımı farklı koşullarda inceleyin.
5. Senaryoyu kaydedip ikinci bir alternatif oluşturun. **Karşılaştır** sekmesi ve CSV indirme ile sonuçları değerlendirin.
6. Mahmutlar’da **Sabit taşkın katmanı** seçin. Bu katman müdahaleyle yeniden hesaplanmaz; kaynak taşkın hücreleriyle bilinen bina ayak izlerinin örtüşmesini gösterir.

Ağaç tek noktaya yerleşir. Bina ve gölgelik iki köşe ile; park, geçirgen yüzey, yağmur bahçesi ve depolama çokgen ile çizilir. Çokgeni en az üç noktadan, yolu en az iki noktadan sonra **Çizimi tamamla** ile bitirin. Esc iptal eder.

Klavye: haritaya odaklanın; oklar 20 m, Shift+oklar 5 m hareket ettirir. Boşluk nokta ekler, Enter çizimi bitirir. Mobilde koşullar ve müdahale listesi açılır/kapanır; **Haritaya geç** düğmesi vardır.

## Bina verisi ekleme

**İçe aktar → Bina envanteri ekle** üzerinden WGS84 GeoJSON Polygon/MultiPolygon yükleyin. `height` metre; `building:levels` veya `floors` kat sayısıdır. Eksik yükseklik 9 m, eksik kat sayısı yaklaşık yükseklik/3 kabul edilir. Çalışma alanıyla kesişen en çok 3000 kaynak bina kullanılır. Kaynak öğe silinmez; kaldırma tasarım senaryosuna işlenir. Bu sürümde gerçek tekil bina/ağaç envanteri hazır değildir; rasterin yapılaşmış sınıfı bina oturumu olarak yorumlanmaz.

## Sonuçların anlamı

- **Geometrik gölge:** bilinen ve çizilen yükseklikler, ideal küresel taçlar, güneş geometrisi ve yatay zemin varsayımı. °C veya UTCI farkı değildir. Tam mevcut bina/ağaç gölgesi bilinmez.
- **Potansiyel olay akışı:** yağış × alan × kullanıcı katsayısı; bağlı akış payıyla sınırlı ideal depolama. Hidrodinamik akış, süre, drenaj kapasitesi veya taşkın derinliği çözülmez. Yağışa tekerrür süresi atanmamıştır.
- **Su ve maliyet:** kullanıcı tarafından değiştirilebilen oyun varsayımlarıdır. Yerel ölçümlerle kalibre edilmiş sulama talimatı veya piyasa fiyatı değildir. Ağaç eklemek tek başına yüzeyin akış katsayısını değiştirmez. Kaldırılmış bilinen binanın altında çıplak zemin varsayılır.
- **Taşkın örtüşmesi:** ham kaynak T100 katmanıyla ayak izi kesişimi. Verisiz / boyasız konum taşkın olmadığı anlamına gelmez. Müdahaleler bu kaynak derinlikleri değiştirmez.

Arazi kaynağı sağlanan WorldCover 2021 v200 ürününün 20 m yeniden projelendirilmiş sınıflarıdır. 5 m hesap ızgarası kaynak ayrıntısını artırmaz. 2026 arazi örtüsü, LST, nüfus, yangın ve kuraklık çıktıları ayrı bağlam katmanlarıdır. Kaynak tarihlerinin ve sınırlarının farklılığı korunur. Yangın yayılımı ve ürün verimi hesaplanmaz.

Her hesap **Yöntem ve veriler** içinde açıklanır. `VALIDATION.json` yazılım, kaynak dönüşümü ve tarayıcı kontrollerini kaydeder; bilimsel model doğrulaması değildir. Kaynak ve atıflar İngilizce README içindedir.

## GitHub atlasına ekleme

Ayrı **GITHUB_ADDON** paketi v11 FINAL içindir. İçindeki `alanya-heatwave-atlas` klasörünün içeriğini mevcut depo köküne kopyalayın; aynı dosyaları değiştirin, klasörleri birleştirin. Depo içinde ikinci bir atlas klasörü oluşturmayın. Dört atlas giriş sayfasına dil tercihini izleyen Laboratuvar bağlantısı eklenir. Mevcut sayısal çıktılar korunur. Commit ve Push sonrası sayfayı Ctrl+F5 ile yenileyin. Oyunun yolu: `climate-lab/index.html`.
