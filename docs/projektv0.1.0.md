# Asystent IO — Specyfikacja funkcjonalna (v2.0)

## Co robi aplikacja?

**Asystent IO** analizuje wartości odżywcze produktów spożywczych dla osób z insulinoopornością i cukrzycą typu 2.

**Główne funkcje:**
1. **Skanowanie kodów kreskowych** → pobieranie danych z OpenFoodFacts → scoring
2. **OCR etykiet** (gdy brak kodu/danych) → rozpoznawanie tabeli wartości → scoring
3. **Scoring 0-100** (deterministyczny algorytm, IO-aware) + **Glycemic Load (ŁG)**
4. **Parser składników** → wykrywanie składników wysokoGI (syropy, maltodekstryna)
5. **Historia skanów** (filtrowanie, wyszukiwanie, ulubione)
6. **Offline-first** (lokalna baza SQLite + cache)
7. **Shopping Hints (Hinty zakupowe)** → 8 kategorii heurystycznych z alternatywami
8. **Grywalizacja** → Daily Streak + Quiz Wiedzy IO (400+ pytań w PL i EN)
9. **Analytics & Telemetry** → Offline-first data sink (privacy-compliant)
10. **Firebase Analytics** → GA4 business events (opt-in)
11. **Privacy-first** → Szczegółowe informacje o danych w ustawieniach

---

## Stack technologiczny

| Technologia | Rola | Kod |
|-------------|------|-----|
| **Flutter/Dart** | Framework aplikacji | `lib/main.dart` |
| **Riverpod** | State management | `lib/features/scan/scan_controller.dart` |
| **Drift (SQLite)** | Baza danych | `lib/data/database/app_database.dart` |
| **Google ML Kit** | OCR + Barcode | `lib/domain/ocr/ml_kit_ocr_service.dart` |
| **GoRouter** | Nawigacja | `lib/core/router/app_router.dart` |
| **http** | OpenFoodFacts API | `lib/data/datasources/off_datasource.dart` |
| **SharedPreferences** | Grywalizacja (streak/quiz state) | `lib/domain/gamification/` |
| **Firebase Analytics** | GA4 events (opt-in) | `lib/core/analytics/firebase_analytics_service.dart` |

---

## Architektura (4 warstwy)

```
lib/
├── features/       # UI (ekrany, widgety, kontrolery)
├── domain/         # Logika biznesowa (scoring, parsowanie)
├── data/           # Repozytoria, baza danych, API
└── core/           # Routing, motywy, stałe, providery
```

**Zasada:** Domain nie zna niczego o Flutter, UI, API ani bazie danych.

---

## Funkcjonalności (szczegóły)

### 1. Skanowanie kodów kreskowych
**Flow:**
```
Kamera → Zrób zdjęcie → ML Kit wykrywa kod → Sprawdź cache → 
Fetch z OpenFoodFacts → ReviewScreen z danymi
```

**Kod:**
- `lib/features/scan/camera_screen.dart` → `_handleBarcodeCaptureAndLookup()`
- `lib/data/database/tables.dart` → tabela `BarcodeCache` (TTL 7 dni)

**Edge-cases:**
- Brak kodu → przełącz na tryb OCR
- Produkt nie znaleziony w OFF → fallback do OCR
- Cache hit → natychmiastowe wyświetlenie danych

---

### 2. OCR etykiet
**Flow:**
```
Kamera → Zrób zdjęcie → Crop (zaznacz tabelę) → 
ML Kit OCR → Parser wyciąga wartości → ReviewScreen
```

**Kod:**
- `lib/domain/ocr/ml_kit_ocr_service.dart` → `recognizeTextSpatial()`
- `lib/domain/parsing/nutrition_parser.dart` → wyciąga energię, węglowodany, cukry, błonnik
- `lib/features/scan/crop_screen.dart` → interaktywne kadrowanie

**Edge-cases:**
- Brak tekstu → komunikat o błędzie
- Parser nie znalazł węglowodanów → ReviewScreen pozwala na ręczne uzupełnienie

---

### 3. Weryfikacja i scoring
**ReviewScreen** → użytkownik weryfikuje/poprawia dane → `ScoringEngine.calculate()` → **ResultScreen**

**Scoring (0-100):**
```dart
// lib/domain/scoring/scoring_engine.dart

// KARY ZA CUKRY:
- >30g: -50pkt (cap 60)
- >20g: -42pkt (cap 70)
- >10g: -30pkt (cap 75)
- >5g:  -18pkt (cap 90)
- >2g:  -8pkt

// KARY ZA WĘGLOWODANY NETTO (carbs - fiber):
- >55g: -40pkt (cap 55)
- >40g: -28pkt (cap 70)
- >25g: -18pkt (cap 85)
- >15g: -10pkt

// KARY ZA SKŁADNIKI:
- Syrop glukozowo-fruktozowy / maltodekstryna: -12 do -22pkt (progresywnie)
- Miód: -8pkt
- Słodziki (aspartam, sukraloza, stewia): -8pkt (info o niejasnym wpływie na IO)

// BONUSY:
- Błonnik ≥6g (tylko jeśli netCarbs <20): +3pkt
- Białko ≥20g: +3pkt
- Węglowodany <10g: +3pkt

// BUCKETY:
- Zielony (OK): 80-100
- Żółty (Neutral): 40-79
- Czerwony (Risk): <40
```

**Kod:**
- `lib/features/scan/review_screen.dart` → walidacja (sugars > carbs → blokada)
- `lib/domain/scoring/scoring_engine.dart` → algorytm scoringu
- `lib/domain/nutrition/glycemic_load.dart` → `GlycemicLoadCalculator` (estymacja IG i ŁG)
- `lib/features/scan/result_screen.dart` → wynik + wskazówki + karta ŁG

---

### 4. Historia skanów
**Flow:**
```
ResultScreen → Zapisz do bazy → HistoryScreen (lista) → 
HistoryDetailScreen (szczegóły)
```

**Funkcje:**
- Wyszukiwanie po nazwie produktu
- Filtrowanie: Wszystkie / OK / Neutral / Ryzyko / Ulubione
- Szczegóły: pełen wynik, edycja (stub), usuwanie, ulubione
- **Shopping hints** w szczegółach (jeśli score < 65 lub Risk)

**Kod:**
- `lib/data/database/tables.dart` → tabela `ScanHistory`
- `lib/features/history/history_screen.dart` → lista + filtry
- `lib/features/history/history_detail_screen.dart` → szczegóły + hinty

---

## Baza danych (SQLite/Drift)

### Tabele:

**1. ScanHistory** (historia skanów)
```dart
- id (PK)
- scanDate
- productName
- imagePath
- rawOcrText
- nutritionJson (NutritionFacts jako JSON)
- ingredientsText
- score (0-100)
- bucketIndex (0=OK, 1=Neutral, 2=Risk)
- verdict, reasonsJson, tipsJson
- isFavorite
- glClass (low | medium | high)
```

**2. BarcodeCache** (cache produktów z OFF)
```dart
- barcode (PK)
- nutritionJson
- ingredientsText
- productName
- imageUrl
- fetchedAt (TTL 7 dni)
```

**3. AnalyticsEventQueue** (offline-first analytics sink)
```dart
- id (PK, auto-increment)
- createdAtUtc
- eventName (scan_completed | scan_saved | ocr_correction)
- schemaVersion (default: 1)
- payloadJson (privacy-compliant)
- status (pending | exported)
```

**4. ProductTelemetry** (product identification, NO user identifiers)
```dart
- id (PK, auto-increment)
- createdAtUtc
- barcode (nullable)
- productName (nullable)
- source (off | ocr | manual)
- scoreBucket (OK | Neutral | Risk)
- glClass (low | medium | high)
- hasIngredients (boolean)
```

**Kod:** `lib/data/database/app_database.dart`, `lib/data/database/tables.dart`

---

## Modele kluczowe

| Model | Gdzie | Rola |
|-------|-------|------|
| `NutritionFacts` | `lib/domain/nutrition/nutrition_facts.dart` | Wartości odżywcze (energyKcal, carbs, sugars, fiber, protein, fat) |
| `ProductLabel` | `lib/data/models/product_label.dart` | Agregat: NutritionFacts + składniki + metadata |
| `ScoreResult` | `lib/domain/scoring/score_result.dart` | Wynik scoringu (score, reasons, tips, bucket) |
| `IngredientsAnalysis` | `lib/domain/ingredients/ingredients_analysis.dart` | Flagi składników (hasSyrups, hasMaltodextrin, etc.) |
| `GlycemicLoadResult` | `lib/domain/nutrition/glycemic_load.dart` | Wynik estymacji IG i ŁG (ig, gl, class, assumptions) |
| `HeuristicCategory` | `lib/domain/shopping/heuristic_category.dart` | Enum z 8 kategoriami produktowymi dla hintów |
| `ShoppingHint` | `lib/domain/shopping/shopping_hint.dart` | Model hintu (problemStatement, alternatives, caution) |
| `GamificationState` | `lib/domain/gamification/gamification_state.dart` | Stan grywalizacji (streak, bestStreak, quizBestRun) |
| `QuizQuestion` | `lib/domain/gamification/quiz_question.dart` | Model pytania quizu (question, answers, correctIndex) |
| `AnalyticsEvent` | `lib/domain/analytics/analytics_event.dart` | Zdarzenie analityczne (name, params, createdAt) + walidacja privacy |
| `ProductTelemetryRecord` | `lib/domain/analytics/product_telemetry_record.dart` | Rekord telemetrii produktu (NO user identifiers) |

---

## Routing (GoRouter)

**Główne trasy:**
```
/splash → /onboarding → /home
/scan/camera → /scan/crop → /scan/review → /scan/result
/history → /history/detail
/quiz → QuizScreen (grywalizacja)
/settings
```

**Kod:** `lib/core/router/app_router.dart`

---

## Testy

**Uruchomienie:** `flutter test`

**Pokrycie:**
- `test/domain/scoring/scoring_engine_test.dart` → testy scoringu
- `test/domain/parsing/nutrition_parser_test.dart` → parser OCR
- `test/data/database/app_database_test.dart` → baza danych
- `test/domain/shopping/heuristic_category_classifier_test.dart` → klasyfikator hintów
- `test/domain/gamification/streak_service_test.dart` → logika streak
- `test/domain/gamification/quiz_service_test.dart` → logika quizu

---

## Co NIE jest w kodzie (mimo że mogło być planowane)

❌ Eksport kolejki analytics/telemetry (sink jest, ale brak mechanizmu eksportu)  
❌ Synchronizacja między urządzeniami  
❌ Konta użytkownika / logowanie  
❌ Jawny TTL check w kodzie cache (tylko komentarz o 7 dniach)  
❌ iOS-specific kod (tylko Android aktywnie testowany)  
❌ Odznaki/Achievementy w grywalizacji (świadomie odrzucone z MVP)  
❌ OFF categories integration dla hintów (własne reguły liczbowe)  
❌ Personalizacja hintów (backlog)  
❌ A/B testing (pre-mature optimization)  
❌ Multi-language dla hintów (tylko PL w MVP)

---

## Dodatkowe funkcjonalności

### Glycemic Load (Ładunek Glikemiczny)

Aplikacja estymuje **Glycemic Index (IG)** i **Glycemic Load (ŁG)** na podstawie:
- Makroskładników (węglowodany netto, cukry, białko, tłuszcz)
- Wykrytych triggerów wysokoGI (syropy, maltodekstryna, biała mąka)

**Klasyfikacja ŁG:**
- Niski: <10 (minimalny wpływ)
- Średni: 10-20 (umiarkowany wpływ)
- Wysoki: ≥20 (znaczący wpływ)

**Kod:** `lib/domain/nutrition/glycemic_load.dart` → `GlycemicLoadCalculator.calculate()`

**UI:** Karta ŁG na ResultScreen z kolorowym wskaźnikiem + assumptions (przejrzystość obliczeń)

---

### 5. Shopping Hints (Hinty zakupowe)

**MVP:** Heurystyczne hinty zakupowe z 8 kategoriami produktowymi, działające offline, bez zapisu do bazy.

**Flow:**
```
ResultScreen / HistoryDetailScreen → Compute kategoria on-the-fly → 
Jeśli score < 65 LUB bucket == Risk → Pokaż ShoppingHintCard
```

**8 kategorii heurystycznych:**
1. `sweetened_beverage` — Słodzone napoje
2. `high_sugar_snack` — Słodkie przekąski
3. `sweetened_dairy` — Słodzony nabiał
4. `refined_bread` — Pieczywo rafinowane
5. `sweet_sauce` — Słodkie sosy
6. `instant_meal` — Dania instant
7. `dessert` — Desery
8. `alcohol_beverage` — Napoje alkoholowe

**Klasyfikacja:** Na podstawie progów liczbowych (cukry, węglowodany, błonnik) + flag składnikowych.

**Kod:**
- `lib/domain/shopping/heuristic_category.dart` → Enum z 8 kategoriami
- `lib/domain/shopping/heuristic_category_classifier.dart` → Logika klasyfikacji
- `lib/domain/shopping/shopping_hint.dart` → Model hintu
- `lib/domain/shopping/shopping_hints_generator.dart` → Generator treści (PL)
- `lib/features/scan/widgets/shopping_hint_card.dart` → Widget UI

**Zasady:**
- Kategoria liczona on-the-fly (brak zapisu do DB)
- Progi liczbowe > keyword matching (minimalizacja false-positive)
- Reguła złota: lepiej `null` niż zła kategoria
- Wyświetlanie: TYLKO gdy score < 65 LUB bucket == Risk
- Max 1 hint per screen

**Testy:** `test/domain/shopping/heuristic_category_classifier_test.dart`

---

### 6. Grywalizacja

**Zakres:** Daily Streak + Quiz Wiedzy IO (bez odznak/achievementów)

#### 6.1 Daily Streak (Seria dni)

**Flow:**
```
App start → HomeScreen init → StreakService.checkAndUpdateStreak() → 
Aktualizacja stanu → Wyświetlenie StreakWidget
```

**Logika:**
- `lastOpenDate == today` → brak zmian
- `lastOpenDate == yesterday` → streak++
- `lastOpenDate < yesterday OR null` → streak = 1 (reset/start)
- Zapis do SharedPreferences (klucze: `gamification_current_streak`, `gamification_best_streak`, `gamification_last_open_date`)

**Kod:**
- `lib/domain/gamification/streak_service.dart` → Logika streak
- `lib/features/gamification/widgets/streak_widget.dart` → Kompaktowy widget na HomeScreen
- `lib/domain/gamification/gamification_state.dart` → Wspólny model stanu

**UI:** Widget na HomeScreen pokazujący "Seria: X dni" + "Rekord: Y"

**Testy:** `test/domain/gamification/streak_service_test.dart`

#### 6.2 Quiz Wiedzy IO

**Flow:**
```
HomeScreen/Menu → /quiz → QuizScreen → Odpowiadanie na pytania → 
Błędna odpowiedź → Game Over + zapisz bestRun → Możliwość powtórki
```

**Mechanika:**
- Losowanie pytań bez powtórzeń w serii
- Poprawna odpowiedź → currentRun++, następne pytanie
- Błędna odpowiedź → koniec gry, zapis bestRun
- Tytuły gracza na podstawie bestRun:
  - 0–4: Początkujący
  - 5–9: Uczeń IO
  - 10–14: Znawca IO
  - 15–19: Mistrz IO
  - 20–24: Guru IO
  - 25+: Legenda IO

**Baza pytań:** 400+ pytań w 5 kategoriach:
- `basics` — Definicje IO, IG, ŁG
- `diet` — Zasady żywienia przy IO
- `products` — IG konkretnych produktów
- `myths` — Obalanie mitów
- `science` — Mechanizmy, badania

**Języki:** PL (411 pytań) + EN (wersja angielska w `quiz_questions_data_en.dart`)

**Kod:**
- `lib/domain/gamification/quiz_question.dart` → Model pytania
- `lib/domain/gamification/quiz_category.dart` → Enum kategorii
- `lib/domain/gamification/quiz_questions_data.dart` → Baza pytań PL (411 pytań)
- `lib/domain/gamification/quiz_questions_data_en.dart` → Baza pytań EN
- `lib/domain/gamification/quiz_service.dart` → Logika quizu
- `lib/features/gamification/quiz/quiz_controller.dart` → Kontroler Riverpod
- `lib/features/gamification/quiz/quiz_screen.dart` → UI quizu
- `lib/features/gamification/gamification_controller.dart` → Wspólny kontroler dla streak i quiz

**Zapis stanu:** SharedPreferences (klucze: `gamification_quiz_best_run`, `gamification_quiz_total_played`)

**Routing:** `/quiz` w `lib/core/router/app_router.dart`

**Testy:** `test/domain/gamification/quiz_service_test.dart`

---

### 7. Analytics & Telemetry (Privacy-compliant)

**Cel:** Zbieranie anonimowych danych do poprawy jakości OCR i UX, bez naruszania prywatności.

**Architektura:** Offline-first data sink → kolejka w SQLite → eksport (nie zaimplementowany w MVP)

#### 7.1 Analytics Events (Fire-and-forget)

**3 typy zdarzeń:**
1. `scan_completed` — Params: scan_mode, data_source, score_bucket, gl_class, has_ingredients
2. `scan_saved` — Params: score_bucket
3. `ocr_correction` — Params: fields_edited (które pola użytkownik poprawił)

**Privacy contract (HARD RULE):**
- ❌ NIE zawiera: barcode, productName, exactScore, nutritionValues, ocrRaw, userId, deviceId
- ✅ Tylko: buckety (OK/Neutral/Risk), typy akcji, flagi binarne

**Kod:**
- `lib/domain/analytics/analytics_event.dart` — Model zdarzenia + walidacja privacy
- `lib/domain/analytics/analytics_sink.dart` — Interface (fire-and-forget)
- `lib/data/sinks/drift_analytics_sink.dart` — Implementacja (SQLite queue)
- `lib/data/database/tables.dart` → tabela `AnalyticsEventQueue`
- `lib/data/database/daos/analytics_event_queue_dao.dart` — DAO
- `lib/core/providers/analytics_provider.dart` — Providery Riverpod

**Użycie:**
- `lib/features/scan/review_screen.dart` → enqueue scan_completed, ocr_correction
- `lib/features/scan/result_screen.dart` → enqueue scan_saved

**Tabela:** `AnalyticsEventQueue` (status: pending/exported, payload JSON)

#### 7.2 Product Telemetry (NO user identifiers)

**Cel:** Identyfikacja produktów problematycznych (np. błędy OCR), bez danych użytkownika.

**Hard rule:**
- ❌ NIE zawiera: userId, appInstanceId, deviceId, sessionId, exactScore
- ✅ Tylko: barcode (nullable), productName (nullable), source, scoreBucket, glClass, hasIngredients

**Kod:**
- `lib/domain/analytics/product_telemetry_record.dart` — Model telemetrii produktu
- `lib/domain/analytics/product_telemetry_sink.dart` — Interface
- `lib/data/sinks/drift_product_telemetry_sink.dart` — Implementacja
- `lib/data/database/tables.dart` → tabela `ProductTelemetry`
- `lib/data/database/daos/product_telemetry_dao.dart` — DAO

**Użycie:**
- `lib/features/scan/result_screen.dart` → enqueue przy zapisie skanu

**Tabela:** `ProductTelemetry` (barcode nullable, source, scoreBucket, glClass, hasIngredients)

#### 7.3 Firebase Analytics (GA4)

**Opt-in:** Użytkownik może wyłączyć w ustawieniach.

**Zdarzenia GA4:**
- `onboarding_completed`
- `scan_started` — Params: scan_mode
- `scan_completed` — Params: score_bucket, scan_mode, data_source, gl_class, has_ingredients
- `scan_saved` — Params: score_bucket

**Normalizacja:** `score_bucket` zawsze lowercase (ok | neutral | risk)

**Kod:**
- `lib/core/analytics/firebase_analytics_service.dart` — Wrapper Firebase Analytics
- `lib/core/providers/analytics_provider.dart` → `firebaseAnalyticsServiceProvider`

**Fire-and-forget:** Wszystkie metody z wewnętrznym try/catch — błędy nigdy nie propagują.

**UI:** Switch w ustawieniach: "Wysyłaj anonimowe statystyki błędów"

---

### 8. Privacy & Settings

**Sekcja Privacy w Settings:**

1. **Informacje o prywatności** (dialog):
   - Jakie dane zbieramy
   - Co NIE zbieramy (bez identyfikatorów, bez dokładnych wyników)
   - Cel: poprawa jakości OCR

2. **Polityka prywatności** (link zewnętrzny)

3. **Opt-in dla Firebase Crashlytics** (switch):
   - Domyślnie: włączone
   - Tekst: "Pomaga poprawiać jakość OCR. Bez danych wrażliwych i bez identyfikatorów."

**Kod:**
- `lib/features/settings/settings_screen.dart` → sekcja "Prywatność"
- `lib/features/settings/settings_controller.dart` → `toggleCrashlyticsOptIn()`

**Dialog "Jak liczymy wynik?":**
- Rozwinięta informacja o scoringu
- Interpretacja bucketów (Zielony/Żółty/Czerwony)
- Disclaimer: "charakter edukacyjny i informacyjny — nie stanowi porady medycznej"

**Dialog "Informacje medyczne":**
- Disclaimer o charakterze edukacyjnym
- "Nie zastępuje konsultacji ze specjalistą"
- Możliwość błędów (OCR)

---

## Dla nowego developera — gdzie zacząć?

**Chcę zmienić scoring:**
→ `lib/domain/scoring/scoring_engine.dart`

**Chcę zmienić progi/logikę Glycemic Load:**
→ `lib/domain/nutrition/glycemic_load.dart`

**Chcę poprawić OCR:**
→ `lib/domain/ocr/ml_kit_ocr_service.dart` + `lib/domain/parsing/nutrition_parser.dart`

**Chcę zmienić UI skanowania:**
→ `lib/features/scan/camera_screen.dart`

**Chcę dodać nową tabelę do bazy:**
→ `lib/data/database/tables.dart` + migracja w `app_database.dart`

**Chcę zobaczyć flow:**
→ `lib/core/router/app_router.dart` (wszystkie ekrany i parametry)

**Chcę zmienić reguły klasyfikacji hintów:**
→ `lib/domain/shopping/heuristic_category_classifier.dart`

**Chcę zmienić treści hintów:**
→ `lib/domain/shopping/shopping_hints_generator.dart`

**Chcę dodać pytania do quizu:**
→ `lib/domain/gamification/quiz_questions_data.dart` (PL) lub `quiz_questions_data_en.dart` (EN)

**Chcę zmienić progi tytułów w quizie:**
→ `lib/domain/gamification/gamification_state.dart` (metoda `getTitleForScore`)

**Chcę zmienić logikę streak:**
→ `lib/domain/gamification/streak_service.dart`

**Chcę dodać nowe zdarzenie analytics:**
→ `lib/domain/analytics/analytics_event.dart` + factory method + validation

**Chcę zmienić privacy contract dla analytics:**
→ `lib/domain/analytics/analytics_event.dart` (metoda `isPrivacyCompliant`)

**Chcę dodać nowe zdarzenie do Firebase Analytics:**
→ `lib/core/analytics/firebase_analytics_service.dart` (metoda fire-and-forget)

**Chcę zobaczyć co jest w kolejce analytics:**
→ `lib/data/database/daos/analytics_event_queue_dao.dart`

---

**Ostatnia aktualizacja:** Styczeń 2026  
**Wersja kodu:** 2.0 (v0.1.0+3)
