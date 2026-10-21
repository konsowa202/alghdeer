import os
import base64
import subprocess
from pathlib import Path

def get_b64(rel_path):
    p = Path("D:/alghdeer") / rel_path
    if not p.exists():
        print(f"Warning: File not found: {p}")
        return ""
    mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
    with open(p, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{data}"

print("Encoding assets to Base64...")
# Base assets
b64_logo_dark = get_b64("public/logo-dark-bg.png")
b64_logo_white = get_b64("public/logo-white.png")

# Generated Mockups & Blueprints
b64_blueprint = get_b64("public/brand_guidelines/logo_anatomy_blueprint.jpg")
b64_laptop_mockup = get_b64("public/brand_guidelines/laptop_frameless_mockup.jpg")
b64_mobile_mockup = get_b64("public/brand_guidelines/mobile_frameless_mockup.jpg")
b64_desktop_live = get_b64("public/brand_guidelines/desktop_live.png")
b64_mobile_live = get_b64("public/brand_guidelines/mobile_live.png")

# Photos from camp
b64_portal = get_b64("public/nano/wbk_portal_hero.jpg")
b64_safari = get_b64("public/nano/wbk_card_safari.jpg")
b64_live_stage = get_b64("public/nano/wbk_card_live_nights.jpg")
b64_aerial = get_b64("public/nano/wbk_card_aerial_camp.jpg")
b64_majlis_gate = get_b64("public/nano/wbk_card_majlis_gate.jpg")
b64_glass_pavilion = get_b64("public/nano/nb_glass_pavilion.jpg")
b64_campfire = get_b64("public/nano/nb_campfire_majlis.jpg")
b64_banquet = get_b64("public/nano/nb_royal_banquet.jpg")
b64_walkway = get_b64("public/nano/nb_bohemian_walkway_cinematic.jpg")

# Logos variations
b64_logo_gold_dark = get_b64("public/logos_concepts/logo_alghdeer_en_01_mars_gold_dark.jpg")
b64_logo_gold_white = get_b64("public/logos_concepts/logo_alghdeer_en_02_mars_gold_white.jpg")
b64_logo_duotone = get_b64("public/logos_concepts/logo_alghdeer_en_08_wbk_duotone_dark.jpg")

print("Building HTML slides...")

# We will write the complete HTML file with all 20 slides
html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>ALGHDEER CAMP — BRAND IDENTITY GUIDELINES V2.0</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800;900&family=Cinzel:wght@600;700;900&display=swap');

@page {{
  size: 1920px 1080px;
  margin: 0;
}}

* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

body {{
  background: #000000;
  color: #ffffff;
  font-family: 'IBM Plex Sans Arabic', 'Cairo', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}

.slide {{
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  background: #0b0c10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 50px 70px 40px 70px;
}}

/* Ambient Golden Glows */
.ambient-glow-tr {{
  position: absolute;
  top: -150px;
  right: -150px;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(203, 161, 53, 0.12) 0%, rgba(203, 161, 53, 0) 70%);
  pointer-events: none;
  z-index: 1;
}}
.ambient-glow-bl {{
  position: absolute;
  bottom: -200px;
  left: -200px;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(203, 161, 53, 0.08) 0%, rgba(203, 161, 53, 0) 70%);
  pointer-events: none;
  z-index: 1;
}}

/* Header Bar */
.slide-header {{
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid rgba(203, 161, 53, 0.25);
  padding-bottom: 18px;
  position: relative;
  z-index: 10;
}}
.header-titles {{
  display: flex;
  flex-direction: column;
  gap: 4px;
}}
.slide-eyebrow {{
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #cba135;
}}
.slide-title {{
  font-family: 'Cairo', sans-serif;
  font-size: 34px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.15;
  display: flex;
  align-items: center;
  gap: 16px;
}}
.slide-title span.en {{
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.08em;
}}
.header-meta {{
  display: flex;
  align-items: center;
  gap: 24px;
}}
.header-logo {{
  height: 32px;
  width: auto;
  opacity: 0.9;
}}
.slide-num {{
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #cba135;
  letter-spacing: 0.15em;
  padding: 6px 14px;
  border: 1px solid rgba(203, 161, 53, 0.35);
  background: rgba(203, 161, 53, 0.06);
}}

/* Content Body */
.slide-body {{
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  margin: 30px 0;
}}

/* Footer Bar */
.slide-footer {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 14px;
  font-family: 'Montserrat', 'IBM Plex Sans Arabic', sans-serif;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 10;
}}
.footer-gold {{
  color: #cba135;
  font-weight: 700;
}}

/* Common Card Styles */
.glass-card {{
  background: rgba(18, 19, 25, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  position: relative;
}}
.glass-card-gold {{
  background: rgba(18, 19, 25, 0.85);
  border: 1px solid rgba(203, 161, 53, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  padding: 30px;
  position: relative;
}}
.card-tag {{
  display: inline-block;
  padding: 4px 10px;
  background: rgba(203, 161, 53, 0.15);
  color: #cba135;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 12px;
  border-left: 2px solid #cba135;
}}

/* Sadu gold line */
.sadu-accent {{
  height: 2px;
  background: linear-gradient(90deg, #9e761b, #cba135 50%, #f3db8b);
  width: 100%;
  margin: 12px 0 20px 0;
}}
</style>
</head>
<body>

<!-- ========================================== -->
<!-- SLIDE 01: MASTER COVER                     -->
<!-- ========================================== -->
<div class="slide" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at center, #13151f 0%, #08090c 75%, #030304 100%);">
  <div class="ambient-glow-tr" style="width: 1000px; height: 1000px; opacity: 0.7;"></div>
  <div class="ambient-glow-bl" style="width: 1000px; height: 1000px; opacity: 0.5;"></div>
  
  <!-- Outer Luxury Border -->
  <div style="position: absolute; inset: 30px; border: 1px solid rgba(203, 161, 53, 0.3); pointer-events: none;"></div>
  <div style="position: absolute; inset: 34px; border: 1px solid rgba(203, 161, 53, 0.12); pointer-events: none;"></div>

  <!-- Corner Ornamental Accents -->
  <div style="position: absolute; top: 40px; right: 40px; font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.3em; color: rgba(203, 161, 53, 0.6); text-transform: uppercase;">
    COORD: 21.6845° N, 39.2241° E • JEDDAH
  </div>
  <div style="position: absolute; top: 40px; left: 40px; font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.3em; color: rgba(203, 161, 53, 0.6); text-transform: uppercase;">
    EDITION: 2026 / V2.0
  </div>

  <div style="max-width: 1200px; z-index: 10; display: flex; flex-direction: column; align-items: center;">
    <div style="margin-bottom: 25px;">
      <span style="font-family: 'Montserrat'; font-size: 14px; font-weight: 800; letter-spacing: 0.4em; text-transform: uppercase; color: #cba135; padding: 8px 24px; border: 1px solid rgba(203, 161, 53, 0.4); background: rgba(203, 161, 53, 0.08);">
        OFFICIAL BRAND IDENTITY GUIDELINES
      </span>
    </div>

    <!-- Master Hero Logo -->
    <div style="margin: 20px 0 35px 0;">
      <img src="{b64_logo_dark}" alt="ALGHDEER camp" style="max-height: 140px; width: auto; object-contain: contain; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8));">
    </div>

    <div style="width: 280px; height: 2px; background: linear-gradient(90deg, transparent, #cba135, transparent); margin-bottom: 35px;"></div>

    <h1 style="font-family: 'Cairo', sans-serif; font-size: 54px; font-weight: 900; color: #ffffff; letter-spacing: -0.01em; margin-bottom: 12px; line-height: 1.1;">
      دليل الهوية البصرية ودستور العلامة التجارية
    </h1>
    <p style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 400; color: rgba(255, 255, 255, 0.65); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 40px;">
      Comprehensive Visual System & Architectural Brand Constitution
    </p>

    <!-- Meta Details Grid -->
    <div style="display: flex; gap: 40px; justify-content: center; margin-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 25px;">
      <div style="text-align: right;">
        <div style="font-size: 10px; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;">العلامة التجارية</div>
        <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-top: 3px;">مخيمات الغدير الفاخرة</div>
      </div>
      <div style="width: 1px; height: 35px; background: rgba(255, 255, 255, 0.15);"></div>
      <div style="text-align: right;">
        <div style="font-size: 10px; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;">الموقع الجغرافي</div>
        <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-top: 3px;">بريمان، جدة — المملكة العربية السعودية</div>
      </div>
      <div style="width: 1px; height: 35px; background: rgba(255, 255, 255, 0.15);"></div>
      <div style="text-align: right;">
        <div style="font-size: 10px; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;">الحالة والتصنيف</div>
        <div style="font-size: 15px; color: #4ade80; font-weight: 700; margin-top: 3px;">وثيقة تشغيلية معتمدة • STRICTLY CONFIDENTIAL</div>
      </div>
    </div>
  </div>

  <div style="position: absolute; bottom: 40px; font-size: 11px; letter-spacing: 0.25em; color: rgba(255, 255, 255, 0.35); text-transform: uppercase;">
    © 2026 ALGHDEER CAMP. ALL RIGHTS RESERVED. REGISTERED TRADEMARK.
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 02: BRAND MANIFESTO & NARRATIVE      -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">01. BRAND STRATEGY // الرؤية والقصة المؤسسية</div>
      <div class="slide-title">
        قصة الغدير والمانيفستو الصحراوي
        <span class="en">THE BRAND NARRATIVE & MANIFESTO</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">02 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center;">
    <!-- Left: Architectural Hero Image -->
    <div style="position: relative; height: 720px; border: 1px solid rgba(203, 161, 53, 0.3); overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
      <img src="{b64_portal}" alt="بوابة الغدير" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(11,12,16,0.85) 100%);"></div>
      <div style="position: absolute; bottom: 35px; right: 35px; left: 35px;">
        <span class="card-tag">الملاذ الصحراوي الأرقى</span>
        <h3 style="font-family: 'Cairo'; font-size: 28px; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 8px;">
          حيث تلتقي فخامة العمارة بأصالة الرمال
        </h3>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          بوابة الغدير المثلثة المضيئة تفتح آفاقاً جديدة للضيافة الصحراوية المستوحاة من كرم الضيافة الحجازية وروح التميز السعودي.
        </p>
      </div>
    </div>

    <!-- Right: The Manifesto Text -->
    <div style="display: flex; flex-direction: column; gap: 24px; padding-left: 20px;">
      <div class="glass-card-gold" style="border-right: 4px solid #cba135;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.25em; color: #cba135; text-transform: uppercase; margin-bottom: 8px;">
          المانيفستو باللغة العربية
        </div>
        <p style="font-size: 19px; line-height: 1.8; color: #ffffff; font-weight: 500;">
          "في قلب صحراء بريمان بجدة، وُلد <strong>'الغدير'</strong> ليعيد كتابة فصول الضيافة الصحراوية الفاخرة. هنا تنصهر شفافية القاعات الزجاجية الحديثة المكيفة مع انسيابية أشرعة الكانفاس البوهيمية، لنصنع ملاذاً يُشعل الحواس.. بين دفء القهوة السعودية ورنين العود الحي، وتحت قبة سماء لا حدود لسحرها."
        </p>
      </div>

      <div class="glass-card">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.25em; color: #cba135; text-transform: uppercase; margin-bottom: 8px;">
          ENGLISH BRAND MANIFESTO
        </div>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 15px; line-height: 1.75; color: rgba(255, 255, 255, 0.85); font-weight: 400;" dir="ltr">
          "From the raw expanse of Jeddah’s Burayman dunes emerges <strong>ALGHDEER</strong>: an exclusive desert sanctuary where architectural transparency meets bohemian canvas under starry Arabian skies. Designed for elite gatherings, corporate summits, and unforgettable starlit nights."
        </p>
      </div>

      <!-- 3 Core Brand Truths -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 10px;">
        <div class="glass-card" style="padding: 18px; text-align: center;">
          <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">01</div>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">المكان والموقع</div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;">عزلة فاخرة تبعد 25 دقيقة فقط عن نبض جدة</div>
        </div>
        <div class="glass-card" style="padding: 18px; text-align: center;">
          <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">02</div>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">الشعور والروح</div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;">احتواء دافئ يجمع بين هيبة الملوك وشاعرية البداوة</div>
        </div>
        <div class="glass-card" style="padding: 18px; text-align: center;">
          <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">03</div>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">الأفق والمعيار</div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;">جاهزية متكاملة لفعاليات كبار الشخصيات والشركات</div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 01 • STRATEGY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 03: BRAND PILLARS & STRATEGIC VALUES -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">01. BRAND STRATEGY // الركائز الأربع للعلامة</div>
      <div class="slide-title">
        ركائز وقيم العلامة التجارية
        <span class="en">CORE BRAND PILLARS & VALUES</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">03 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; align-items: stretch;">
    <!-- Pillar 1 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 32px; font-weight: 900; color: #cba135; margin-bottom: 8px;">01</div>
        <span class="card-tag">الأصالة الحية</span>
        <h3 style="font-family: 'Cairo'; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px;">
          الأصالة والضيافة العربية
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          نحتفي بجوهر التقاليد السعودية الأصيلة: من مراسم القهوة بالهيل والزعفران، وشبة النار الحية، إلى إيقاعات العود والطرب الشرقي تحت النجوم.
        </p>
      </div>
      <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
        <div style="font-size: 11px; color: #cba135; font-weight: 700; text-transform: uppercase;">التطبيق الملموس:</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px;">مجالس السدو الأرضية، دلال الرسلان النحاسية، وفرق الطرب التراثية.</div>
      </div>
    </div>

    <!-- Pillar 2 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 32px; font-weight: 900; color: #cba135; margin-bottom: 8px;">02</div>
        <span class="card-tag">الهندسة المعاصرة</span>
        <h3 style="font-family: 'Cairo'; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px;">
          الفخامة المعمارية
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          كسر نمطية الخيام التقليدية عبر قاعات زجاجية مكيفة بالكامل بإطارات فولاذية سوداء، ومظلات كانفاس بيضاء تمنح إطلالات بانورامية لا تنقطع.
        </p>
      </div>
      <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
        <div style="font-size: 11px; color: #cba135; font-weight: 700; text-transform: uppercase;">التطبيق الملموس:</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px;">قاعة VIP الزجاجية، البوابة المثلثة A-Frame، إضاءات إديسون الدافئة.</div>
      </div>
    </div>

    <!-- Pillar 3 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 32px; font-weight: 900; color: #cba135; margin-bottom: 8px;">03</div>
        <span class="card-tag">الجاهزية المؤسسية</span>
        <h3 style="font-family: 'Cairo'; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px;">
          المعايير الملكية والشركات
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          بنية تحتية متطورة تلبي متطلبات كبريات الشركات العالمية والجهات الحكومية: تجهيزات صوتية ومرئية فائقة، بوفيهات ملكية، وخصوصية أمنية تامة.
        </p>
      </div>
      <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
        <div style="font-size: 11px; color: #cba135; font-weight: 700; text-transform: uppercase;">التطبيق الملموس:</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px;">حفلات كبار العملاء (أرامكو، الخطوط، STC)، نظام تذاكر الـ VIP المشفر.</div>
      </div>
    </div>

    <!-- Pillar 4 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 32px; font-weight: 900; color: #cba135; margin-bottom: 8px;">04</div>
        <span class="card-tag">الشغف والمغامرة</span>
        <h3 style="font-family: 'Cairo'; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px;">
          الحماس والمغامرة الصحراوية
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          طاقة لا تهدأ تجمع بين هدوء المساء وإثارة التطعيس: قوافل جيوب الرانجلر، دراجات الـ ATV الليلية، ركوب الخيل العربي، وعروض الألعاب النارية.
        </p>
      </div>
      <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
        <div style="font-size: 11px; color: #cba135; font-weight: 700; text-transform: uppercase;">التطبيق الملموس:</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px;">مسارات سفاري بريمان، حلبة الراليات، ومسرح الفعاليات الحية.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 01 • STRATEGY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 04: MASTER LOGO & ANATOMY SYSTEM     -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">02. VISUAL IDENTITY // الشعار الرسمي وبنية الرمز</div>
      <div class="slide-title">
        الشعار الرئيسي وبنية التكوين
        <span class="en">THE MASTER BRANDMARK & ARCHITECTURE</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">04 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: center;">
    <!-- Left: Master Logo Display Showcase -->
    <div class="glass-card-gold" style="padding: 60px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 650px;">
      <span class="card-tag">الشعار المعتمد رسمياً (Official Master Lockup)</span>
      
      <div style="margin: 40px 0; padding: 40px; background: rgba(0,0,0,0.6); border: 1px solid rgba(203, 161, 53, 0.2); width: 100%;">
        <img src="{b64_logo_dark}" alt="Master Logo" style="max-height: 110px; width: auto; object-contain: contain;">
      </div>

      <div style="display: flex; gap: 20px; width: 100%; justify-content: center;">
        <div style="flex: 1; padding: 15px; background: #000; border: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; color: #cba135; font-weight: 700; text-transform: uppercase;">النسخة الذهبية الميتاليك</div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px;">Primary Gold on Obsidian</div>
        </div>
        <div style="flex: 1; padding: 15px; background: #000; border: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; color: #ffffff; font-weight: 700; text-transform: uppercase;">النسخة البيضاء الأحادية</div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px;">Solid White for Media</div>
        </div>
      </div>
    </div>

    <!-- Right: Anatomy Components Breakdown -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase;">عنصر 01: علامة الحماية ™ (The Trademark Mark)</div>
        <h4 style="font-size: 18px; font-weight: 700; margin: 4px 0 8px 0;">علامة الفخامة والملكية الفكرية</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          تتمركز في الزاوية العلوية اليسرى لكلمة "ALGHDEER" كعنصر هوية معماري يعزز هيبة العلامة التجارية وحصريتها المسجلة وفق المعايير العالمية.
        </p>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase;">عنصر 02: اللوجوتايب الممتد (Geometric Wordmark)</div>
        <h4 style="font-size: 18px; font-weight: 700; margin: 4px 0 8px 0;">حروف "ALGHDEER" الهندسية</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          حروف عريضة كابيتال (All-Caps Extended) مستوحاة من فلسفة التصميم المعماري الحديث، تمنح إحساساً بالرسوخ والاستقرار في قلب الصحراء.
        </p>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase;">عنصر 03: واصف الهوية الصغير (The Descriptor)</div>
        <h4 style="font-size: 18px; font-weight: 700; margin: 4px 0 8px 0;">كلمة "camp" بالحروف الصغيرة المنسدلة</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          تستقر على خط الأساس (Baseline) في الجهة اليمنى باللون الأبيض النقي، لتخلق تبايناً بصرياً أنيقاً يوازن ضخامة العنوان الرئيسي.
        </p>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase;">عنصر 04: المعادل العربي المعماري (Arabic Typographic Mark)</div>
        <h4 style="font-size: 18px; font-weight: 700; margin: 4px 0 8px 0;">كلمة "الغدير" بالكشيدة الأفقية الممتدة</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          خط عربي صُمم بنسب هندسية خاصة تتصل فيه قاعدة الحروف بكشيدة ممتدة ترمز لخط الأفق الصحراوي المفتوح في بريمان.
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 02 • VISUAL IDENTITY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 05: LOGO ANATOMY & BLUEPRINT         -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">02. VISUAL IDENTITY // التشريح الهندسي وشبكة البناء</div>
      <div class="slide-title">
        التشريح الهندسي وشبكة نانو بنانا الإنشائية
        <span class="en">LOGO ANATOMY & GEOMETRIC BLUEPRINT</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">05 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 40px; align-items: center;">
    <!-- Left: Generated Blueprint Image -->
    <div style="position: relative; height: 680px; border: 1px solid rgba(203, 161, 53, 0.4); overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.9); background: #060608;">
      <img src="{b64_blueprint}" alt="Logo Anatomy Blueprint" style="width: 100%; height: 100%; object-fit: contain;">
      <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8); border: 1px solid #cba135; padding: 6px 14px; font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.2em; color: #cba135;">
        CAD TECHNICAL DRAFTING // RATIO 1:1.618 Φ
      </div>
    </div>

    <!-- Right: Technical Drafting Specifications -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card-gold">
        <span class="card-tag">المعادلة الهندسية للشعار</span>
        <h3 style="font-family: 'Cairo'; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 12px;">
          النسب القياسية وحدة (X)
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.8);">
          تم بناء الشعار بالكامل على وحدة قياس معيارية <strong>(X)</strong> تُعبر عن سمك ساق الحرف الرأسي (Stem Width)، لضمان تماسك الكتلة وتوازنها عند أي مقاس.
        </p>
      </div>

      <div class="glass-card">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="border-right: 2px solid #cba135; padding-right: 12px;">
            <div style="font-family: 'Montserrat'; font-size: 22px; font-weight: 900; color: #cba135;">4X</div>
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">ارتفاع اللوجوتايب الكامل</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Total Logotype Height</div>
          </div>
          <div style="border-right: 2px solid #cba135; padding-right: 12px;">
            <div style="font-family: 'Montserrat'; font-size: 22px; font-weight: 900; color: #cba135;">45°</div>
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">زاوية الشطف الهندسي</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Beveled Corner Chamfer</div>
          </div>
          <div style="border-right: 2px solid #cba135; padding-right: 12px;">
            <div style="font-family: 'Montserrat'; font-size: 22px; font-weight: 900; color: #cba135;">60°</div>
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">زاوية مثلث الخيمة البوهيمية</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">A-Frame Tent Notch Angle</div>
          </div>
          <div style="border-right: 2px solid #cba135; padding-right: 12px;">
            <div style="font-family: 'Montserrat'; font-size: 22px; font-weight: 900; color: #cba135;">1.618</div>
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">النسبة الذهبية للتباعد</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Golden Ratio Proportion (Φ)</div>
          </div>
        </div>
      </div>

      <div class="glass-card">
        <h4 style="font-size: 15px; font-weight: 700; color: #cba135; margin-bottom: 6px;">ملاحظات التدقيق المعماري:</h4>
        <ul style="font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.7; padding-right: 18px;">
          <li>تتطابق حواف الحروف الخارجية بزاوية 90 درجة مع شطف دقيق مقداره 45 درجة عند الزوايا الداخلية.</li>
          <li>تستقر كلمة "camp" على نفس خط الارتكاز السفلي (Baseline) دون أي انحراف رأسي.</li>
          <li>لا يُسمح بتعديل نصف القطر القوسي لمنحنيات الحروف يدوياً تحت أي ظرف.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 02 • VISUAL IDENTITY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 06: CLEAR SPACE & MINIMUM SIZES      -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">02. VISUAL IDENTITY // المساحة الآمنة والحدود الدنيا</div>
      <div class="slide-title">
        المساحة الآمنة والحد الأدنى للظهور
        <span class="en">CLEAR SPACE & MINIMUM REPRODUCTION SIZES</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">06 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center;">
    <!-- Left: Clear Space Diagram -->
    <div class="glass-card-gold" style="padding: 40px; text-align: center; min-height: 650px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <span class="card-tag">قاعدة منطقة العزل (1.5X Clear Space Rule)</span>
        <h3 style="font-family: 'Cairo'; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px;">
          المساحة المحمية حول الشعار
        </h3>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7);">
          يُحظر وضع أي نص أو عنصر جرافيكي أو حافة قص داخل المنطقة المظللة المحيطة بالشعار.
        </p>
      </div>

      <!-- Visual Clear Space Box -->
      <div style="position: relative; margin: 40px auto; padding: 60px 80px; border: 2px dashed rgba(203, 161, 53, 0.5); background: rgba(0,0,0,0.5); display: inline-block;">
        <!-- Caliper markers -->
        <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); font-family: 'Montserrat'; font-size: 13px; font-weight: 800; color: #cba135;">1.5X</div>
        <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); font-family: 'Montserrat'; font-size: 13px; font-weight: 800; color: #cba135;">1.5X</div>
        <div style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-family: 'Montserrat'; font-size: 13px; font-weight: 800; color: #cba135;">1.5X</div>
        <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-family: 'Montserrat'; font-size: 13px; font-weight: 800; color: #cba135;">1.5X</div>

        <img src="{b64_logo_dark}" alt="" style="max-height: 80px; width: auto; object-contain: contain;">
      </div>

      <div style="font-size: 12px; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); padding: 12px; border: 1px solid rgba(255,255,255,0.1);">
        تُحسب قيمة <strong>(1.5X)</strong> بناءً على 1.5 ضعف سمك ساق حرف "A" الرئيسي في الشعار.
      </div>
    </div>

    <!-- Right: Minimum Sizes for Screen & Print -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Digital Minimum Sizes -->
      <div class="glass-card" style="border-top: 3px solid #cba135;">
        <span class="card-tag">التطبيقات الرقمية (Digital Display)</span>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 12px;">الحد الأدنى لشاشات الويب والتطبيقات</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          <div style="background: rgba(0,0,0,0.6); padding: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">120 PX</div>
            <div style="font-size: 12px; color: #fff; margin-top: 4px;">الشعار الأفقي الكامل</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px;">Min Width (Retina & Web)</div>
          </div>
          <div style="background: rgba(0,0,0,0.6); padding: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">32 PX</div>
            <div style="font-size: 12px; color: #fff; margin-top: 4px;">أيقونة الرمز المونوغرام</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px;">App Favicon / Avatar</div>
          </div>
        </div>
      </div>

      <!-- Print Minimum Sizes -->
      <div class="glass-card" style="border-top: 3px solid #cba135;">
        <span class="card-tag">المطبوعات الفاخرة (Luxury Print)</span>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 12px;">الحد الأدنى لطباعة الأوفست والحفر النحاسي</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          <div style="background: rgba(0,0,0,0.6); padding: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">35 MM</div>
            <div style="font-size: 12px; color: #fff; margin-top: 4px;">الطباعة الورقية المباشرة</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px;">Offset / Silk Screen</div>
          </div>
          <div style="background: rgba(0,0,0,0.6); padding: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">42 MM</div>
            <div style="font-size: 12px; color: #fff; margin-top: 4px;">البصمة الحرارية والنقش البارز</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px;">Foil Stamping & Embossing</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 02 • VISUAL IDENTITY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 07: COLORWAYS & SYSTEM ADAPTATIONS   -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">02. VISUAL IDENTITY // تطبيقات الألوان والخلفيات</div>
      <div class="slide-title">
        نسخ الشعار المعتمدة وتطبيقات الخلفيات
        <span class="en">LOGO COLORWAYS & BACKGROUND ADAPTATIONS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">07 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: stretch;">
    <!-- Quadrant 1: Gold on Obsidian -->
    <div style="background: #0b0c10; border: 1px solid rgba(203, 161, 53, 0.4); padding: 40px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-tag">التطبيق الأساسي (Primary Dark VIP)</span>
        <span style="font-size: 11px; color: #cba135; font-family: 'Montserrat';">BACKGROUND: #0B0C10</span>
      </div>
      <div style="padding: 50px 20px; text-align: center;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 85px; width: auto; object-contain: contain;">
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; font-size: 12px; color: rgba(255,255,255,0.7);">
        النسخة الملكية المعتمدة للواجهات الرقمية، شاشات العرض، وتذاكر كبار الشخصيات.
      </div>
    </div>

    <!-- Quadrant 2: White on Obsidian -->
    <div style="background: #060608; border: 1px solid rgba(255, 255, 255, 0.15); padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-tag" style="background: rgba(255,255,255,0.1); color: #fff; border-color: #fff;">النسخة الأحادية البيضاء (Monochrome White)</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">BACKGROUND: #060608</span>
      </div>
      <div style="padding: 50px 20px; text-align: center;">
        <img src="{b64_logo_white}" alt="" style="max-height: 85px; width: auto; object-contain: contain;">
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; font-size: 12px; color: rgba(255,255,255,0.7);">
        تُستخدم على خلفيات الفيديو الداكنة، الرعايات الإعلامية، والمطبوعات أحادية اللون.
      </div>
    </div>

    <!-- Quadrant 3: Solid Black on White/Sand -->
    <div style="background: #ffffff; color: #000; border: 1px solid #e5e5e5; padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-tag" style="background: rgba(0,0,0,0.08); color: #000; border-color: #000;">النسخة النهارية الرسمية (Daylight / Stationery)</span>
        <span style="font-size: 11px; color: #666; font-family: 'Montserrat';">BACKGROUND: #FFFFFF / SAND</span>
      </div>
      <div style="padding: 50px 20px; text-align: center;">
        <img src="{b64_logo_gold_white}" alt="" style="max-height: 85px; width: auto; object-contain: contain;">
      </div>
      <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 15px; font-size: 12px; color: #444;">
        تُعتمد للفواتير الرسمية، العقود القانونية، أوراق المراسلات الحكومية، والأختام الرسمية.
      </div>
    </div>

    <!-- Quadrant 4: Tone on Tone Blind Deboss / Gold Foil -->
    <div style="background: radial-gradient(circle at center, #1b160c 0%, #0d0b06 100%); border: 1px solid rgba(203, 161, 53, 0.5); padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-tag">التطبيقات الحرفية الفاخرة (Foil & Leather Deboss)</span>
        <span style="font-size: 11px; color: #cba135; font-family: 'Montserrat';">METALLIC FOIL / LEATHER</span>
      </div>
      <div style="padding: 50px 20px; text-align: center;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 85px; width: auto; object-contain: contain; filter: drop-shadow(0 0 15px rgba(203,161,53,0.4));">
      </div>
      <div style="border-top: 1px solid rgba(203,161,53,0.2); padding-top: 15px; font-size: 12px; color: #e6c86e;">
        مخصصة لأغلفة الجلود الطبيعية، أطقم ضيافة كبار الشخصيات، وبطاقات الدخول المعدنية.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 02 • VISUAL IDENTITY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 08: LOGO MISUSE & PROHIBITED DON'TS  -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">02. VISUAL IDENTITY // محظورات استخدام الشعار</div>
      <div class="slide-title">
        محظورات ومخالفات استخدام الشعار
        <span class="en">LOGO MISUSE & PROHIBITED VIOLATIONS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">08 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch;">
    <!-- Misuse 1 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 01</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="background: #000; padding: 30px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 45px; transform: scaleX(1.6); opacity: 0.6;">
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تُمطّط أو تضغط أبعاد الشعار</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يحظر تعديل النسبة التناسبية للشعار رأسياً أو أفقياً تحت أي ظرف؛ يجب تكبيره وتصغيره بنسبة ثابتة 100%.
      </p>
    </div>

    <!-- Misuse 2 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 02</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="background: #000; padding: 30px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 45px; filter: drop-shadow(0 0 10px red) hue-rotate(90deg); opacity: 0.6;">
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تُغيّر ألوان العلامة الرسمية</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يمنع استبدال تدرج الذهب الإمبراطوري بألوان نيون أو تدرجات لونية غير مصرح بها في دليل الهوية.
      </p>
    </div>

    <!-- Misuse 3 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 03</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="background: #000; padding: 30px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 45px; transform: rotate(-12deg); opacity: 0.6;">
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تُدوّر الشعار أو تُميله</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يجب أن يستقر الشعار أفقياً بدرجة صفر مطلقة، ولا يُسمح بعرضه مائلاً بأي زاوية هندسية.
      </p>
    </div>

    <!-- Misuse 4 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 04</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="position: relative; height: 105px; overflow: hidden; margin-bottom: 15px;">
        <img src="{b64_safari}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
          <img src="{b64_logo_dark}" alt="" style="max-height: 38px;">
        </div>
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تضعه فوق خلفية بصرية مشتتة</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يمنع وضع الشعار مباشرة فوق صور غنية بالتفاصيل دون تطبيق طبقة عتامة سوداء (Dark Vignette 60%+).
      </p>
    </div>

    <!-- Misuse 5 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 05</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="background: #000; padding: 30px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">
        <img src="{b64_logo_dark}" alt="" style="max-height: 45px; filter: drop-shadow(5px 5px 0px #fff); opacity: 0.6;">
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تُضف ظلالاً أو مؤثرات رخيصة</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يحظر إضافة حدود خارجية سميكة (Strokes)، أو ظلال حادة (Hard Shadows)، أو إضاءات ثلاثية أبعاد.
      </p>
    </div>

    <!-- Misuse 6 -->
    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 2px;">مخالفة 06</span>
        <span style="color: #ef4444; font-weight: 900; font-size: 18px;">✕</span>
      </div>
      <div style="background: #000; padding: 30px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;">
        <div style="font-family: 'Montserrat'; font-size: 24px; font-weight: 900; color: #cba135; letter-spacing: 0.6em;">ALGHDEER</div>
      </div>
      <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">لا تفصل كلمة "camp" عن الشعار</h4>
      <p style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
        يمنع حذف كلمة "camp" أو كتابتها بخط يدوي أو تغيير موضعها النسبي بالنسبة للكلمة الرئيسية.
      </p>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 02 • VISUAL IDENTITY</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 09: THE OFFICIAL COLOR SYSTEM        -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">03. COLOR SYSTEM // منظومة الألوان الرسمية</div>
      <div class="slide-title">
        لوحة الألوان المعتمدة ومواصفات الطباعة
        <span class="en">THE OFFICIAL COLOR PALETTE & PRINT CODES</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">09 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: flex; flex-direction: column; gap: 30px; justify-content: center;">
    <!-- Color Chips Grid -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 18px; width: 100%;">
      <!-- Color 1: Obsidian Black -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #0b0c10; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #cba135; text-transform: uppercase;">70% Dominance</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">الأسود الأوبسيديان</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">OBSIDIAN NIGHT</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #0B0C10</div>
            <div><strong>RGB:</strong> 11, 12, 16</div>
            <div><strong>CMYK:</strong> 80, 75, 65, 85</div>
            <div><strong>PANTONE:</strong> Black 7 C</div>
          </div>
        </div>
      </div>

      <!-- Color 2: Imperial Gold -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #cba135; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #000; text-transform: uppercase;">15% Primary Accent</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">الذهب الإمبراطوري</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">IMPERIAL GOLD</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #CBA135</div>
            <div><strong>RGB:</strong> 203, 161, 53</div>
            <div><strong>CMYK:</strong> 20, 32, 90, 8</div>
            <div><strong>PANTONE:</strong> 465 C</div>
          </div>
        </div>
      </div>

      <!-- Color 3: Champagne Gold -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #e6c86e; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #000; text-transform: uppercase;">5% Highlight Glow</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">ذهب الشمبانيا الفاتح</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">CHAMPAGNE GOLD</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #E6C86E</div>
            <div><strong>RGB:</strong> 230, 200, 110</div>
            <div><strong>CMYK:</strong> 10, 18, 65, 0</div>
            <div><strong>PANTONE:</strong> 7401 C</div>
          </div>
        </div>
      </div>

      <!-- Color 4: Burnished Bronze -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #9e761b; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #fff; text-transform: uppercase;">5% Deep Shade</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">البرونز المعتق</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">BURNISHED BRONZE</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #9E761B</div>
            <div><strong>RGB:</strong> 158, 118, 27</div>
            <div><strong>CMYK:</strong> 30, 45, 95, 20</div>
            <div><strong>PANTONE:</strong> 126 C</div>
          </div>
        </div>
      </div>

      <!-- Color 5: Pure White -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #000; text-transform: uppercase;">5% Pure Clarity</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">أبيض الكانفاس النقي</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">CANVAS WHITE</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #FFFFFF</div>
            <div><strong>RGB:</strong> 255, 255, 255</div>
            <div><strong>CMYK:</strong> 0, 0, 0, 0</div>
            <div><strong>PANTONE:</strong> Opaque White</div>
          </div>
        </div>
      </div>

      <!-- Color 6: Desert Sand -->
      <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 4px solid #cba135;">
        <div style="height: 160px; background: #f4efea; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: flex-end; padding: 15px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #000; text-transform: uppercase;">Neutral Balance</span>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">رمال بريمان الناعمة</h4>
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Montserrat';">BURAYMAN SAND</div>
          <div class="sadu-accent" style="margin: 10px 0;"></div>
          <div style="font-size: 11px; font-family: 'Montserrat'; line-height: 1.8; color: rgba(255,255,255,0.75);">
            <div><strong>HEX:</strong> #F4EFEA</div>
            <div><strong>RGB:</strong> 244, 239, 234</div>
            <div><strong>CMYK:</strong> 3, 4, 6, 0</div>
            <div><strong>PANTONE:</strong> 7527 C</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Proportional Balance Bar -->
    <div class="glass-card" style="padding: 25px 30px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 13px; font-weight: 700; color: #cba135;">مصفوفة التوزيع النسبي لمنظومة الألوان (60-30-10 Luxury Rule)</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.5);">70% Obsidian • 15% Imperial Gold • 15% Accents</span>
      </div>
      <div style="height: 18px; width: 100%; display: flex; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
        <div style="width: 70%; background: #0b0c10; border-right: 1px solid rgba(203,161,53,0.5);"></div>
        <div style="width: 15%; background: #cba135; border-right: 1px solid #000;"></div>
        <div style="width: 5%; background: #e6c86e; border-right: 1px solid #000;"></div>
        <div style="width: 5%; background: #9e761b; border-right: 1px solid #000;"></div>
        <div style="width: 5%; background: #ffffff;"></div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 03 • COLOR SYSTEM</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 10: TYPOGRAPHY ARCHITECTURE          -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">03. BRAND ASSETS // المنظومة الطباعية والخطوط</div>
      <div class="slide-title">
        منظومة الخطوط والتراتبية البصرية
        <span class="en">TYPOGRAPHY SYSTEM & HIERARCHY</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">10 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: stretch;">
    <!-- Left: Display & Architectural Fonts -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-card-gold">
        <span class="card-tag">خط العناوين العربية الرئيسي (Primary Arabic Display)</span>
        <h3 style="font-family: 'Cairo'; font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 8px;">
          خط الغدير المعماري الممتد
        </h3>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 15px;">
          خط عربي هندسي يتميز بمدات كشيدة معمارية تعكس هيبة المكان وأصالة الخط الكوفي الحديث.
        </p>
        <div style="background: rgba(0,0,0,0.6); padding: 25px; border: 1px solid rgba(203,161,53,0.3); text-align: center;">
          <div style="font-family: 'Cairo'; font-size: 48px; font-weight: 900; color: #cba135; letter-spacing: 0.05em; line-height: 1;">
            الغدير.. فخامة الصحراء
          </div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 10px; font-family: 'Montserrat';">
            ABCDEFGHIJKLMN • ٠١٢٣٤٥٦٧٨٩ • أ ب ت ث ج ح خ
          </div>
        </div>
      </div>

      <div class="glass-card">
        <span class="card-tag">خط العناوين الإنجليزية (Primary Latin Display)</span>
        <h3 style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">
          MONTSERRAT EXTENDED GEOMETRIC
        </h3>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 15px;">
          Clean geometric uppercase sans-serif conveying architectural precision and luxury stature.
        </p>
        <div style="background: rgba(0,0,0,0.6); padding: 25px; border: 1px solid rgba(255,255,255,0.1); text-align: center;" dir="ltr">
          <div style="font-family: 'Montserrat'; font-size: 30px; font-weight: 900; color: #ffffff; letter-spacing: 0.25em;">
            THE LUXURY OASIS
          </div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 10px; font-family: 'Montserrat';">
            ALL-CAPS • WEIGHTS: 700 BOLD / 900 BLACK
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Body Fonts & Visual Hierarchy Table -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <span class="card-tag">خط المتون والواجهات الرقمية (Body & UI Copy)</span>
        <h3 style="font-family: 'Cairo'; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 6px;">
          IBM Plex Sans Arabic & Montserrat
        </h3>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 25px;">
          خطوط عالية الوضوح تدعم شاشات الريتنا وشاشات الهواتف ومطبوعات الكتيبات الفاخرة.
        </p>

        <!-- Hierarchy Table -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <div>
              <div style="font-size: 20px; font-weight: 900; color: #fff;">عنوان الشاشة الرئيسي (H1 Hero)</div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Cairo Black 900 • 64pt / Leading 0.95</div>
            </div>
            <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">64 PX</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <div>
              <div style="font-size: 17px; font-weight: 700; color: #fff;">عنوان السيكشن (H2 Section Title)</div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Cairo Bold 700 • 32pt / Leading 1.2</div>
            </div>
            <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">32 PX</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <div>
              <div style="font-size: 15px; font-weight: 600; color: #cba135;">العناوين الفرعية للبطاقات (H3 Card)</div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Cairo SemiBold 600 • 20pt / Gold Accent</div>
            </div>
            <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">20 PX</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <div>
              <div style="font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.85);">النصوص والفقرات (Body Paragraphs)</div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.5);">IBM Plex Sans Regular 400 • 14pt / Line-height 1.6</div>
            </div>
            <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">14 PX</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 6px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.25em; text-transform: uppercase;">التصنيفات والبيانات الدقيقة (Micro Metadata)</div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.4);">Montserrat Bold 700 • 10pt / All-Caps</div>
            </div>
            <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">10 PX</div>
          </div>
        </div>
      </div>

      <div style="font-size: 11px; color: rgba(255,255,255,0.4); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
        * يُعتمد نظام التباين اللوني WCAG AAA لضمان قراءة فائقة الراحة على الشاشات والمطبوعات.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 03 • BRAND ASSETS</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 11: TONE OF VOICE — THE FEMALE VOICE -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">04. TONE OF VOICE // نبرة صوت البراند</div>
      <div class="slide-title">
        الصوت الأنثوي: الدفء، الشاعرية، والاحتواء
        <span class="en">THE FEMALE VOICE // WARMTH, POETRY & SENSORY HOSPITALITY</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">11 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: stretch;">
    <!-- Left: Persona Definition & Key Attributes -->
    <div class="glass-card-gold" style="display: flex; flex-direction: column; justify-content: space-between; border-right: 4px solid #cba135;">
      <div>
        <span class="card-tag">النمط الشخصي (Brand Archetype)</span>
        <h3 style="font-family: 'Cairo'; font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 8px;">
          المُضيفة الشاعرة وواحة الاحتواء
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); margin-bottom: 20px;">
          صوت ينبض بالحفاوة، يلامس الوجدان، ويخاطب الروح. يستحضر دفء النار ليلاً، ورائحة العود، وسكون الرمال، ورقة الأمسيات التي لا تُنسى.
        </p>

        <!-- 4 Core Pillars of Female Voice -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">دافئة ومُرحبة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تفتح الأبواب بلطف وتشعر الضيف بأنه في بيته</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">حسية وشاعرية</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تصف المشاعر، الروائح، والضوء، ونسمات الليل</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">أصيلة ومُحتوية</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تنبع من كرم الحجاز وبساطة البداوة النقية</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">هادئة وأنيقة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تبتعد عن الصخب والضجيج؛ فخامتها في رقتها</div>
          </div>
        </div>
      </div>

      <!-- Vocabulary Bank -->
      <div style="margin-top: 20px; border-top: 1px solid rgba(203,161,53,0.3); padding-top: 15px;">
        <div style="font-size: 11px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">
          بنك الكلمات المعتمدة (Approved Vocabulary)
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">واحتنا</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">ملاذ السكينة</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">عبق الهيل</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">ضوء القناديل</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">تحت النجوم</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">سحر المساء</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">نلتقي بحب</span>
        </div>
      </div>
    </div>

    <!-- Right: Real Copywriting Samples -->
    <div style="display: flex; flex-direction: column; gap: 18px; justify-content: center;">
      <!-- Sample 1 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 01: منشورات التواصل والإنستغرام (Social Media)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "حين تميل الشمس نحو الغروب في بريمان، وتتعانق نسمات المساء مع خيوط الكانفاس البيضاء.. تبدأ ليلة الغدير. نشعل النار لتلتئم الحكايات، وتفوح قهوتنا ترحيباً بأرواحٍ تبحث عن السكينة والجمال. ننتظرك لتشهد كيف تبتسم الصحراء لضيوفها."
        </p>
        <div style="font-size: 11px; color: #cba135; margin-top: 8px;">#مخيم_الغدير #سحر_الصحراء #ليالي_جدة</div>
      </div>

      <!-- Sample 2 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 02: بطاقة الترحيب بجناح كبار الشخصيات (VIP Welcome Card)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "أهلاً بك في واحتك الخاصة.. صممنا كل تفصيلة الليلة لتليق بحضورك الكريم. استرخِ في سكون الصحراء، ودعنا نعتني بكل لحظة لتكون ذكراك معنا خفيفة ودافئة كضوء النجوم."
        </p>
        <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px;">يُطبع بورق قطني فاخر مع ختم مذهب داخل خيمة الاستقبال.</div>
      </div>

      <!-- Sample 3 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 03: دعوة أمسيات الطرب والعشاء (Gala & Tarab Nights)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "مائدة ملكية وُضعت بعناية، وسماء مفتوحة على الجمال، ورنين عود يُهدي الليل عذوبته.. ندعوك لتشاركنا متعة المساء ومذاق الفخامة الذي يُشبهك."
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 04 • TONE OF VOICE</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 12: TONE OF VOICE — THE MALE VOICE   -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">04. TONE OF VOICE // نبرة صوت البراند</div>
      <div class="slide-title">
        الصوت الذكوري: الهيبة، القيادة، والحسم
        <span class="en">THE MALE VOICE // AUTHORITY, LEADERSHIP & BOLD EXPEDITIONS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">12 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: stretch;">
    <!-- Left: Persona Definition & Key Attributes -->
    <div class="glass-card-gold" style="display: flex; flex-direction: column; justify-content: space-between; border-right: 4px solid #cba135;">
      <div>
        <span class="card-tag">النمط الشخصي (Brand Archetype)</span>
        <h3 style="font-family: 'Cairo'; font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 8px;">
          فارس الصحراء والقائد التنفيذي
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); margin-bottom: 20px;">
          صوت واثق، حاسم، وملحمي. يخاطب صُنّاع القرار ورواد الأعمال وعشاق التحدي. يُعبّر عن هيبة الصحراء المنيعة، وقوة العزيمة، وفخامة الصفقات الكبرى التي تُبنى على رمال الذهب.
        </p>

        <!-- 4 Core Pillars of Male Voice -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">واثقة وحاسمة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">جمل مباشرة وقوية تعكس اليقين والسيطرة التامة</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">ملحمية وجريئة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تُشعل روح التحدي والمغامرة في مسارات السفاري</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">مؤسسية رفيعة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">تخاطب كبار الرؤساء التنفيذيين بلغة الشراكات الكبرى</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 14px; font-weight: 800; color: #cba135;">تليق بالصفوة</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">فخامة بلا مساومة ومعايير جاهزية لا تقبل الخطأ</div>
          </div>
        </div>
      </div>

      <!-- Vocabulary Bank -->
      <div style="margin-top: 20px; border-top: 1px solid rgba(203,161,53,0.3); padding-top: 15px;">
        <div style="font-size: 11px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">
          بنك الكلمات المعتمدة (Approved Vocabulary)
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">الهيبة</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">قمة الإنجاز</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">انطلق</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">سيادة</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">فخامة بلا مساومة</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">صُنّاع القرار</span>
          <span style="font-size: 11px; background: rgba(203,161,53,0.12); color: #fff; padding: 4px 10px; border: 1px solid rgba(203,161,53,0.3);">قوافل العز</span>
        </div>
      </div>
    </div>

    <!-- Right: Real Copywriting Samples -->
    <div style="display: flex; flex-direction: column; gap: 18px; justify-content: center;">
      <!-- Sample 1 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 01: عروض رعاية وشراكات الشركات (Corporate Sponsorships)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "حيث تُصاغ الشراكات الكبرى وتُحتفى الإنجازات الاستثنائية. في 'الغدير'، وضعنا بين أيدي نُخبتكم قاعات زجاجية مكيفة مجهزة بأعلى المعايير العالمية، لتكون منصتكم الحصرية لصناعة القرارات التي ترسم المستقبل."
        </p>
        <div style="font-size: 11px; color: #cba135; margin-top: 8px;">مُخصص لملفات الـ B2B، عروض الاستثمار، وملفات الرعاية.</div>
      </div>

      <!-- Sample 2 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 02: حملة مغامرات السفاري والتطعيس (4x4 Dune Expeditions)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "الصحراء لا تفتح ذراعيها إلا لمن يملك الجرأة. انطلق في قوافل الرانجلر، وتحدَّ كثبان بريمان، واختبر متعة السيطرة الكاملة على مسارات التحدي. قوتك هنا.. ومجدك يُصنع على الرمال."
        </p>
      </div>

      <!-- Sample 3 -->
      <div class="glass-card" style="border-left: 3px solid #cba135;">
        <span class="card-tag">نموذج 03: إعلان التذاكر الحصرية للفعاليات (VIP Executive Access)</span>
        <p style="font-size: 14px; line-height: 1.8; color: #fff; font-weight: 500;">
          "تذكرة واحدة تضعك في قلب الحدث الأرقى في جدة. مقاعد محدودة خُصصت للصفوة. احجز موقعك الليلة واشهد فخامة استثنائية لا تتكرر."
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 04 • TONE OF VOICE</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 13: VOICE HARMONY & DUAL MATRIX      -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">04. TONE OF VOICE // مصفوفة تكامل النبرتين وسياقات الاستخدام</div>
      <div class="slide-title">
        مصفوفة تكامل النبرتين وتوزيع القنوات
        <span class="en">VOICE HARMONY & DUAL PERSONA MATRIX</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">13 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: flex; flex-direction: column; gap: 24px; justify-content: center;">
    <!-- Comparison Matrix Table -->
    <div class="glass-card" style="padding: 0; overflow: hidden; border-top: 3px solid #cba135;">
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 13px;">
        <thead>
          <tr style="background: rgba(203, 161, 53, 0.15); border-bottom: 2px solid rgba(203, 161, 53, 0.3);">
            <th style="padding: 16px 20px; font-weight: 800; color: #cba135; width: 20%;">محور المقارنة</th>
            <th style="padding: 16px 20px; font-weight: 800; color: #fff; width: 40%; border-right: 1px solid rgba(255,255,255,0.1);">
              الصوت الأنثوي (The Female Voice)
            </th>
            <th style="padding: 16px 20px; font-weight: 800; color: #fff; width: 40%; border-right: 1px solid rgba(255,255,255,0.1);">
              الصوت الذكوري (The Male Voice)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3);">
            <td style="padding: 14px 20px; font-weight: 700; color: #cba135;">الجمهور المستهدف</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">العائلات، الأزواج، ضيوف ليالي الطرب، عشاق الفنون والاسترخاء.</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">الرؤساء التنفيذيون، مسؤولو الشركات، مجموعات السفاري والمغامرة.</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 14px 20px; font-weight: 700; color: #cba135;">المرافق المرتبطة</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">المجالس البوهيمية، جلسات النار، مسرح الطرب الحي، البوفيه الملكي.</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">القاعة الزجاجية VIP، حلبة الرالي والتطعيس، قوافل الجيوب 4x4.</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3);">
            <td style="padding: 14px 20px; font-weight: 700; color: #cba135;">الشعور المحوري</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">سكينة هادئة، احتواء حميمي، ودفء استثنائي تحت النجوم.</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">فخر بالسيادة، هيبة الإنجاز، وطاقة الحماس والانتصار.</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 14px 20px; font-weight: 700; color: #cba135;">قنوات النشر الرئيسية</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">إنستغرام، تيك توك، بطاقات الترحيب داخل المخيم، رسائل الواتساب.</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">لينكد إن، كتيبات رعاية المؤتمرات، خطابات التعاقد، إعلانات VIP.</td>
          </tr>
          <tr style="background: rgba(0,0,0,0.3);">
            <td style="padding: 14px 20px; font-weight: 700; color: #cba135;">الإيقاع اللغوي</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">انسيابي، شاعري، يعتمد على الوصف الحسي وتصوير المشهد.</td>
            <td style="padding: 14px 20px; color: rgba(255,255,255,0.85); border-right: 1px solid rgba(255,255,255,0.1);">قصير، حاسم، يعتمد على الجمل الخبرية القاطعة وأفعال الأمر الإيجابية.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- The Harmonized Master Voice Rule -->
    <div class="glass-card-gold" style="border-right: 4px solid #cba135; display: flex; align-items: center; justify-content: space-between; gap: 30px;">
      <div>
        <span class="card-tag">القاعدة الذهبية لتكامل النبرتين (The Golden Balance Rule)</span>
        <h4 style="font-size: 19px; font-weight: 800; color: #fff; margin-bottom: 4px;">
          صوت الغدير الموحد: الفخامة التي تجمع الهيبة بالدفء
        </h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6;">
          لا يتعارض الصوتان بل يتكاملان؛ فالقوة بدون دفء تصبح جافة، والرقة بدون هيبة تفقد مكانتها الفاخرة. يُمثل "الغدير" ذلك التوازن النادر حيث تلتقي هيبة الملوك مع حنان الصحراء الأصيلة.
        </p>
      </div>
      <div style="background: rgba(0,0,0,0.6); padding: 18px 28px; border: 1px solid rgba(203,161,53,0.4); text-align: center; shrink: 0; min-width: 240px;">
        <div style="font-family: 'Montserrat'; font-size: 26px; font-weight: 900; color: #cba135;">100%</div>
        <div style="font-size: 12px; color: #fff; font-weight: 700; margin-top: 4px;">هوية صحراوية متفردة</div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.5);">Unified Brand Soul</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 04 • TONE OF VOICE</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 14: PHOTOGRAPHIC & ART DIRECTION     -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">05. ART DIRECTION // التوجيه الفني للتصوير الصحراوي</div>
      <div class="slide-title">
        الاتجاه الفني للتصوير الفوتوغرافي
        <span class="en">PHOTOGRAPHIC & CINEMATIC ART DIRECTION</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">14 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; align-items: stretch;">
    <!-- Photo 1: Glass Pavilion -->
    <div style="position: relative; height: 680px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
      <img src="{b64_glass_pavilion}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(11,12,16,0.95) 100%);"></div>
      <div style="position: absolute; bottom: 25px; right: 25px; left: 25px;">
        <span class="card-tag">01. العمارة والزجاج</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px;">القاعة الزجاجية VIP</h4>
        <p style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
          زوايا معمارية مستقيمة، إضاءة داخلية دافئة تتوهج وسط ظلام الصحراء، انعكاسات الزجاج الصافية.
        </p>
      </div>
    </div>

    <!-- Photo 2: Campfire Majlis -->
    <div style="position: relative; height: 680px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
      <img src="{b64_campfire}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(11,12,16,0.95) 100%);"></div>
      <div style="position: absolute; bottom: 25px; right: 25px; left: 25px;">
        <span class="card-tag">02. دفء البداوة</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px;">شبة النار ومجلس السدو</h4>
        <p style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
          لقطات حية لشعلات النار ولهب الحطب، تفاصيل أقمشة السدو الفاخرة، وجلسات الرمال المنخفضة.
        </p>
      </div>
    </div>

    <!-- Photo 3: Royal Banquet -->
    <div style="position: relative; height: 680px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
      <img src="{b64_banquet}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(11,12,16,0.95) 100%);"></div>
      <div style="position: absolute; bottom: 25px; right: 25px; left: 25px;">
        <span class="card-tag">03. كرم الضيافة</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px;">المائدة الملكية والقهوة</h4>
        <p style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
          تصوير مقرب للدلال النحاسية، الفناجيل البورسلان، والولائم المفتوحة تحت أضواء الشموع الهادئة.
        </p>
      </div>
    </div>

    <!-- Photo 4: Safari Action -->
    <div style="position: relative; height: 680px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
      <img src="{b64_safari}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(11,12,16,0.95) 100%);"></div>
      <div style="position: absolute; bottom: 25px; right: 25px; left: 25px;">
        <span class="card-tag">04. روح التحدي</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px;">قوافل السفاري والتطعيس</h4>
        <p style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
          لقطات حركية ديناميكية لتطاير رمال الذهب مع انطلاق سيارات الجيب ودبابات الصحراء وقت الغروب.
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 05 • ART DIRECTION</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 15: LUXURY TICKET SYSTEM             -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">06. LUXURY COLLATERAL // نظام التذاكر الفاخرة المطبوعة والرقمية</div>
      <div class="slide-title">
        هندسة تذاكر الغدير الفاخرة
        <span class="en">THE LUXURY TICKET SYSTEM & SMART WALLETS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">15 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
    <!-- Left: Detailed Ticket Component Visual -->
    <div class="glass-card-gold" style="padding: 40px; position: relative;">
      <span class="card-tag">نموذج التذكرة الرسمية (Physical & Digital Ticket Model)</span>
      
      <!-- Actual Recreated Luxury Ticket Mockup -->
      <div style="margin: 30px auto; max-width: 620px; background: #060608; border: 1px solid rgba(203,161,53,0.4); box-shadow: 0 25px 60px rgba(0,0,0,0.9); position: relative; overflow: hidden;" dir="rtl">
        <!-- Top Golden Header Strip -->
        <div style="background: linear-gradient(90deg, #9e761b, #cba135 50%, #f3db8b); height: 4px;"></div>
        
        <div style="padding: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(203,161,53,0.3);">
          <div>
            <div style="font-size: 10px; color: #cba135; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;">تذكرة حصرية لكبار الشخصيات</div>
            <div style="font-family: 'Cairo'; font-size: 24px; font-weight: 900; color: #fff; margin-top: 2px;">أمسية الغدير الملكية • VIP</div>
          </div>
          <img src="{b64_logo_dark}" alt="" style="height: 38px; width: auto;">
        </div>

        <!-- Ticket Body Details -->
        <div style="padding: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">اسم الضيف الكريم</div>
            <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 2px;">سعادة أ. عبد العزيز المنصور</div>
          </div>
          <div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">التاريخ والوقت</div>
            <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 2px;">الخميس، 12 نوفمبر 2026 • 08:00 م</div>
          </div>
          <div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">الجناح المخصص</div>
            <div style="font-size: 15px; font-weight: 700; color: #cba135; margin-top: 2px;">القاعة الزجاجية البانورامية (VIP 01)</div>
          </div>
          <div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">رمز الحجز المشفر</div>
            <div style="font-size: 15px; font-weight: 700; color: #fff; font-family: 'Montserrat'; margin-top: 2px;">ALG-2026-VIP-9942</div>
          </div>
        </div>

        <!-- Perforated Tear-off Strip with Barcode & QR -->
        <div style="background: rgba(18,19,25,0.8); padding: 20px 25px; border-top: 1px dashed rgba(203,161,53,0.3); display: flex; justify-content: space-between; align-items: center;">
          <div style="font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.25em; color: rgba(255,255,255,0.5);">
            SECURE BARCODE VALIDATION // AUTH-TOKEN 0x88F1
          </div>
          <div style="background: #fff; padding: 6px; border-radius: 4px;">
            <div style="width: 48px; height: 48px; background: #000; display: flex; align-items: center; justify-content: center; color: #cba135; font-family: 'Montserrat'; font-weight: 900; font-size: 10px;">QR-VIP</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Architecture & Wallet Integration -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <span class="card-tag">01. الزوايا الهندسية غير الدائرية</span>
        <h4 style="font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 6px;">حواف حادة تحاكي الفخامة العالمية</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          رفض الزوايا الدائرية المستهلكة (No Rounded Corners) واعتماد قصات هندسية مستقيمة (Sharp Geometric Cuts) مع ثقوب فصل التذاكر الجانبية التراثية.
        </p>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <span class="card-tag">02. الربط الذكي بمحافظ الجوال</span>
        <h4 style="font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 6px;">Apple Wallet & Google Wallet</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          إمكانية إضافة تذكرة الفعالية مباشرة بضغطة زر إلى محفظة آبل وجوجل، مع تحديثات تلقائية لوقت الحفل وإشعارات التذكير وتأكيد الحجز عبر واتساب.
        </p>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <span class="card-tag">03. أمان وتشفير التذاكر المطبوعة</span>
        <h4 style="font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 6px;">شريط الهولوجرام الذهبي والـ QR المشفر</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          شريط حراري مذهب مانع للتزوير، مع باركود ورمز استجابة سريع ديناميكي يُفحص عبر بوابات الدخول الإلكترونية للمخيم خلال 0.2 ثانية.
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 06 • LUXURY COLLATERAL</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 16: UI COMPONENTS & LIQUID BUTTONS   -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">06. DIGITAL SYSTEM // مكونات الواجهة التفاعلية والجيوميفيكيشن</div>
      <div class="slide-title">
        نظام مكونات واجهة المستخدم والأزرار السائلة
        <span class="en">UI COMPONENT SYSTEM & LIQUID INTERACTIONS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">16 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: stretch;">
    <!-- Left: Liquid Buttons Showcase -->
    <div class="glass-card-gold" style="padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <span class="card-tag">الأزرار المستوحاة من شكل التذاكر الفاخرة</span>
        <h3 style="font-family: 'Cairo'; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          الزر الذهبي السائل (Liquid Gold Button)
        </h3>
        <p style="font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 25px;">
          أزرار ذات قطع تذكرة هندسي حاد (Sharp Ticket Mask Cutout) خالية تماماً من الحواف الدائرية التقليدية، مع تأثير سائل يتفاعل بنبض ذهبي فاخر عند التمرير.
        </p>
      </div>

      <!-- Live Button Visual Mockups -->
      <div style="background: rgba(0,0,0,0.6); padding: 40px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 20px; align-items: center; justify-content: center;">
        <!-- Primary Liquid Gold Button -->
        <div style="background: linear-gradient(135deg, #A67C1E 0%, #CBA135 50%, #F5DF9A 100%); color: #000; font-family: 'Cairo'; font-size: 16px; font-weight: 900; padding: 16px 42px; position: relative; box-shadow: 0 10px 30px rgba(203,161,53,0.4); text-transform: uppercase; letter-spacing: 0.05em;">
          احصل على تذكرتك • GET TICKET
        </div>

        <!-- Secondary Liquid Glass Button -->
        <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.25); color: #fff; font-family: 'Cairo'; font-size: 15px; font-weight: 700; padding: 15px 38px; text-transform: uppercase;">
          استكشف التجارب • EXPLORE
        </div>
      </div>

      <div style="font-size: 11px; color: rgba(255,255,255,0.5); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
        * تم بناء الأزرار بـ CSS Clip-Path هندسي وتأثيرات Framer Motion لضمان نعومة واستقرار الأداء عبر جميع المتصفحات.
      </div>
    </div>

    <!-- Right: Bento Cards & Kashida Extension -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Bento Cards Grid System -->
      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <span class="card-tag">بطاقات بينتو التفاعلية (Webook Bento Cards)</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px;">
          شبكة البوسترات المدمجة للفعاليات
        </h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 15px;">
          مربعات عرض بنسب 1:1 و 16:9 تستعرض جولات المخيم وقوافل السفاري وليالي الطرب مع أيقونة تشغيل فيديو تفاعلية منبثقة.
        </p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #cba135;">تطعيس وسفاري</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4);">Dune Safari Reel</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #cba135;">واحة الغدير</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4);">Camp Tour Reel</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #cba135;">ليالي الطرب</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.4);">Live Tarab Reel</div>
          </div>
        </div>
      </div>

      <!-- Kashida Extend Line System -->
      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <span class="card-tag">خط الكشيدة المتفاعل (Dynamic Kashida Line)</span>
        <h4 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px;">
          انسيابية التمدد مع التمرير (Scroll Parallax)
        </h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          خط كشيدة ذهبي دقيق يمتد تحت كلمة "الغدير" من 42% إلى 100% من عرض الشاشة تزامناً مع تمرير المستخدم، ليربط الكلمة بأفق الصحراء الشاسع.
        </p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 06 • DIGITAL SYSTEM</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 17: FRAMELESS LAPTOP MOCKUP          -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">07. DIGITAL PRESENCE // الموقع على لابتوب فريم-ليس</div>
      <div class="slide-title">
        حضور العلامة على شاشات اللابتوب الحديثة
        <span class="en">FRAMELESS LAPTOP LANDING PAGE SHOWCASE</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">17 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 40px; align-items: center;">
    <!-- Left: Photorealistic Laptop Mockup -->
    <div style="position: relative; height: 680px; border: 1px solid rgba(203, 161, 53, 0.35); overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95); background: #030305;">
      <img src="{b64_laptop_mockup}" alt="Frameless Laptop Mockup" style="width: 100%; height: 100%; object-fit: contain;">
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.85); border: 1px solid #cba135; padding: 6px 14px; font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.2em; color: #cba135;">
        ULTRA-THIN BEZEL // RETINA 4K LIVE PREVIEW
      </div>
    </div>

    <!-- Right: Architecture Details -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card-gold">
        <span class="card-tag">معايير تجربة سطح المكتب (Desktop UX)</span>
        <h3 style="font-family: 'Cairo'; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 10px;">
          الموقع الإلكتروني الرسمي
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.8);">
          تجربة رقمية سينمائية كاملة تعتمد خلفية فيديو حي مسحوب من إنستغرام بأصوات المخيم الحقيقية، مع نافبار شفاف يعرض شعار الغدير المفرغ.
        </p>
      </div>

      <div class="glass-card">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px;">مواصفات الشاشة والعرض:</div>
        <ul style="font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.8; padding-right: 18px;">
          <li>دقة التصميم الأساسية: 1920 × 1080 بيكسل (16:9).</li>
          <li>تأثير التمرير المتوازي (Parallax Scroll) لتكبير الفيديو وتمدد الكشيدة.</li>
          <li>أزرار حجز فورية تقود إلى استمارة إصدار التذكرة ومزامنة المحفظة.</li>
          <li>دعم اللغتين العربية والإنجليزية بتبديل فوري وسلس دون إعادة تحميل.</li>
        </ul>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">ALGHDEER.COM / OFFICIALLY LIVE</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">Fully Responsive Across All Premium Browsers (Chrome, Safari, Edge)</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 07 • DIGITAL PRESENCE</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 18: FRAMELESS MOBILE MOCKUP          -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-tr"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">07. DIGITAL PRESENCE // الموقع على هاتف فريم-ليس</div>
      <div class="slide-title">
        واجهة الهاتف الذكي المحسّنة (Mobile View)
        <span class="en">FRAMELESS MOBILE VIEWPORT & TOUCH ARCHITECTURE</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">18 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 40px; align-items: center;">
    <!-- Left: Photorealistic Mobile Mockup -->
    <div style="position: relative; height: 680px; border: 1px solid rgba(203, 161, 53, 0.35); overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95); background: #030305;">
      <img src="{b64_mobile_mockup}" alt="Frameless Mobile Mockup" style="width: 100%; height: 100%; object-fit: contain;">
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.85); border: 1px solid #cba135; padding: 6px 14px; font-family: 'Montserrat'; font-size: 11px; letter-spacing: 0.2em; color: #cba135;">
        TITANIUM EDGE-TO-EDGE // 85SVH OPTIMIZED HERO
      </div>
    </div>

    <!-- Right: Architecture Details -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card-gold">
        <span class="card-tag">التحسين الهندسي للموبايل (Mobile UX)</span>
        <h3 style="font-family: 'Cairo'; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 10px;">
          المعالجة الذكية للهواتف
        </h3>
        <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.8);">
          تمت معالجة ارتفاع سيكشن الهيرو بدقة ليصبح <strong>85svh</strong> مع اقتصاص متساوٍ من الأعلى والأسفل دون أي تشويه لأبعاد الفيديو، لمنع تداخل النافبار وإلغاء الفراغ الأسود الزائد.
        </p>
      </div>

      <div class="glass-card">
        <div style="font-size: 12px; font-weight: 800; color: #cba135; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px;">ركائز تجربة الهاتف:</div>
        <ul style="font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.8; padding-right: 18px;">
          <li>تدرج خط العنوان (Clamp Font) من 3.2rem إلى 4.8rem ليتناسب مع شاشات الآيفون.</li>
          <li>أزرار تفاعلية لمسية بحجم مثالي لا يقل عن 48 بيكسل لسهولة الضغط بالإبهام.</li>
          <li>تشغيل مباشر لفيديوهات الفعاليات بالصوت الأصلي عند الضغط.</li>
          <li>إمكانية إضافة تذكرة الحجز إلى Apple Wallet بضغطة زر واحدة قبل تأكيد الواتساب.</li>
        </ul>
      </div>

      <div class="glass-card" style="border-right: 3px solid #cba135;">
        <div style="font-family: 'Montserrat'; font-size: 12px; color: #cba135; font-weight: 700;">TOUCH-OPTIMIZED // ZERO JITTER</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">Tested on iOS Safari, Android Chrome & Samsung Internet</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 07 • DIGITAL PRESENCE</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 19: ENVIRONMENTAL APPLICATIONS       -->
<!-- ========================================== -->
<div class="slide">
  <div class="ambient-glow-bl"></div>
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">08. ENVIRONMENTAL BRANDING // تطبيقات الهوية في موقع المخيم</div>
      <div class="slide-title">
        التطبيقات المكانية وتجهيزات الضيافة
        <span class="en">ENVIRONMENTAL SIGNAGE & LUXURY TOUCHPOINTS</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">19 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; align-items: stretch;">
    <!-- Touchpoint 1 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 28px; font-weight: 900; color: #cba135; margin-bottom: 8px;">01</div>
        <span class="card-tag">المعالم الخارجية</span>
        <h3 style="font-family: 'Cairo'; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          توتم الدخول المعماري A-Frame
        </h3>
        <p style="font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          بوابة دخول بارتفاع 6 أمتار من الفولاذ الأسود المطفي مع إضاءة خلفية دافئة بلون الذهب الإمبراطوري، تستقبل الضيوف وتُرى من مسافات بعيدة على طريق بريمان.
        </p>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-size: 11px; color: #cba135;">
        المواد: Black Steel • Warm LED 2700K
      </div>
    </div>

    <!-- Touchpoint 2 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 28px; font-weight: 900; color: #cba135; margin-bottom: 8px;">02</div>
        <span class="card-tag">الإرشاد المكاني</span>
        <h3 style="font-family: 'Cairo'; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          لوحات النحاس والرخام الأسود
        </h3>
        <p style="font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          قواعد حجرية طبيعية تعلوها ألواح نحاس مطروق ومحفور بتقنية الليزر لتوجيه الضيوف نحو القاعات الزجاجية، مواقف السفاري، والمجالس الملكية.
        </p>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-size: 11px; color: #cba135;">
        المواد: Brushed Brass • Desert Stone
      </div>
    </div>

    <!-- Touchpoint 3 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 28px; font-weight: 900; color: #cba135; margin-bottom: 8px;">03</div>
        <span class="card-tag">الضيافة والولائم</span>
        <h3 style="font-family: 'Cairo'; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          ملفات وقوائم الطعام الجلدية
        </h3>
        <p style="font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          جلود سافيانو سوداء طبيعية مختومة ببصمة الذهب الحرارية، تضم قوائم المأكولات الملكية وجدول الفعاليات الخاصة بكبار الشخصيات.
        </p>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-size: 11px; color: #cba135;">
        المواد: Black Leather • Gold Foil Stamping
      </div>
    </div>

    <!-- Touchpoint 4 -->
    <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #cba135;">
      <div>
        <div style="font-family: 'Montserrat'; font-size: 28px; font-weight: 900; color: #cba135; margin-bottom: 8px;">04</div>
        <span class="card-tag">المظهر المؤسسي</span>
        <h3 style="font-family: 'Cairo'; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          أزياء طاقم الضيافة (Staff Uniform)
        </h3>
        <p style="font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.7);">
          سترات كتان سفاري سوداء فاخرة مطرزة بخيوط الحرير الذهبي برمز الغدير، تعكس الانضباط والاحترافية والكرم السعودي الأصيل.
        </p>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-size: 11px; color: #cba135;">
        المواد: Organic Black Linen • Gold Silk Thread
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 08 • ENVIRONMENTAL BRANDING</div>
  </div>
</div>

<!-- ========================================== -->
<!-- SLIDE 20: BRAND GUARDIANSHIP & CLOSING     -->
<!-- ========================================== -->
<div class="slide" style="justify-content: space-between; background: radial-gradient(circle at center, #13151f 0%, #08090c 75%, #030304 100%);">
  <div class="ambient-glow-tr" style="width: 800px; height: 800px;"></div>
  
  <div class="slide-header">
    <div class="header-titles">
      <div class="slide-eyebrow">09. GOVERNANCE // دستور وحماية العلامة التجارية</div>
      <div class="slide-title">
        دستور العلامة والحماية القانونية
        <span class="en">BRAND GUARDIANSHIP & LEGAL CONSTITUTION</span>
      </div>
    </div>
    <div class="header-meta">
      <img src="{b64_logo_white}" class="header-logo" alt="">
      <div class="slide-num">20 / 20</div>
    </div>
  </div>

  <div class="slide-body" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 50px; align-items: center;">
    <!-- Left: Constitution & Compliance Rules -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-card-gold" style="border-right: 4px solid #cba135;">
        <span class="card-tag">دستور الهوية الملزم (Mandatory Brand Compliance)</span>
        <h3 style="font-family: 'Cairo'; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 10px;">
          حماية أصول الغدير الفكرية
        </h3>
        <p style="font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.85);">
          تُعد علامة <strong>"™ALGHDEER camp"</strong> و <strong>"مخيمات الغدير"</strong> وشعاراتها الهندسية ملكية فكرية حصرية مسجلة. يحظر استخدام أو تعديل أي عنصر من عناصر الهوية دون موافقة خطية مسبقة من إدارة العلامة التجارية.
        </p>
      </div>

      <div class="glass-card">
        <h4 style="font-size: 16px; font-weight: 700; color: #cba135; margin-bottom: 10px;">بروتوكول تدقيق المواد الإعلانية:</h4>
        <ul style="font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.8; padding-right: 20px;">
          <li>تخضع جميع تصاميم الرعايات، الفعاليات، والحملات التسويقية لتدقيق مدير الهوية.</li>
          <li>يجب استخدام ملفات الفيكتور الأصلية (SVG, AI, EPS) عالية الدقة المعتمدة فقط.</li>
          <li>يمنع منعاً باتاً استخراج الشعار من لقطات الشاشة أو ملفات الـ PDF غير المصدرية.</li>
        </ul>
      </div>

      <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
        للاستفسارات وتنزيل الأصول الرقمية: <strong style="color: #cba135;">brand@alghdeer.com • JEDDAH, SAUDI ARABIA</strong>
      </div>
    </div>

    <!-- Right: Certified Golden Seal & Brand Manifesto Quote -->
    <div class="glass-card" style="padding: 50px 40px; text-align: center; border: 1px solid rgba(203,161,53,0.4); box-shadow: 0 25px 60px rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <!-- Metallic Brand Badge -->
      <div style="width: 140px; height: 140px; border-radius: 50%; border: 2px solid #cba135; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(203,161,53,0.15) 0%, rgba(0,0,0,0.8) 100%); margin-bottom: 25px; box-shadow: 0 0 35px rgba(203,161,53,0.3);">
        <img src="{b64_logo_dark}" alt="" style="max-height: 45px; width: auto;">
      </div>

      <div style="font-family: 'Montserrat'; font-size: 13px; font-weight: 800; letter-spacing: 0.35em; color: #cba135; text-transform: uppercase; margin-bottom: 12px;">
        OFFICIAL SEAL OF AUTHENTICITY
      </div>

      <div style="font-family: 'Cairo'; font-size: 30px; font-weight: 900; color: #fff; line-height: 1.4; margin-bottom: 15px;">
        "الغدير.. حيث تصبح الصحراء أسطورة لا تُنسى"
      </div>

      <div style="font-family: 'Montserrat'; font-size: 14px; color: rgba(255,255,255,0.6); letter-spacing: 0.15em; text-transform: uppercase;">
        ALGHDEER CAMP // THE EPITOME OF DESERT LUXURY
      </div>

      <div class="sadu-accent" style="width: 180px; margin: 25px auto;"></div>

      <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; text-transform: uppercase;">
        ISSUED UNDER THE AUTHORITY OF MARS VENTURES PROJECTS • 2026
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>مخيمات الغدير • ALGHDEER CAMP — BURAYMAN, JEDDAH</div>
    <div>CONFIDENTIAL & PROPRIETARY • BRAND IDENTITY GUIDELINES V2.0</div>
    <div class="footer-gold">SECTION 09 • GOVERNANCE & CONCLUSION</div>
  </div>
</div>

</body>
</html>
"""

output_html = Path("D:/alghdeer/scratch/ALGHDEER_Brand_Identity_Guidelines.html")
with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {output_html} ({len(html_content)} bytes).")

output_pdf = Path("D:/alghdeer/public/ALGHDEER_Brand_Identity_Guidelines.pdf")
print(f"Compiling PDF via Headless Chrome to: {output_pdf}...")

cmd = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={output_pdf}",
    f"file:///{output_html.resolve().as_posix()}"
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0 and output_pdf.exists():
    import pypdf
    reader = pypdf.PdfReader(str(output_pdf))
    print(f"SUCCESS: Generated PDF with {len(reader.pages)} slides! File size: {output_pdf.stat().st_size} bytes.")
else:
    print(f"Error generating PDF: returncode={res.returncode}")
    print(res.stderr)
