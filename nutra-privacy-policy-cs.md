# Zásady ochrany osobních údajů (Nutra)

**Účinné od:** DOPLŇTE_DATUM

Tento dokument popisuje, jak aplikace **Nutra** („**Aplikace**“) zpracovává osobní údaje a jaká máte související práva. Aplikace je určena uživatelům v EU/EEA (včetně České republiky).

---

## 1. Správce osobních údajů

**Správce:** DOPLŇTE_NÁZEV_SPOLEČNOSTI / DOPLŇTE_JMÉNO (pokud OSVČ)  
**IČO:** DOPLŇTE_IČO  
**Sídlo:** DOPLŇTE_ADRESU  
**Kontakt pro ochranu soukromí:** DOPLŇTE_EMAIL  

**Pověřenec pro ochranu osobních údajů (DPO):**  
- ☐ Jmenován: DOPLŇTE_KONTAKT  
- ☐ Nejmenovali jsme

---

## 2. Jakou službu poskytujeme

Nutra pomáhá s:
- evidencí jídel a nutričních hodnot,
- personalizací cílů a doporučení (např. kalorie a makra),
- vyhledáváním potravin (např. podle čárových kódů),
- volitelnou AI analýzou jídel (např. z fotografie) pro odhad nutričních hodnot.

---

## 3. Jaké údaje zpracováváme

### 3.1 Údaje o účtu a identifikaci
- e-mail a údaje nutné k přihlášení (autentizaci zajišťuje Supabase Auth; hesla nejsou ukládána v čitelné podobě),
- interní identifikátor uživatele (**user_id**),
- datum registrace, poslední přihlášení, stav účtu.

### 3.2 Profilová a „zdravotní“ data (zvláštní kategorie údajů)
- věk (nebo věkové rozpětí), pohlaví (pokud zadáte), výška, váha, úroveň aktivity, cíl, cílové kalorie / makra a podobné údaje.  
Tyto údaje mohou být považovány za údaje související se zdravím. Zpracováváme je pouze, pokud nám k tomu udělíte **výslovný souhlas**.

### 3.3 Záznamy o stravování
- název jídla, porce, kalorie a makra (bílkoviny, sacharidy, tuky, vláknina, cukry),
- datum, čas, kategorie jídla, poznámky (pokud je zadáte).

### 3.4 Recepty a oblíbené položky
- recepty a oblíbené položky (složení, postup, nutriční hodnoty, tagy, jazyk a metadata), které si uložíte nebo vytvoříte.

### 3.5 Fotografie jídla a obrazová data (volitelně)
- fotografie jídel (kamera/galerie) odeslané na backend pro AI analýzu,
- případné doplňující údaje, které k analýze zadáte (např. název jídla, porce, jazyk).

> Doporučení: Neodesílejte fotografie, které obsahují obličeje, osoby, doklady nebo jiné citlivé informace, pokud to není nutné.

### 3.6 Vyhledávání produktů a čárové kódy
- naskenované čárové kódy a vyhledávací dotazy pro databázi Open Food Facts.

### 3.7 Nastavení a preference
- jazyk aplikace, tmavý režim, stav onboardingu a další preference.  
Některá nastavení mohou být uložena lokálně v zařízení a/nebo v cloudu pro synchronizaci.

### 3.8 Souhlasy a záznamy o nich
- verze souhlasu, text souhlasu, čas udělení/odvolání, locale/jazyk.

### 3.9 Předplatné a platby
- stav předplatného a „entitlementy“ přes RevenueCat a obchody Apple/Google.  
Platební údaje (např. číslo karty) typicky nezpracováváme; zpracovávají je Apple/Google a jejich platební partneři.

### 3.10 Technická a provozní data
- provozní logy (např. IP adresa, čas, technická metadata požadavku) pro zabezpečení, prevenci zneužití a ladění,
- diagnostika chyb (např. chybové hlášky) pro zajištění stability služby.

---

## 4. Účely zpracování a právní základ (GDPR)

| Účel | Kategorie údajů | Právní základ |
|---|---|---|
| Zřízení a správa účtu, poskytování funkcí Aplikace | 3.1, 3.3, 3.4, 3.7 | Plnění smlouvy (čl. 6 odst. 1 písm. b) |
| Synchronizace dat mezi zařízeními | 3.1, 3.3, 3.4, 3.7 | Plnění smlouvy (čl. 6 odst. 1 písm. b) |
| Personalizace cílů a doporučení (práce se „zdravotními“ údaji) | 3.2 | Výslovný souhlas (čl. 9 odst. 2 písm. a) + souhlas (čl. 6 odst. 1 písm. a) |
| AI analýza fotografie jídla (pokud ji použijete) | 3.5 (+ případně 3.2) | Souhlas (čl. 6 odst. 1 písm. a); pokud jde o údaje související se zdravím, pak i výslovný souhlas (čl. 9 odst. 2 písm. a) |
| Evidence předplatného (premium funkce) | 3.9 | Plnění smlouvy (čl. 6 odst. 1 písm. b) |
| Zabezpečení, prevence zneužití, ladění a stabilita | 3.10 | Oprávněný zájem (čl. 6 odst. 1 písm. f) |
| Marketing (pokud jej používáme) | typicky e-mail / push | Souhlas (opt‑in) (čl. 6 odst. 1 písm. a) |

**AI výstupy:** Výsledky AI analýzy jsou orientační a Aplikace může umožnit jejich úpravu uživatelem.

---

## 5. Kdo má k údajům přístup (zpracovatelé a třetí strany)

Využíváme tyto poskytovatele služeb (zpracovatele / příjemce):

1) **Supabase** – autentizace a databáze uživatelských dat.  
2) **Google Cloud** – hosting a provoz backendu. Backend běží v regionu **us-central1 (USA)**.  
3) **OpenAI** – AI analýza (zpracování vstupů odeslaných z backendu k vyhodnocení, např. text a/nebo fotografie jídel dle funkcí Aplikace).  
4) **Open Food Facts** – vyhledávání produktů podle názvu/čárového kódu (dotazy jsou odesílány na jejich API).  
5) **RevenueCat + Apple/Google** – správa předplatného; platby a daňové doklady zajišťují Apple/Google a jejich partneři.

**Další případní poskytovatelé (pokud je nasadíme):** monitoring, crash reporting, analytika, e‑mailové služby. Pokud je začneme používat, aktualizujeme tento dokument.

---

## 6. Předávání dat mimo EU/EEA

Protože backend provozujeme na infrastruktuře **Google Cloud v USA (us-central1)** a pro AI využíváme **OpenAI**, může docházet ke zpracování/předávání osobních údajů mimo EU/EEA (zejména do USA).

Pro takové předávání používáme odpovídající záruky dle GDPR, typicky:
- **standardní smluvní doložky (SCC)**, a/nebo
- další smluvní a technická opatření dle DPA poskytovatelů.

---

## 7. Doba uchovávání (retence)

- **Účet a profil:** po dobu existence účtu; po smazání účtu smažeme nebo anonymizujeme data bez zbytečného odkladu, není-li nutné je uchovat z právních důvodů.  
- **Záznamy o stravování, recepty, oblíbené:** po dobu existence účtu nebo do smazání uživatelem.  
- **Záznamy o souhlasech:** typicky **3 roky** od odvolání souhlasu / ukončení účtu (pro prokázání souladu).  
- **Provozní logy a bezpečnostní záznamy:** typicky **30 dní**; delší uchování pouze při řešení incidentu nebo sporu.  
- **Zálohy:** mazání se může projevit se zpožděním dle rotační politiky záloh (typicky **30–90 dní**).

---

## 8. Vaše práva

Máte právo:
- na přístup k údajům,
- na opravu,
- na výmaz,
- na omezení zpracování,
- na přenositelnost,
- vznést námitku proti zpracování založenému na oprávněném zájmu,
- odvolat souhlas (kdykoli, u zpracování založeného na souhlasu),
- podat stížnost u **Úřadu pro ochranu osobních údajů (ÚOOÚ)**.

Žádosti vyřizujeme bez zbytečného odkladu, nejpozději do 1 měsíce (ve výjimečných případech lze lhůtu prodloužit).

---

## 9. Odvolání souhlasu (zdravotní údaje, AI analýza)

Souhlas můžete odvolat v Nastavení Aplikace nebo nás kontaktovat.  
Odvolání souhlasu může omezit funkce personalizace a AI analýzy, ale nemá vliv na zákonnost zpracování před odvoláním.

---

## 10. Zabezpečení

Používáme technická a organizační opatření odpovídající rizikům, zejména:
- šifrovaný přenos (HTTPS/TLS),
- řízení přístupů (princip nejmenších oprávnění),
- oddělení prostředí a správa tajných klíčů,
- monitorování a logování pro bezpečnostní účely.

---

## 11. Děti

Aplikace je službou informační společnosti. V České republice je věková hranice pro udělení souhlasu dítěte v této souvislosti zpravidla **15 let**. Pokud je uživateli méně než 15 let, Aplikaci nemá používat bez souhlasu zákonného zástupce.

---

## 12. Kontakt

Pro dotazy nebo uplatnění práv kontaktujte: **DOPLŇTE_EMAIL**

---

## 13. Změny dokumentu

Zásady můžeme aktualizovat. Novou verzi zveřejníme v Aplikaci a uvedeme datum účinnosti.

---

## Doporučené texty souhlasu do Aplikace (volitelné)

**Souhlas – zdravotní/profilová data a personalizace**  
„Souhlasím se zpracováním údajů o mé výšce, váze, cílech a souvisejících údajů za účelem personalizace doporučení v aplikaci Nutra. Souhlas mohu kdykoli odvolat v Nastavení.“

**Souhlas – AI analýza fotografie jídla**  
„Souhlasím s odesláním fotografie jídla na server a jejím automatizovaným vyhodnocením za účelem odhadu nutričních hodnot. Výsledek je orientační a mohu jej upravit. Souhlas mohu kdykoli odvolat v Nastavení.“
