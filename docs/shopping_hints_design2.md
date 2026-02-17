# Analiza i Projekt: Heurystyczne Hinty Zakupowe (MVP)

**Wersja:** 2.0 (MVP-safe)
**Data:** 2026-01-19
**Status:** Ready for Implementation

---

## Spis treści

- [MVP: Podsumowanie](#mvp-podsumowanie)
- [Zakres MVP](#zakres-mvp)
- [Taksonomia 8 kategorii](#taksonomia-8-kategorii)
- [Reguły klasyfikacji](#reguły-klasyfikacji)
- [Treści hintów](#treści-hintów)
- [Architektura MVP](#architektura-mvp-as-is--to-be)
- [Czego NIE robimy w MVP](#czego-nie-robimy-w-mvp)
- [Backlog](#backlog)
- [Prompty implementacyjne](#prompty-implementacyjne)

---

## MVP: Podsumowanie

Heurystyczne hinty zakupowe działające offline, bez zapisu do bazy, z 8 kategoriami produktowymi. Kategoria liczona on-the-fly w `ResultScreen` i `HistoryDetailScreen`. Hint wyświetlany TYLKO przy score < 65 lub bucket == Risk. Priorytet: minimalizm, zero false-positive, implementacja 1-2 dni. Brak zmian w scoringu, brak migracji DB, brak nowych zależności.

---

## Kontekst projektu

**Aplikacja:** Asystent IO
**Stack:** Flutter, Android-first, Offline-first, Drift (SQLite), ML Kit OCR, OpenFoodFacts
**Scoring:** Deterministyczny, IO-aware (0-100), Bucket: OK / Neutral / Risk
**ProductType:** solid | beverage

**Problem:** Aplikacja ocenia produkt i informuje że jest "zły", ale nie podpowiada co wybrać zamiast.

**Rozwiązanie MVP:** 8 kategorii heurystycznych z konkretnymi alternatywami, liczone on-the-fly, wyświetlane w `ResultScreen` i `HistoryDetailScreen`.

---

## Zakres MVP


## Zakres MVP

### 8 kategorii (zamiast 12)

MVP zawiera TYLKO te kategorie:

1. `sweetened_beverage` — Słodzone napoje
2. `high_sugar_snack` — Słodkie przekąski
3. `sweetened_dairy` — Słodzony nabiał (jogurty, serki, napoje mleczne)
4. `refined_bread` — Pieczywo rafinowane
5. `sweet_sauce` — Słodkie sosy
6. `instant_meal` — Dania instant
7. `dessert` — Desery
8. `alcohol_beverage` — Napoje alkoholowe

### Zasady MVP

- **Kategoria liczona on-the-fly** — brak zapisu do DB
- **Progi liczbowe > keyword matching** — minimalizacja false-positive
- **Reguła złota:** lepiej `null` niż zła kategoria
- **Wyświetlanie:** TYLKO gdy score < 65 LUB bucket == Risk
- **Max 1 hint** — priorytet najpierw `sweetened_beverage`, potem inne

---

## Taksonomia 8 kategorii

| ID | Kategoria | Opis | Typowe produkty |
|----|-----------|------|-----------------|
| `sweetened_beverage` | Słodzony napój | Napoje z cukrem/syropami | Cola, Fanta, soki owocowe, ice tea |
| `high_sugar_snack` | Słodka przekąska | Batony, ciastka, wafelki | Mars, Prince Polo, herbatniki |
| `sweetened_dairy` | Słodzony nabiał | Jogurty, napoje mleczne, serki | Jogobella, Actimel, Monte |
| `refined_bread` | Pieczywo rafinowane | Biały chleb, bułki | Tostowy, kajzerki, bagietki |
| `sweet_sauce` | Słodki sos | Ketchup, BBQ, dressingi | Ketchup, sos słodko-kwaśny |
| `instant_meal` | Danie instant | Zupy instant, dania gotowe | Zupki chińskie, dania 5-min |
| `dessert` | Deser | Lody, budynie, serniki | Lody, galaretki, musy owocowe |
| `alcohol_beverage` | Napój alkoholowy | Piwo, wino, drinki | Piwo smakowe, likery, RTD |

### Uzasadnienie wyboru

**Oparte na mechanizmach IO:**

| Mechanizm | Kategorie |
|-----------|-----------|
| **Szybki wzrost glukozy** | `sweetened_beverage`, `high_sugar_snack`, `dessert` |
| **Ukryte cukry** | `sweetened_dairy`, `sweet_sauce` |
| **Wysoki IG** | `refined_bread`, `instant_meal` |
| **Alkohol + cukry** | `alcohol_beverage` |

---

## Reguły klasyfikacji

### Algorytm (pseudokod)

```dart
HeuristicCategory? classifyProduct({
  required ProductType productType,
  required NutritionFacts? nutrition,
  required IngredientsAnalysis? ingredients,
  required bool isAlcohol,
}) {
  // 1. Alcohol special case
  if (isAlcohol) return HeuristicCategory.alcoholBeverage;

  // 2. Beverage branch
  if (productType == ProductType.beverage) {
    if (_isSweetenedBeverage(nutrition, ingredients))
      return HeuristicCategory.sweetenedBeverage;
    if (_isSweetenedDairy(nutrition, ingredients))
      return HeuristicCategory.sweetenedDairy;
    return null;
  }

  // 3. Solid branch — od najbardziej specyficznych
  if (_isHighSugarSnack(nutrition, ingredients))
    return HeuristicCategory.highSugarSnack;
  if (_isDessert(nutrition, ingredients))
    return HeuristicCategory.dessert;
  if (_isSweetenedDairy(nutrition, ingredients))
    return HeuristicCategory.sweetenedDairy;
  if (_isRefinedBread(nutrition, ingredients))
    return HeuristicCategory.refinedBread;
  if (_isSweetSauce(nutrition, ingredients))
    return HeuristicCategory.sweetSauce;
  if (_isInstantMeal(nutrition, ingredients))
    return HeuristicCategory.instantMeal;

  return null;
}
```

### Reguły dla każdej kategorii

#### `sweetened_beverage`

```dart
// GATE: Tylko beverages
if (productType != ProductType.beverage) return null;

// REGUŁA 1: Cukry > 5g/100ml (priorytet)
if (sugars != null && sugars > 5) → sweetened_beverage

// REGUŁA 2: Flagi cukrowe
if (hasFlag(hasAddedSugar) || hasFlag(hasSyrups) || hasFlag(hasGlucoseFructose))
  → sweetened_beverage

// REGUŁA 3: Wysokie węglowodany bez błonnika (soki)
if (carbs != null && carbs > 10 && (fiber == null || fiber < 1))
  → sweetened_beverage
```

**Confidence: HIGH**

---

#### `high_sugar_snack`

```dart
// GATE: Solid
if (productType != ProductType.solid) return null;

// REGUŁA 1: Cukry > 25g/100g (priorytet)
if (sugars != null && sugars > 25) → high_sugar_snack

// REGUŁA 2: Cukry > 15g + flagi cukrowe
if (sugars != null && sugars > 15
    && (hasFlag(hasAddedSugar) || hasFlag(hasSyrups)))
  → high_sugar_snack

// REGUŁA 3: Bardzo wysokie węglowodany (wafelki, ciastka)
if (carbs != null && carbs > 60 && sugars != null && sugars > 20)
  → high_sugar_snack
```

**Confidence: HIGH**

---

#### `sweetened_dairy`

```dart
// GATE: Beverage lub Solid (jogurty kubkowe = solid, pitne = beverage)
// Sprawdzane zarówno dla beverage jak i solid

// REGUŁA 1: Profile nabiału: białko + cukry (priorytet)
if (protein != null && protein > 2 && protein < 12
    && sugars != null && sugars > 8
    && (fat == null || fat < 10))
  → sweetened_dairy

// REGUŁA 2: Keywords + cukry (ostrożnie)
if (ingredientsContains(['mleko', 'jogurt', 'kefir', 'serek'])
    && sugars != null && sugars > 10)
  → sweetened_dairy
```

**Confidence: MEDIUM**

---

#### `refined_bread`

```dart
// GATE: Solid
if (productType != ProductType.solid) return null;

// REGUŁA 1: Profile chleba rafinowanego (priorytet)
if (carbs != null && carbs > 45
    && (fiber == null || fiber < 3)
    && (protein == null || protein < 10)
    && (sugars == null || sugars < 10)) // nie deser
  → refined_bread

// REGUŁA 2: Keywords piekarnicze + niski błonnik
if (ingredientsContains(['mąka pszenna', 'mąka typ 500', 'mąka typ 550'])
    && (fiber == null || fiber < 4)
    && carbs != null && carbs > 40)
  → refined_bread
```

**Confidence: MEDIUM**

---

#### `sweet_sauce`

```dart
// GATE: Solid
if (productType != ProductType.solid) return null;

// REGUŁA 1: Umiarkowane cukry (priorytet)
if (sugars != null && sugars > 15 && sugars < 40
    && (protein == null || protein < 3)) // nie nabiał
  → sweet_sauce

// REGUŁA 2: Keywords sosowe + cukry
if (ingredientsContains(['pomidor', 'ocet', 'ketchup'])
    && sugars != null && sugars > 12)
  → sweet_sauce
```

**Confidence: MEDIUM**

---

#### `instant_meal`

```dart
// GATE: Solid
if (productType != ProductType.solid) return null;

// REGUŁA 1: Wysoka przetworzoność (priorytet)
if (ingredientCount != null && ingredientCount > 15
    && (hasFlag(hasFlavorings) || hasFlag(hasPreservatives))
    && carbs != null && carbs > 40
    && (sugars == null || sugars < 15)) // nie deser
  → instant_meal

// REGUŁA 2: Keywords + additives (ostrożnie)
if (ingredientsContains(['makaron instant', 'zupa chińska', 'bulion'])
    && countAdditiveFlags() >= 3)
  → instant_meal
```

**Confidence: LOW-MEDIUM**

---

#### `dessert`

```dart
// GATE: Solid
if (productType != ProductType.solid) return null;

// REGUŁA 1: Wysokie cukry + tłuszcze (priorytet)
if (sugars != null && sugars > 18
    && fat != null && fat > 8)
  → dessert

// REGUŁA 2: Keywords deserowe + cukry
if (ingredientsContains(['śmietana', 'lody', 'krem', 'bita'])
    && sugars != null && sugars > 15)
  → dessert
```

**Confidence: MEDIUM** (nakłada się z `high_sugar_snack` — w MVP akceptowalne)

---

#### `alcohol_beverage`

```dart
// REGUŁA SPECJALNA: Już wykrywane w ScoringEngine
if (isAlcohol) → alcohol_beverage
```

**Confidence: HIGH**

---

## Treści hintów

### Format hintu

```dart
class ShoppingHint {
  final HeuristicCategory category;
  final String problemStatement;        // 1 zdanie
  final List<String> alternatives;       // 3-4 pozycje
  final String? caution;                 // 1 zdanie (opcjonalne)
}
```

### Hinty dla 8 kategorii

#### `sweetened_beverage`

```yaml
problemStatement: "Ten napój ma wysoki ładunek cukru, który szybko podnosi glukozę."

alternatives:
  - "Woda gazowana z cytryną lub limonką"
  - "Herbata niesłodzona (zielona, czarna, ziołowa)"
  - "Woda z miętą lub ogórkiem"
  - "Kawa czarna lub z mlekiem (bez syropów)"

caution: "Soki 100% też mają dużo cukru — rozcieńczaj wodą lub wybieraj warzywa."
```

---

#### `high_sugar_snack`

```yaml
problemStatement: "Ta przekąska ma bardzo dużo cukru — szybki skok glukozy gwarantowany."

alternatives:
  - "Orzechy (garść, niesłodzone)"
  - "Ser żółty lub twarożek"
  - "Jajko na twardo"
  - "Warzywa z hummusem"

caution: "Unikaj batonów 'proteinowych' z syropem glukozowym — sprawdzaj skład."
```

---

#### `sweetened_dairy`

```yaml
problemStatement: "Ten nabiał ma dodane cukry mimo białka — nie jest tak zdrowy jak się wydaje."

alternatives:
  - "Jogurt naturalny (możesz dodać owoce)"
  - "Jogurt grecki lub skyr"
  - "Kefir naturalny"
  - "Twarożek naturalny"

caution: "Sprawdzaj etykiety — 'fit' i 'protein' często oznacza dodane słodziki."
```

---

#### `refined_bread`

```yaml
problemStatement: "Białe pieczywo szybko podnosi glukozę — działa jak cukier."

alternatives:
  - "Chleb żytni pełnoziarnisty"
  - "Chleb z mąki razowej"
  - "Pieczywo z ziarnami (pierwsza mąka pełnoziarnista)"
  - "Chleb na zakwasie"

caution: "Chleb 'wieloziarnisty' często bazuje na białej mące — czytaj skład."
```

---

#### `sweet_sauce`

```yaml
problemStatement: "Ten sos ma zaskakująco dużo cukru — kilka łyżek to jak cukierki."

alternatives:
  - "Musztarda (bez cukru)"
  - "Passata pomidorowa (bez cukru)"
  - "Oliwa z oliwek + zioła"
  - "Domowy sos na bazie jogurtu"

caution: "Ketchupy 'light' często mają mniej cukru, ale sprawdź czy znacząco."
```

---

#### `instant_meal`

```yaml
problemStatement: "Dania instant mają dużo przetworzonych węglowodanów i dodatków."

alternatives:
  - "Gotowe sałatki z białkiem"
  - "Puszka tuńczyka + warzywa"
  - "Jajka + chleb pełnoziarnisty"
  - "Gotowe zupy warzywne (sprawdź skład)"

caution: "Jeśli musisz instant — dodaj warzywa i białko, żeby spowolnić wchłanianie."
```

---

#### `dessert`

```yaml
problemStatement: "Desery łączą cukier z tłuszczem — maksymalny wpływ na insulinę."

alternatives:
  - "Jogurt grecki + garść owoców jagodowych"
  - "Gorzka czekolada 70%+ (1-2 kostki)"
  - "Owoce z orzechami"
  - "Ser mascarpone + kakao (bez cukru)"

caution: "Desery 'fit' często mają tyle kalorii co zwykłe — sprawdzaj porcję."
```

---

#### `alcohol_beverage`

```yaml
problemStatement: "Alkohol zaburza metabolizm glukozy i hamuje spalanie tłuszczu."

alternatives:
  - "Woda gazowana z cytryną"
  - "Herbata mrożona (domowa, bez cukru)"
  - "Kawa mrożona"
  - "Napoje bezalkoholowe 0.0% (sprawdź cukier)"

caution: "Jeśli pijesz alkohol — unikaj słodkich drinków i mixerów z cukrem."
```

---

## Architektura MVP (AS IS → TO BE)

### Diagram TO BE (MVP)

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────┐               │
│  │  ProductType    │     │   NutritionFacts    │               │
│  └────────┬────────┘     └──────────┬──────────┘               │
│           │                         │                           │
│           │    ┌────────────────────┴───────────────┐          │
│           │    │                                    │          │
│           ▼    ▼                                    ▼          │
│  ┌────────────────────────┐    ┌────────────────────────────┐  │
│  │     ScoringEngine      │    │  HeuristicCategoryClassifier│  │ ← NOWE
│  │  calculate(...)        │    │  classify(productType,      │  │
│  │                        │    │    nutrition, ingredients)  │  │
│  │  (BEZ ZMIAN)          │    └─────────────┬──────────────┘  │
│  └───────────┬────────────┘                  │                  │
│              │                               │                  │
│              ▼                               ▼                  │
│  ┌────────────────────────┐    ┌────────────────────────────┐  │
│  │     ScoreResult        │    │    HeuristicCategory       │  │ ← NOWE
│  │  (BEZ ZMIAN)          │    │    (enum, 8 wartości)      │  │
│  └───────────┬────────────┘    └────────────────────────────┘  │
│              │                               │                  │
│              │                               ▼                  │
│              │               ┌────────────────────────────┐     │
│              │               │   ShoppingHintsGenerator   │  ← NOWE
│              │               │   generate(category)       │     │
│              │               └─────────────┬──────────────┘     │
│              │                             │                    │
│              ▼                             ▼                    │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              UI: ResultScreen                       │       │
│  │  - compute category on-the-fly                      │       │
│  │  - generate hint if score < 65 || bucket == Risk    │       │
│  │  - display ShoppingHintCard                         │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Kluczowe decyzje MVP

| Decyzja | Uzasadnienie |
|---------|--------------|
| **Brak zapisu kategorii do DB** | Zmniejsza scope, brak migracji, kategoria zawsze aktualna |
| **Liczenie on-the-fly** | Deterministyczne, brak cache invalidation, łatwe testowanie |
| **Bez zmian w ScoringEngine** | Zero ryzyka regresu, scoring pozostaje stabilny |
| **Tylko ResultScreen + HistoryDetailScreen** | Minimalizacja UI changes, focus na moment decyzji |
| **8 kategorii zamiast 12** | Zmniejsza ryzyko false-positive, szybsza implementacja |

### Nowe pliki

| Plik | Ścieżka | Opis |
|------|---------|------|
| `HeuristicCategory` | `lib/domain/shopping/heuristic_category.dart` | Enum z 8 kategoriami |
| `HeuristicCategoryClassifier` | `lib/domain/shopping/heuristic_category_classifier.dart` | Logika klasyfikacji (MVP-safe) |
| `ShoppingHint` | `lib/domain/shopping/shopping_hint.dart` | Model hintu |
| `ShoppingHintsGenerator` | `lib/domain/shopping/shopping_hints_generator.dart` | Generator treści hintów |
| `ShoppingHintCard` | `lib/features/scan/widgets/shopping_hint_card.dart` | Widget UI |

### Modyfikacje istniejących plików

| Plik | Zmiana |
|------|--------|
| `ResultScreen` | Dodaj wywołanie classifiera + `ShoppingHintCard` |
| `HistoryDetailScreen` | Dodaj wywołanie classifiera + `ShoppingHintCard` |

---

## Czego NIE robimy w MVP

### ❌ Odrzucone z MVP (świadomie)

1. **Zapis kategorii do bazy danych**
   - Powód: Zwiększa scope, wymaga migracji, ryzyko cache invalidation
   - Alternatywa: Liczenie on-the-fly

2. **Zmiana modelu `ScoreResult`**
   - Powód: Niepotrzebna — kategoria liczona w UI
   - Alternatywa: Compute w widgecie

3. **Kategorie: `breakfast_cereal`, `processed_meat`, `sweet_spread`, `flavored_dairy_drink`**
   - Powód: Wymaga keyword matching, średnia confidence, wysokie ryzyko false-positive
   - Alternatywa: Backlog na Stage 3

4. **OFF categories integration**
   - Powód: OFF taxonomy niestabilna, nie IO-aware
   - Alternatywa: Własne reguły liczbowe

5. **Personalizacja hintów**
   - Powód: Zbyt złożone, wymaga user preferences
   - Alternatywa: Stage 3

6. **A/B testing mechanizm**
   - Powód: Pre-mature optimization
   - Alternatywa: Zbieraj feedback ręcznie

7. **Multi-language support**
   - Powód: MVP = PL only
   - Alternatywa: Stage 2 po walidacji koncepcji

---

## Backlog

### Future enhancements (świadomie odłożone)

| Feature | Priorytet | Effort | Uzasadnienie odłożenia |
|---------|-----------|--------|------------------------|
| **4 dodatkowe kategorie** | HIGH | M | Wymaga dopracowania reguł, keyword dictionaries |
| **Zapis kategorii do DB** | MEDIUM | L | Dopiero gdy category stable i potrzebna analytics |
| **Personalizacja hintów** | LOW | XL | User preferences + ML, przedwczesne |
| **Hinty w HomeScreen** | LOW | S | UX overload, brak kontekstu decyzji |
| **Multi-language** | MEDIUM | M | Dopiero po walidacji PL market |
| **Category confidence score** | LOW | M | Nice-to-have, nie критyczne dla UX |
| **Integracja z OFF taxonomy** | LOW | L | OFF niestabilne, nie IO-aware |

### Warunki promocji do implementacji

**4 dodatkowe kategorie → MVP v2:**
- Confidence >= 80% w testach na próbce 100 produktów
- False-positive < 5%
- Keyword dictionaries przetestowane

**Zapis do DB → Stage 2:**
- MVP działa stabilnie przez 2 tygodnie
- Potrzebna analytics kategorii
- User feedback pozytywny

---

## Prompty implementacyjne

### Kolej realizacji

```
PROMPT #1 → Domain models + enum (8 kategorii)
PROMPT #2 → HeuristicCategoryClassifier (MVP-safe)
PROMPT #3 → ShoppingHintsGenerator (copy)
PROMPT #4 → UI: ShoppingHintCard (ResultScreen + HistoryDetailScreen)
PROMPT #5 → Testy klasyfikatora
```

---

### PROMPT #1: Domain models + enum (8 kategorii)

**ROLA:** Senior Flutter Engineer

**ZADANIE:**
Stwórz domain models dla heurystycznych hintów zakupowych:
- Enum `HeuristicCategory` (8 kategorii)
- Model `ShoppingHint`

**ŚCIEŻKA:**
- `lib/domain/shopping/heuristic_category.dart`
- `lib/domain/shopping/shopping_hint.dart`

**WYMAGANIA:**

1. **HeuristicCategory (enum):**
```dart
enum HeuristicCategory {
  sweetenedBeverage,      // 0
  highSugarSnack,         // 1
  sweetenedDairy,         // 2
  refinedBread,           // 3
  sweetSauce,             // 4
  instantMeal,            // 5
  dessert,                // 6
  alcoholBeverage,        // 7
}
```

2. **HeuristicCategory methods:**
   - `String get displayName` — PL nazwy UI
   - `String get key` — snake_case string (do przyszłej serialization)

3. **ShoppingHint (immutable model):**
```dart
@immutable
class ShoppingHint {
  final HeuristicCategory category;
  final String problemStatement;
  final List<String> alternatives;
  final String? caution;
}
```

**OGRANICZENIA:**
- ❌ Brak metod `toJson`/`fromJson` (MVP nie zapisuje)
- ❌ Brak `Equatable` (niepotrzebne)
- ✅ Pure domain models, zero dependencies poza Flutter foundation

**EXPECTED OUTPUT:**
- 2 pliki Dart
- 100% type-safe
- Documented (/// comments)

---

### PROMPT #2: HeuristicCategoryClassifier (MVP-safe)

**ROLA:** Senior Flutter Engineer + Domain Expert

**ZADANIE:**
Zaimplementuj klasyfikator kategorii heurystycznych zgodnie z regułami z dokumentu MVP.

**ŚCIEŻKA:**
- `lib/domain/shopping/heuristic_category_classifier.dart`

**SYGNATURA:**
```dart
class HeuristicCategoryClassifier {
  HeuristicCategory? classify({
    required ProductType productType,
    required NutritionFacts? nutrition,
    required IngredientsAnalysis? ingredients,
    required bool isAlcohol,
  });
}
```

**REGUŁY KLASYFIKACJI:**
Zaimplementuj dokładnie według sekcji "Reguły klasyfikacji" z dokumentu MVP:
- Priorytety: liczbowe progi > flagi > keywords
- Reguła złota: `return null` jeśli niska pewność
- Sprawdzaj w kolejności od najbardziej specyficznych

**IMPLEMENTACJA:**

1. **Private methods dla każdej kategorii:**
   - `bool _isSweetenedBeverage(...)`
   - `bool _isHighSugarSnack(...)`
   - `bool _isSweetenedDairy(...)`
   - itd.

2. **Main classify method:**
   - Alcohol special case first
   - Beverage branch
   - Solid branch (od najbardziej specyficznych)
   - Fallback: `return null`

3. **Helper methods:**
   - `bool _hasFlag(IngredientsAnalysis? ing, bool Function(IngredientsAnalysis) getter)`
   - `bool _ingredientsContains(IngredientsAnalysis? ing, List<String> keywords)`
   - `int _countAdditiveFlags(IngredientsAnalysis? ing)`

**OGRANICZENIA:**
- ❌ Brak hardcoded product names / brands
- ❌ Brak OFF categories dependency
- ❌ Brak ML / heuristics scoring (tylko boolean)
- ✅ Progi liczbowe muszą być dokładnie jak w dokumencie MVP
- ✅ Keywords case-insensitive, PL locale

**TESTY (dla PROMPT #5):**
Przygotuj test cases:
- Coca-Cola → `sweetened_beverage`
- Mars → `high_sugar_snack`
- Jogobella → `sweetened_dairy`
- Chleb tostowy → `refined_bread`
- Ketchup → `sweet_sauce`
- Zupka chińska → `instant_meal`
- Lody → `dessert`
- Piwo → `alcohol_beverage`
- Jogurt naturalny → `null`
- Woda → `null`

**EXPECTED OUTPUT:**
- 1 plik Dart, ~300-400 linii
- Fully typed, null-safe
- Documented (/// comments + inline)
- Pure logic, zero side-effects

---

### PROMPT #3: ShoppingHintsGenerator (copy)

**ROLA:** Senior Flutter Engineer + UX Writer

**ZADANIE:**
Zaimplementuj generator treści hintów — hardcoded copy zgodnie z dokumentem MVP.

**ŚCIEŻKA:**
- `lib/domain/shopping/shopping_hints_generator.dart`

**SYGNATURA:**
```dart
class ShoppingHintsGenerator {
  ShoppingHint? generate(HeuristicCategory? category);
}
```

**WYMAGANIA:**

1. **Switch statement na wszystkie 8 kategorii:**
   - `problemStatement` — dokładnie jak w dokumencie MVP
   - `alternatives` — lista 3-4 stringów
   - `caution` — string lub null

2. **Przykład:**
```dart
case HeuristicCategory.sweetenedBeverage:
  return ShoppingHint(
    category: category,
    problemStatement: 'Ten napój ma wysoki ładunek cukru, który szybko podnosi glukozę.',
    alternatives: [
      'Woda gazowana z cytryną lub limonką',
      'Herbata niesłodzona (zielona, czarna, ziołowa)',
      'Woda z miętą lub ogórkiem',
      'Kawa czarna lub z mlekiem (bez syropów)',
    ],
    caution: 'Soki 100% też mają dużo cukru — rozcieńczaj wodą lub wybieraj warzywa.',
  );
```

3. **Fallback:**
```dart
if (category == null) return null;
```

**OGRANICZENIA:**
- ❌ Brak dynamic content (MVP = hardcoded)
- ❌ Brak personalizacji
- ❌ Brak health claims ("zdrowy", "niezdrowy", "pomoże schudnąć")
- ✅ Neutralny ton, faktyczny język
- ✅ Copy 1:1 z dokumentu MVP

**EXPECTED OUTPUT:**
- 1 plik Dart, ~150-200 linii
- Pure function (deterministic)
- PL copy, final review przed implementacją

---

### PROMPT #4: UI: ShoppingHintCard (ResultScreen + HistoryDetailScreen)

**ROLA:** Senior Flutter Engineer (UI/UX specialist)

**ZADANIE:**
Zaimplementuj widget `ShoppingHintCard` i zintegruj z `ResultScreen` oraz `HistoryDetailScreen`.

**ŚCIEŻKI:**
- `lib/features/scan/widgets/shopping_hint_card.dart` (NEW)
- `lib/features/scan/screens/result_screen.dart` (EDIT)
- `lib/features/history/screens/history_detail_screen.dart` (EDIT)

**ShoppingHintCard WIDGET:**

```dart
class ShoppingHintCard extends StatelessWidget {
  final ShoppingHint hint;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.secondaryContainer,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon + Header
            Row(
              children: [
                Icon(Icons.shopping_cart, color: ...),
                SizedBox(width: 8),
                Text('Szukaj zamiast tego', style: ...),
              ],
            ),
            SizedBox(height: 12),
            // Problem statement
            Text(hint.problemStatement, style: ...),
            SizedBox(height: 12),
            // Alternatives (bullet list)
            ...hint.alternatives.map((alt) => 
              Padding(
                padding: EdgeInsets.only(left: 8, bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('• ', style: ...),
                    Expanded(child: Text(alt, style: ...)),
                  ],
                ),
              ),
            ),
            // Caution (if present)
            if (hint.caution != null) ...[
              SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.warning_amber, size: 16, color: ...),
                  SizedBox(width: 4),
                  Expanded(child: Text(hint.caution!, style: ...)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

**ResultScreen INTEGRATION:**

1. **Compute category on-the-fly:**
```dart
// W build method, po otrzymaniu scoreResult
final classifier = HeuristicCategoryClassifier();
final category = classifier.classify(
  productType: product.productType,
  nutrition: product.nutritionFacts,
  ingredients: product.ingredientsAnalysis,
  isAlcohol: product.isAlcohol,
);
```

2. **Generate hint if applicable:**
```dart
ShoppingHint? hint;
if (scoreResult.score < 65 || scoreResult.bucket == ScoreBucket.risk) {
  hint = ShoppingHintsGenerator().generate(category);
}
```

3. **Insert ShoppingHintCard po ReasonsCard, przed TipsCard:**
```dart
// W Column/ListView children:
if (hint != null) ...[
  ShoppingHintCard(hint: hint),
  SizedBox(height: 16),
],
```

**HistoryDetailScreen INTEGRATION:**
- Analogicznie jak w `ResultScreen`
- Compute category z `ScanHistory.product`
- Hint tylko gdy `score < 65 || bucket == Risk`

**LAYOUT ORDER (ResultScreen):**
```
1. ScoreIndicator
2. Verdict
3. Glycemic Load Card (jeśli dostępny)
4. Reasons Card
5. ShoppingHintCard ← TUTAJ (jeśli hint != null)
6. Tips Card
7. Nutrition Details
8. Buttons
```

**OGRANICZENIA:**
- ❌ Brak animacji (MVP = static)
- ❌ Brak collapsible (MVP = zawsze expanded)
- ❌ Brak "Dismiss" action (static content)
- ✅ Responsive text (handle long alternatives)
- ✅ Theme-aware colors (`colorScheme.secondaryContainer`)
- ✅ Max 1 hint per screen

**EXPECTED OUTPUT:**
- 1 nowy plik widget (~80-120 linii)
- 2 edycje w istniejących screens (minimal diff)
- Pixel-perfect padding/spacing
- Screenshot/mockup appreciated (opcjonalne)

---

### PROMPT #5: Testy klasyfikatora

**ROLA:** Senior Flutter Engineer (Testing specialist)

**ZADANIE:**
Napisz unit testy dla `HeuristicCategoryClassifier`.

**ŚCIEŻKA:**
- `test/domain/shopping/heuristic_category_classifier_test.dart`

**WYMAGANIA:**

1. **Test structure:**
```dart
group('HeuristicCategoryClassifier', () {
  late HeuristicCategoryClassifier classifier;

  setUp(() {
    classifier = HeuristicCategoryClassifier();
  });

  group('sweetened_beverage', () {
    test('Coca-Cola (high sugars) → sweetened_beverage', () { ... });
    test('Orange juice (high carbs, no fiber) → sweetened_beverage', () { ... });
    test('Water → null', () { ... });
  });

  group('high_sugar_snack', () {
    test('Mars bar (sugars > 25) → high_sugar_snack', () { ... });
    test('Dark chocolate 70% → null', () { ... });
  });

  // ... dla każdej kategorii
});
```

2. **Minimum 3 testy per kategoria:**
   - TRUE POSITIVE — typowy produkt z kategorii
   - TRUE NEGATIVE — podobny produkt, ale nie pasuje
   - EDGE CASE — graniczna wartość progu

3. **Mock data builders:**
```dart
NutritionFacts _buildNutrition({
  double? sugars,
  double? carbs,
  double? protein,
  double? fat,
  double? fiber,
}) => NutritionFacts( ... );

IngredientsAnalysis _buildIngredients({
  String? ingredientsText,
  bool hasAddedSugar = false,
  bool hasSyrups = false,
  int ingredientCount = 5,
}) => IngredientsAnalysis( ... );
```

4. **Test real-world products:**
   - Coca-Cola 330ml: sugars ~11g/100ml → `sweetened_beverage`
   - Jogobella 150g: sugars ~14g/100g, protein ~4g → `sweetened_dairy`
   - Chleb tostowy: carbs ~50g, fiber ~2g → `refined_bread`
   - Ketchup Heinz: sugars ~22g/100g → `sweet_sauce`
   - Mars 51g: sugars ~60g/100g → `high_sugar_snack`
   - Lody Magnum: sugars ~25g, fat ~15g → `dessert`
   - Zupka chińska: carbs ~50g, ingredientCount ~20 → `instant_meal`
   - Piwo: isAlcohol = true → `alcohol_beverage`

5. **False-positive checks:**
   - Jogurt naturalny (sugars ~5g, protein ~5g) → `null`
   - Woda mineralna → `null`
   - Orzechy (fat ~50g, sugars ~5g) → `null`
   - Chleb razowy (fiber ~8g) → `null`

**OGRANICZENIA:**
- ✅ Minimum 25 testów (3 per kategoria + edge cases)
- ✅ Code coverage > 90% dla classifier
- ✅ Test names opisowe (Given-When-Then style)

**EXPECTED OUTPUT:**
- 1 plik test (~400-500 linii)
- `flutter test` passes 100%
- Coverage report appreciated

---

## Koniec dokumentu

**Następne kroki:**
1. Review tego dokumentu przez Product + Tech
2. Realizacja PROMPT #1-5 w kolejności
3. Manual QA na 20 produktach z różnych kategorii
4. Deploy do internal testing
5. Zbieranie feedback przez 1 tydzień
6. Decyzja o promocji 4 kategorii z backlogu

**Kontakt:**
W razie pytań → Slack #team-nutrition
