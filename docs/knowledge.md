# Knowledge Tab — Analiza & Plan Implementacji

## Wersja: v0.2.0 — Rozszerzenie zakładki Wiedza
**Data:** 2026-02-10  
**Status:** W realizacji  
**Dotyczy:** Asystent IO (Flutter/Dart)

---

## Status prac (live)

**Ostatnia aktualizacja:** 2026-02-13

1. ✅ `T0.2 l10n` (Codex)
2. ✅ `T0.3 Router` (Codex)
3. ✅ `T1.1 KnowledgeHubScreen` (Opus/Sonnet, zintegrowane)
4. ✅ `T1.2 KnowledgeBlockCard` (zrealizowane i podpięte)
5. ✅ `T1.3 Bottom nav` (Codex)
6. ✅ `T2.1 Modele Activity` (Opus, zintegrowane + poprawki equality/hashCode dla list)
7. ✅ `T2.2 Modele Diet` (Opus, zintegrowane + poprawki equality/hashCode dla list/map)
8. ✅ `T2.3 Dane Activity` (Opus, zweryfikowane i zintegrowane)
9. ✅ `T2.5+T2.6 Dane Diet` (Opus, zweryfikowane i zintegrowane)
10. ✅ `T2.7 LearningProgressService` (Codex, zrealizowane)
11. ✅ `T3.1 ActivityHubScreen` (Opus/Sonnet, zintegrowane)
12. ✅ `T3.2 TrainingRulesScreen` (Opus + integracja Codex: routing + persistence)
13. ✅ `T3.3 TrainingPatternsScreen` (Opus + integracja Codex: routing + l10n-safe fallback)
14. ✅ `T3.4 DailyActivityScreen` (Opus + integracja Codex: routing + l10n-safe fallback)
15. ✅ `T3.5 Widgety Activity` (Codex, zrealizowane)
16. ✅ `T3.6 ActivityController` (Opus/Codex, zrealizowane)
17. ✅ `T4.1 DietHubScreen` (Opus + integracja Codex: routing + l10n-safe fallback)
18. ✅ `T4.2 MealCompositionScreen` (Opus + integracja Codex: routing + cleanup warningów)
19. ✅ `T4.3 ImproveNotRestrictScreen` (Opus + integracja Codex: routing + cleanup warningów)
20. ✅ `T4.4 MealExamplesScreen` (Opus/Sonnet, zrealizowane)
21. ✅ `T4.5 Widgety Diet` (Codex, zrealizowane)
22. ✅ `T4.6 DietController` (Opus, zrealizowane)
23. ✅ `T5.1-5.3 Shared widgets` (Codex, zrealizowane)
24. ✅ `T5.4 Testy jednostkowe` (Codex, zrealizowane + green test run)
25. ✅ `T5.5 Testy widget` (Codex, zrealizowane + green test run)

- ✅ Etap promptów `#1-#25` zakończony

- Terminologia: w komunikacji używamy numeracji `#1`-`#25` z tej listy statusu.

---

## 0. Podsumowanie implementacji (final)

### 0.1 Zakres zrealizowany

- Zrealizowano pełny zakres promptów `#1-#25` (Knowledge Hub + Activity + Diet + shared + testy).
- Quiz pozostał modułem niezmienionym funkcjonalnie (rozszerzono jedynie punkt wejścia przez `/knowledge`).
- Dodano warstwę domain/data/services dla Knowledge oraz pełny routing sekcji Activity/Diet.
- Dodano nowe ekrany i widgety współdzielone, wraz z integracją postępu użytkownika.
- Dodano testy jednostkowe i widgetowe dla nowego obszaru Knowledge.

### 0.2 Co zostało zmienione (high-level)

- `lib/core/router/app_router.dart`:
  dodane trasy `'/knowledge'`, `'/knowledge/activity'`, `'/knowledge/activity/rules'`, `'/knowledge/activity/patterns'`, `'/knowledge/activity/decisions'`, `'/knowledge/diet'`, `'/knowledge/diet/composition'`, `'/knowledge/diet/improve'`, `'/knowledge/diet/examples'`.
- `lib/features/home/home_screen.dart`, `lib/features/history/history_screen.dart`, `lib/features/settings/settings_screen.dart`:
  nawigacja „Wiedza” przepięta na hub (`/knowledge`) zamiast bezpośrednio na quiz.
- `lib/domain/knowledge/...`:
  dodane modele, dane i `LearningProgressService` (SharedPreferences).
- `lib/features/knowledge/...`:
  dodane huby, moduły Activity/Diet, kontrolery oraz widgety shared.
- `test/domain/knowledge/...`, `test/features/knowledge/...`:
  dodane testy jednostkowe i widgetowe.

### 0.3 Walidacja techniczna (2026-02-12)

- `flutter test`: ✅ PASS (`All tests passed`, 643 testy).
- `dart analyze`: ⚠️ FAIL (exit code 1, 307 issue).
  Dominują warningi/info historyczne (głównie `premium/*`, `prefer_const_*`, `unnecessary_non_null_assertion`, `unused_*`).
  Knowledge został zintegrowany i testowalny, ale repo globalnie nie jest jeszcze `analyze-clean`.

### 0.4 Status wykonania planu

- Numeracja promptów `#1-#25` utrzymana.
- Wszystkie pozycje planu oznaczone jako ✅.
- Implementacja gotowa do manualnego uruchomienia na urządzeniu.

### 0.5 Visual polish — ujednolicenie kolorystyki (2026-02-13)

Przeprowadzono ujednolicenie kolorystyki wszystkich ekranów Knowledge z niebieskiego/pomarańczowego na spójną zieleń (`positiveGreen` / `positiveGreenDark`).

**Zmienione pliki:**

| Plik | Zamiana |
|------|---------|
| `activity_hub_screen.dart` | `knowledgeActivity` → `positiveGreen` |
| `diet_hub_screen.dart` | `knowledgeDiet` → `positiveGreen` |
| `training_rules_screen.dart` | `knowledgeActivity` → `positiveGreen` |
| `training_patterns_screen.dart` | `knowledgeActivity` → `positiveGreen`, `knowledgeDiet` → `positiveGreen` |
| `daily_activity_screen.dart` | `knowledgeActivity` → `positiveGreen`, `knowledgeDiet` → `warningAmber` (semantic feedback) |
| `meal_composition_screen.dart` | `knowledgeDiet` → `positiveGreen` (przyciski), `risky` → `errorRed` (semantic) |
| `improve_not_restrict_screen.dart` | `knowledgeDiet` → `positiveGreen` |
| `meal_examples_screen.dart` | `knowledgeDiet` → `positiveGreen` |
| `knowledge_hub_screen.dart` | `knowledgeActivity` / `knowledgeDiet` → `positiveGreen` (parametry kart) |

**Wyjątki (kolory semantyczne zachowane):**
- `warningAmber` — dla ostrzeżeń/feedbacku w scenariuszach
- `errorRed` — dla "risky" stability level w meal composition

**KnowledgeBlockCard — redesign:**
- Zmieniono z płaskich białych kart na zielony gradient (`positiveGreen` → `positiveGreenDark`)
- Ikona w jasnym kółku po lewej stronie
- Biały tekst i chevron
- Zwiększona wysokość widgetów o ~25%
- Dodany brand header z liściem + "IR Knowledge" (jak w Quiz)

## Spis treści

1. [Stan obecny — analiza architektury](#1-stan-obecny)
2. [Architektura informacji — Knowledge Tab](#2-architektura-informacji)
3. [Sekcja: Aktywność & Trening z IO](#3-sekcja-aktywność--trening-z-io)
4. [Sekcja: Dieta & Wzorce Żywieniowe z IO](#4-sekcja-dieta--wzorce-żywieniowe-z-io)
5. [Zasady UX & Tonu](#5-zasady-ux--tonu)
6. [Komplementarność z Quizem](#6-komplementarność-z-quizem)
7. [Plan implementacji — podział na zadania](#7-plan-implementacji)
8. [Fragmenty kodu referencyjne](#8-fragmenty-kodu)
9. [Prompty dla modeli LLM](#9-prompty-llm)

---

## 1. Stan obecny

### 1.1 Obecna struktura Knowledge tab

Zakładka „Wiedza" (index 1 w bottom navigation) **obecnie otwiera bezpośrednio QuizScreen**:

```
Bottom Nav → index 1 „Wiedza" → context.push('/quiz') → QuizScreen
```

**Pliki odpowiedzialne:**
- `lib/features/home/home_screen.dart` → `_buildBottomNavigation()` — case 1 push `/quiz`
- `lib/features/gamification/quiz/quiz_screen.dart` → UI quizu
- `lib/features/gamification/quiz/quiz_controller.dart` → Riverpod StateNotifier
- `lib/domain/gamification/quiz_service.dart` → logika gry
- `lib/domain/gamification/quiz_questions_data.dart` → 411 pytań PL
- `lib/domain/gamification/quiz_questions_data_en.dart` → pytania EN

**Router:**
```dart
GoRoute(
  path: '/quiz',
  name: 'quiz',
  builder: (context, state) => const QuizScreen(),
),
```

### 1.2 Co musi się zmienić architektonicznie

| Przed | Po |
|-------|-----|
| Tap „Wiedza" → **QuizScreen** bezpośrednio | Tap „Wiedza" → **KnowledgeHubScreen** (nowy) |
| Brak ekranu pośredniego | Hub z 3 kafelkami: Quiz, Aktywność, Dieta |
| Quiz = jedyny moduł wiedzy | Quiz = jeden z trzech modułów |
| Trasa: `/quiz` | Trasa: `/knowledge` → `/quiz`, `/knowledge/activity`, `/knowledge/diet` |

### 1.3 Zasada ZERO zmian w Quizie

> ⚠️ **Quiz pozostaje NIEZMIENIONY.**  
> Nie modyfikujemy: `QuizScreen`, `QuizController`, `QuizService`, `quiz_questions_data.dart`.  
> Quiz dostaje jedynie nowy punkt wejścia z KnowledgeHubScreen zamiast bezpośredniego push.

---

## 2. Architektura informacji

### 2.1 Widok wejściowy — Knowledge Hub

```
┌─────────────────────────────────┐
│  Knowledge Hub (Wiedza IO)      │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🧠 Quiz Wiedzy IO         │  │ ← istniejący, niezmieniony
│  │    "Sprawdź swoją wiedzę" │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🏃 Aktywność & Trening   │  │ ← NOWY
│  │    "Zasady ruchu z IO"    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🍽️ Dieta & Wzorce        │  │ ← NOWY
│  │    "Kompozycja posiłków"  │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### 2.2 Mapa nawigacji

```
/knowledge (KnowledgeHubScreen)
├── → /quiz (QuizScreen) ← BEZ ZMIAN
├── → /knowledge/activity (ActivityHubScreen)
│   ├── → /knowledge/activity/rules (TrainingRulesModule)
│   ├── → /knowledge/activity/patterns (TrainingPatternsModule)
│   └── → /knowledge/activity/decisions (DailyActivityModule)
└── → /knowledge/diet (DietHubScreen)
    ├── → /knowledge/diet/composition (MealCompositionModule)
    ├── → /knowledge/diet/improve (ImproveNotRestrictModule)
    └── → /knowledge/diet/examples (MealExamplesModule)
```

### 2.3 Hierarchia plików (docelowa)

```
lib/features/knowledge/
├── knowledge_hub_screen.dart          # Ekran główny z 3 kafelkami
├── widgets/
│   └── knowledge_block_card.dart      # Wspólna karta-kafelek
├── activity/
│   ├── activity_hub_screen.dart       # Lista modułów Aktywność
│   ├── activity_controller.dart       # Riverpod controller
│   ├── modules/
│   │   ├── training_rules_screen.dart
│   │   ├── training_patterns_screen.dart
│   │   └── daily_activity_screen.dart
│   └── widgets/
│       ├── scenario_card.dart
│       ├── comparison_widget.dart
│       └── micro_decision_card.dart
├── diet/
│   ├── diet_hub_screen.dart           # Lista modułów Dieta
│   ├── diet_controller.dart           # Riverpod controller
│   ├── modules/
│   │   ├── meal_composition_screen.dart
│   │   ├── improve_not_restrict_screen.dart
│   │   └── meal_examples_screen.dart
│   └── widgets/
│       ├── meal_builder_widget.dart
│       ├── meal_improvement_card.dart
│       └── meal_plan_card.dart
└── shared/
    ├── learning_progress_bar.dart
    ├── interactive_choice_card.dart
    └── feedback_banner.dart

lib/domain/knowledge/
├── models/
│   ├── learning_module.dart           # Model modułu
│   ├── scenario.dart                  # Model scenariusza
│   ├── meal_component.dart            # Model składnika posiłku
│   ├── training_rule.dart             # Model reguły treningowej
│   └── learning_progress.dart         # Postęp nauki
├── data/
│   ├── activity_rules_data.dart       # Treści: zasady aktywności
│   ├── activity_scenarios_data.dart   # Treści: scenariusze
│   ├── diet_meals_data.dart           # Treści: składniki & posiłki
│   └── diet_improvements_data.dart    # Treści: ulepszenia posiłków
└── services/
    ├── learning_progress_service.dart # Zapis postępu (SharedPreferences)
    └── meal_generator_service.dart    # Generator edukacyjnych zestawów
```

---

## 3. Sekcja: Aktywność & Trening z IO

### 3.1 Nazewnictwo

| Język | Nazwa sekcji | Podtytuł |
|-------|-------------|----------|
| PL | Aktywność & Trening z IO | Zasady ruchu przy insulinooporności |
| EN | Activity & Training with IR | Rules of movement with insulin resistance |

### 3.2 Cel edukacyjny

Użytkownik uczy się, że:
- Trening z IO **działa inaczej** niż bez IO
- Większa intensywność ≠ lepsze wyniki
- Stres i regeneracja mają kluczowe znaczenie
- Chodzenie, trening siłowy i odpoczynek to fundamenty

### 3.3 Zasady nauki

| Zasada | Realizacja |
|--------|-----------|
| Uczenie przez decyzje | Scenariusze z wyborem A/B → natychmiastowy feedback |
| Wzorce, nie dyscyplina | „Tak działa IO" zamiast „musisz się bardziej starać" |
| Neutralny ton | Brak oceniania, brak winy |
| Pattern-based | Reguły → konsekwencje → świadomy wybór |

### 3.4 Moduły interaktywne

#### Moduł 1: Najlepsze zasady treningu z IO
**Typ interakcji:** Eksploracja reguł (karty z odwracaniem)

Użytkownik przegląda zasady:
- Intensywność vs. częstotliwość
- Stres vs. regeneracja
- Siła vs. kardio
- Ruch po posiłku vs. ruch na czczo

Każda zasada ma:
- Opis reguły (1-2 zdania)
- Krótki scenariusz wyboru
- Wyjaśnienie „dlaczego tak działa w IO"

**Przykładowy scenariusz:**
```
📋 Scenariusz: Poniedziałek rano
Masz 30 minut. Co wybierasz?

A) Intensywny trening HIIT
B) Spacer 25 min + 5 min rozciąganie

→ [Wybór B]
✅ Przy IO, poranny spacer obniża glukozę delikatnie,
   bez wyrzutu kortyzolu. HIIT na czczo może
   podnieść poziom stresu i blokować progres.
```

#### Moduł 2: Wzorce treningowe i postęp
**Typ interakcji:** Porównanie dwóch tygodni (slider/toggle)

Użytkownik porównuje:
- **Tydzień A:** „Trenuję ciężko codziennie"
- **Tydzień B:** „Zbalansowany tydzień z regeneracją"

System pokazuje:
- Wpływ na poziom stresu
- Wpływ na jakość snu
- Wpływ na odpowiedź insulinową
- Dlaczego wysiłek ≠ adaptacja w IO

**Wizualizacja:**
```
Tydzień A: 🏋️🏋️🏋️🏋️🏋️🏋️🏋️  → Stres: ⬆️⬆️⬆️  Progres: ❌
Tydzień B: 🏋️🚶🏋️🚶🧘🏋️🚶  → Stres: ➡️   Progres: ✅
```

#### Moduł 3: Codzienne decyzje ruchowe
**Typ interakcji:** Mikro-decyzje (karty do przesuwania)

Szybkie karty ze scenariuszami:
- Po posiłku: siedzisz vs. idziesz na spacer
- Jesteś zmęczony/a: odpoczywasz vs. forsowny trening
- Masz wolne: lekki ruch vs. maraton kardio

Focus: **wzorce, nie dyscyplina.**

---

## 4. Sekcja: Dieta & Wzorce Żywieniowe z IO

### 4.1 Nazewnictwo

| Język | Nazwa sekcji | Podtytuł |
|-------|-------------|----------|
| PL | Dieta & Wzorce Żywieniowe z IO | Kompozycja posiłków przy insulinooporności |
| EN | Diet & Eating Patterns with IR | Meal composition with insulin resistance |

### 4.2 Cel edukacyjny

Użytkownik uczy się:
- **JAK** komponować posiłki (nie CO jeść)
- Nie liczyć kalorii
- Zamieniać zamiast eliminować
- Stabilność > perfekcja

### 4.3 Zasady nauki

| Zasada | Realizacja |
|--------|-----------|
| Kompozycja > kalorie | Interaktywny builder posiłku (drag & drop) |
| Zamiana > eliminacja | „Zmień 1 składnik" zamiast „nie jedz X" |
| Przykłady, nie przepisy | Wzorce strukturalne, nie recepty |
| Bez wartościowania | „Ta kompozycja jest bardziej stabilna" vs. „to jest złe" |

### 4.4 Moduły interaktywne

#### Moduł 1: Kompozycja posiłku z IO
**Typ interakcji:** Builder posiłku (visual drag & select)

Użytkownik buduje posiłek z komponentów:
- 🥩 Białko (mięso, ryba, jajka, tofu, nabiał)
- 🥦 Błonnik (warzywa, sałatki, brokuły)
- 🍞 Węglowodany (pieczywo, ryż, makaron, kasza)
- 🥑 Tłuszcze (oliwa, orzechy, awokado)

System analizuje **proporcje** (nie kalorie!) i pokazuje:
- „Ta kompozycja wspiera stabilną glikemię"
- „Dodanie błonnika do tego posiłku zmniejszy skok cukru"
- „Białko + tłuszcz spowalniają wchłanianie węglowodanów"

**Wizualizacja talerzowa:**
```
┌─────────────────────────┐
│  🍽️  Twój talerz         │
│                          │
│   ┌──────┐  ┌──────┐    │
│   │Białko│  │Błonnik│    │
│   │ 25%  │  │ 50%  │    │
│   └──────┘  └──────┘    │
│   ┌──────┐  ┌──────┐    │
│   │Węglo.│  │Tłusz.│    │
│   │ 15%  │  │ 10%  │    │
│   └──────┘  └──────┘    │
│                          │
│  ✅ Stabilna kompozycja  │
└─────────────────────────┘
```

#### Moduł 2: Ulepsz, nie eliminuj
**Typ interakcji:** Karta posiłku + 1-2 zmiany

Użytkownik dostaje popularny posiłek (np. „kanapka z białym pieczywem i dżemem") i może:
- Zamienić 1-2 składniki
- Zobaczyć, jak zmienia się struktura odpowiedzi glikemicznej

**Przykład:**
```
🍽️ Śniadanie: Tost z białym pieczywem + dżem + kawa z cukrem

Zmień 1 rzecz:
[Zamień pieczywo → pełnoziarniste]  ← tap
[Zamień dżem → masło orzechowe]    ← tap
[Zamień cukier → bez cukru]        ← tap

Po zmianie:
✅ Pieczywo pełnoziarniste dodaje błonnik — wolniejsze
   wchłanianie cukrów. Mała zmiana, duży efekt.
```

#### Moduł 3: Edukacyjne przykłady posiłków (3-7 dni)
**Typ interakcji:** Przeglądanie przykładowych zestawów

Zestawy posiłków pokazywane jako **przykłady edukacyjne**, nie plany dietetyczne:
- Każdy posiłek wyjaśnia DLACZEGO wspiera stabilność
- Każdy posiłek uczy JAKI WZORZEC reprezentuje
- NIE są to przepisy do ścisłego wykonania

**Struktura karty posiłku:**
```
┌─────────────────────────────┐
│  Dzień 1 — Śniadanie        │
│                              │
│  Jajecznica z warzywami     │
│  + chleb pełnoziarnisty     │
│  + awokado                  │
│                              │
│  📘 Ten posiłek uczy:       │
│  • Białko + tłuszcz na start│
│  • Błonnik z warzyw         │
│  • Wolne węglowodany z     │
│    pełnego ziarna            │
│                              │
│  💡 Wzorzec: BWT             │
│  (Białko-Warzywa-Tłuszcz)  │
└─────────────────────────────┘
```

---

## 5. Zasady UX & Tonu

### 5.1 Język

| Tak ✅ | Nie ❌ |
|--------|--------|
| „Ta kompozycja wspiera stabilność" | „To jest zdrowe / niezdrowe" |
| „Przy IO ten wzorzec daje lepsze wyniki" | „Musisz to jeść" |
| „Taki trening może zwiększyć stres" | „Źle trenujesz" |
| „Zamiana zamiast rezygnacji" | „Nie jedz tego" |
| „Wzorzec" / „struktura" / „proporcja" | „Kalorie" / „dieta" / „odchudzanie" |

### 5.2 Feedback edukacyjny

- Każdy wybór daje **wyjaśnienie** (nie tylko dobrze/źle)
- Brak punktacji (to nie quiz — to eksploracja)
- Progres mierzony w „ukończonych modułach", nie w poprawnych odpowiedziach
- Użytkownik może wrócić do dowolnego modułu

### 5.3 Wizualnie

- Spójna kolorystyka z resztą aplikacji (Material 3, darkGreen `#2E7D52`)
- Karty z zaokrąglonymi rogami (konsekwentnie)
- Ikony z `material_symbols_icons`
- Animacje minimalne (bez nadmiaru)

---

## 6. Komplementarność z Quizem

```
┌──────────────┐     ┌──────────────────────────┐
│    Quiz       │     │  Aktywność & Dieta        │
│               │     │                           │
│  Sprawdza     │     │  Trenuje                  │
│  wiedzę       │     │  decyzje                  │
│               │     │                           │
│  Szybkie Q&A  │     │  Interaktywne scenariusze │
│  Format gry   │     │  Format eksploracji       │
│               │     │                           │
│  Recall       │     │  Understanding            │
│  Pamięć       │     │  Zrozumienie              │
└──────────────┘     └──────────────────────────┘
        │                        │
        └────────┬───────────────┘
                 │
         Razem tworzą:
    ZROZUMIENIE + PRAKTYKA
```

- **Quiz** = „Czy wiesz?" → sprawdzanie zapamiętanej wiedzy
- **Nowe sekcje** = „Co byś wybrał/a?" → budowanie kompetencji decyzyjnych
- Quiz nie wymaga zmian — nowe moduły go uzupełniają
- Użytkownik sam wybiera ścieżkę nauki

---

## 7. Plan implementacji — podział na zadania

### Faza 0: Przygotowanie (infrastructure)

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T0.1 | Utworzenie struktury katalogów `lib/features/knowledge/`, `lib/domain/knowledge/` | — | 5 min | — |
| T0.2 | Dodanie kluczy l10n (PL + EN) dla nowych sekcji | `lib/l10n/app_pl.arb`, `app_en.arb` | 30 min | Sonnet |
| T0.3 | Rozszerzenie routera o nowe trasy | `lib/core/router/app_router.dart` | 15 min | Codex |

### Faza 1: Knowledge Hub Screen (punkt wejścia)

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T1.1 | KnowledgeHubScreen — ekran z 3 kafelkami | `knowledge_hub_screen.dart` | 45 min | Sonnet |
| T1.2 | KnowledgeBlockCard — reusable widget kafelka | `knowledge_block_card.dart` | 20 min | Codex |
| T1.3 | Zmiana nawigacji bottom nav: Wiedza → `/knowledge` zamiast `/quiz` (użyj `context.go`) | `home_screen.dart`, `history_screen.dart`, `settings_screen.dart` | 15 min | Codex |

### Faza 2: Domain — modele i dane

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T2.1 | Modele domeny: `LearningModule`, `Scenario`, `TrainingRule` | `lib/domain/knowledge/models/` | 30 min | Opus |
| T2.2 | Modele domeny: `MealComponent`, `MealExample`, `LearningProgress` | `lib/domain/knowledge/models/` | 30 min | Opus |
| T2.3 | Dane: zasady aktywności (PL + EN) | `activity_rules_data.dart` | 60 min | Opus |
| T2.4 | Dane: scenariusze aktywności (PL + EN) | `activity_scenarios_data.dart` | 60 min | Opus |
| T2.5 | Dane: składniki posiłków i przykłady (PL + EN) | `diet_meals_data.dart` | 60 min | Opus |
| T2.6 | Dane: ulepszenia posiłków (PL + EN) | `diet_improvements_data.dart` | 60 min | Opus |
| T2.7 | LearningProgressService (SharedPreferences) | `learning_progress_service.dart` | 30 min | Codex |

### Faza 3: Aktywność & Trening — UI

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T3.1 | ActivityHubScreen — lista modułów | `activity_hub_screen.dart` | 30 min | Sonnet |
| T3.2 | TrainingRulesScreen — eksploracja reguł | `training_rules_screen.dart` | 60 min | Opus |
| T3.3 | TrainingPatternsScreen — porównanie tygodni | `training_patterns_screen.dart` | 60 min | Opus |
| T3.4 | DailyActivityScreen — mikro-decyzje | `daily_activity_screen.dart` | 45 min | Sonnet |
| T3.5 | Widgety: ScenarioCard, ComparisonWidget, MicroDecisionCard | `widgets/` | 45 min | Codex |
| T3.6 | ActivityController (Riverpod) | `activity_controller.dart` | 30 min | Codex |

### Faza 4: Dieta & Wzorce — UI

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T4.1 | DietHubScreen — lista modułów | `diet_hub_screen.dart` | 30 min | Sonnet |
| T4.2 | MealCompositionScreen — builder posiłku | `meal_composition_screen.dart` | 90 min | Opus |
| T4.3 | ImproveNotRestrictScreen — zamiana składników | `improve_not_restrict_screen.dart` | 60 min | Opus |
| T4.4 | MealExamplesScreen — przykłady 3-7 dni | `meal_examples_screen.dart` | 45 min | Sonnet |
| T4.5 | Widgety: MealBuilderWidget, MealImprovementCard, MealPlanCard | `widgets/` | 45 min | Codex |
| T4.6 | DietController (Riverpod) | `diet_controller.dart` | 30 min | Codex |

### Faza 5: Shared widgets + polish

| # | Zadanie | Pliki | Estymacja | Model LLM |
|---|---------|-------|-----------|------------|
| T5.1 | LearningProgressBar — wspólny widget | `shared/learning_progress_bar.dart` | 20 min | Codex |
| T5.2 | InteractiveChoiceCard — karta wyboru A/B | `shared/interactive_choice_card.dart` | 30 min | Codex |
| T5.3 | FeedbackBanner — banner z wyjaśnieniem po wyborze | `shared/feedback_banner.dart` | 20 min | Codex |
| T5.4 | Testy jednostkowe modeli | `test/domain/knowledge/` | 45 min | Codex |
| T5.5 | Testy widget | `test/features/knowledge/` | 45 min | Codex |

### Kolejność realizacji

```
Faza 0 → Faza 1 → Faza 2 → Faza 3 + Faza 4 (równolegle) → Faza 5
```

**Łączna estymacja:** ~18-20h pracy developerskiej

---

## 8. Fragmenty kodu

### 8.1 KnowledgeHubScreen — szkielet

```dart
// lib/features/knowledge/knowledge_hub_screen.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:material_symbols_icons/symbols.dart';
import '../../l10n/app_localizations.dart';
import 'widgets/knowledge_block_card.dart';

class KnowledgeHubScreen extends StatelessWidget {
  const KnowledgeHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(l10n.quizTitle), // "Wiedza IO"
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Existing Quiz — unchanged
          KnowledgeBlockCard(
            icon: Symbols.neurology,
            title: l10n.knowledgeQuizTitle,       // "Quiz Wiedzy IO"
            subtitle: l10n.knowledgeQuizSubtitle, // "Sprawdź swoją wiedzę"
            color: const Color(0xFF2E7D52),
            onTap: () => context.push('/quiz'),
          ),
          const SizedBox(height: 16),

          // NEW: Activity & Training
          KnowledgeBlockCard(
            icon: Symbols.directions_run,
            title: l10n.knowledgeActivityTitle,       // "Aktywność & Trening z IO"
            subtitle: l10n.knowledgeActivitySubtitle, // "Zasady ruchu"
            color: const Color(0xFF1565C0),
            onTap: () => context.push('/knowledge/activity'),
          ),
          const SizedBox(height: 16),

          // NEW: Diet & Eating Patterns
          KnowledgeBlockCard(
            icon: Symbols.restaurant,
            title: l10n.knowledgeDietTitle,       // "Dieta & Wzorce"
            subtitle: l10n.knowledgeDietSubtitle, // "Kompozycja posiłków"
            color: const Color(0xFFE65100),
            onTap: () => context.push('/knowledge/diet'),
          ),
        ],
      ),
    );
  }
}
```

### 8.2 KnowledgeBlockCard — widget kafelka

```dart
// lib/features/knowledge/widgets/knowledge_block_card.dart

import 'package:flutter/material.dart';

class KnowledgeBlockCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const KnowledgeBlockCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: color.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 8.3 Modele domeny

```dart
// lib/domain/knowledge/models/scenario.dart

/// A scenario presenting a choice and educational feedback.
class Scenario {
  final String id;
  final String titleKey;        // l10n key
  final String contextKey;      // l10n key for situation description
  final List<ScenarioChoice> choices;
  final String category;        // 'activity' | 'diet'

  const Scenario({
    required this.id,
    required this.titleKey,
    required this.contextKey,
    required this.choices,
    required this.category,
  });
}

class ScenarioChoice {
  final String labelKey;        // l10n key for choice text
  final String feedbackKey;     // l10n key for feedback
  final bool isRecommended;     // pattern-aligned (NOT "correct")

  const ScenarioChoice({
    required this.labelKey,
    required this.feedbackKey,
    required this.isRecommended,
  });
}
```

```dart
// lib/domain/knowledge/models/meal_component.dart

/// A building block for interactive meal composition.
class MealComponent {
  final String id;
  final String nameKey;         // l10n key
  final MealComponentType type;
  final String iconEmoji;

  const MealComponent({
    required this.id,
    required this.nameKey,
    required this.type,
    required this.iconEmoji,
  });
}

enum MealComponentType {
  protein,
  fiber,
  carbs,
  fats,
}
```

```dart
// lib/domain/knowledge/models/learning_progress.dart

/// Tracks user's progress through educational modules.
class LearningProgress {
  final Map<String, bool> completedModules; // moduleId → completed
  final Map<String, int> scenariosExplored; // moduleId → count

  const LearningProgress({
    this.completedModules = const {},
    this.scenariosExplored = const {},
  });

  int get totalCompleted => completedModules.values.where((v) => v).length;

  LearningProgress copyWith({
    Map<String, bool>? completedModules,
    Map<String, int>? scenariosExplored,
  }) {
    return LearningProgress(
      completedModules: completedModules ?? this.completedModules,
      scenariosExplored: scenariosExplored ?? this.scenariosExplored,
    );
  }
}
```

### 8.4 Router — rozszerzenie

```dart
// Dodane trasy w app_router.dart (poniżej istniejącej /quiz)

GoRoute(
  path: '/knowledge',
  name: 'knowledge',
  builder: (context, state) => const KnowledgeHubScreen(),
),
GoRoute(
  path: '/knowledge/activity',
  name: 'knowledge-activity',
  builder: (context, state) => const ActivityHubScreen(),
),
GoRoute(
  path: '/knowledge/activity/rules',
  name: 'knowledge-activity-rules',
  builder: (context, state) => const TrainingRulesScreen(),
),
GoRoute(
  path: '/knowledge/activity/patterns',
  name: 'knowledge-activity-patterns',
  builder: (context, state) => const TrainingPatternsScreen(),
),
GoRoute(
  path: '/knowledge/activity/decisions',
  name: 'knowledge-activity-decisions',
  builder: (context, state) => const DailyActivityScreen(),
),
GoRoute(
  path: '/knowledge/diet',
  name: 'knowledge-diet',
  builder: (context, state) => const DietHubScreen(),
),
GoRoute(
  path: '/knowledge/diet/composition',
  name: 'knowledge-diet-composition',
  builder: (context, state) => const MealCompositionScreen(),
),
GoRoute(
  path: '/knowledge/diet/improve',
  name: 'knowledge-diet-improve',
  builder: (context, state) => const ImproveNotRestrictScreen(),
),
GoRoute(
  path: '/knowledge/diet/examples',
  name: 'knowledge-diet-examples',
  builder: (context, state) => const MealExamplesScreen(),
),
```

### 8.5 Bottom Nav — zmiana nawigacji

```dart
// W home_screen.dart, zmiana z:
case 1:
  context.push('/quiz');
// Na:
case 1:
  context.push('/knowledge');
```

---

## 9. Prompty LLM

### Numeracja promptów (1-25)

1. `T0.2 l10n`
2. `T0.3 Router`
3. `T1.1 KnowledgeHubScreen`
4. `T1.2 KnowledgeBlockCard`
5. `T1.3 Bottom nav`
6. `T2.1 Modele Activity`
7. `T2.2 Modele Diet`
8. `T2.3 Dane Activity`
9. `T2.5+T2.6 Dane Diet`
10. `T2.7 LearningProgressService`
11. `T3.1 ActivityHubScreen`
12. `T3.2 TrainingRulesScreen`
13. `T3.3 TrainingPatternsScreen`
14. `T3.4 DailyActivityScreen`
15. `T3.5 Widgety Activity`
16. `T3.6 ActivityController`
17. `T4.1 DietHubScreen`
18. `T4.2 MealCompositionScreen`
19. `T4.3 ImproveNotRestrictScreen`
20. `T4.4 MealExamplesScreen`
21. `T4.5 Widgety Diet`
22. `T4.6 DietController`
23. `T5.1-5.3 Shared widgets`
24. `T5.4 Testy jednostkowe`
25. `T5.5 Testy widget`

Uwaga:
- Szczegółowe sekcje `### PROMPT #...` są obecnie rozpisane dla: `#1 #2 #3 #5 #6 #7 #8 #9 #10 #12 #15 #18 #19 #24`.
- Pozostałe numery są utrzymywane w statusie `#1-#25` i będą dopisywane jako pełne sekcje promptów przed ich użyciem.

### Guardrails (wszystkie prompty Opus)

- Modyfikuj wyłącznie pliki jawnie wskazane w sekcji `FILE(S) TO MODIFY` / `CREATE`.
- Nie zmieniaj innych feature'ów ani plików infrastrukturalnych poza zakresem promptu.
- Jeśli potrzebny jest plik spoza zakresu, zwróć listę braków zamiast robić zmiany poza zakresem.

### UI SOTA Standard (wszystkie prompty UI: Opus/Sonnet)

- Traktuj output jako kod produkcyjny: clean architecture, czytelna kompozycja widgetów, brak "quick hacks".
- Zachowaj pełną responsywność (small phones + large screens) bez overflow.
- Dodaj komplet stanów UX: loading / empty / error (jeśli ekran korzysta z danych).
- Accessibility first: odpowiedni kontrast, minimum touch target 44x44, semantics dla kluczowych elementów.
- Animacje subtelne i celowe (200-300ms), bez nadmiaru i bez pogorszenia czytelności.
- Spójność z design systemem aplikacji (Material 3, typografia, spacing, color tokens).
- Zero hardcoded user-facing strings: wyłącznie l10n.
- Kod gotowy pod review: const gdzie możliwe, wydzielone prywatne metody/widgety, brak duplikacji logiki.

### Przypisanie modeli do zadań

| Typ zadania | Rekomendowany model | Dlaczego |
|-------------|-------------------|----------|
| Architektura, modele domeny, złożona logika | **Claude Opus** | Najlepsza jakość kodu architektonicznego |
| UI screens, layouty, widgety funkcjonalne | **Claude Sonnet** | Szybki, dobry w generowaniu Flutter UI |
| Proste widgety, testy, routing, l10n | **Codex 5.3** | Najszybszy dla prostych, powtarzalnych zadań |
| Treści edukacyjne (scenariusze, dane) | **Claude Opus** | Wymaga głębokiego zrozumienia kontekstu IO |

---

### PROMPT #1 (T0.2) — Klucze l10n (Sonnet)

```
TASK: Add l10n keys for Knowledge Hub in Asystent IO Flutter app.

CONTEXT:
- Flutter app using AppLocalizations (ARB files)
- Existing l10n files: lib/l10n/app_pl.arb, lib/l10n/app_en.arb
- Material Design 3, Riverpod, GoRouter
- App helps people with insulin resistance (IO/IR)

REQUIRED KEYS (add to both PL and EN ARB files):

Knowledge Hub:
- knowledgeQuizTitle → PL: "Quiz Wiedzy IO" / EN: "IR Knowledge Quiz"
- knowledgeQuizSubtitle → PL: "Sprawdź swoją wiedzę" / EN: "Test your knowledge"
- knowledgeActivityTitle → PL: "Aktywność & Trening z IO" / EN: "Activity & Training with IR"
- knowledgeActivitySubtitle → PL: "Zasady ruchu przy insulinooporności" / EN: "Rules of movement with IR"
- knowledgeDietTitle → PL: "Dieta & Wzorce Żywieniowe" / EN: "Diet & Eating Patterns"
- knowledgeDietSubtitle → PL: "Kompozycja posiłków z IO" / EN: "Meal composition with IR"

Activity Section:
- activityHubTitle → PL: "Aktywność & Trening" / EN: "Activity & Training"
- activityRulesTitle → PL: "Najlepsze zasady treningu" / EN: "Best training rules"
- activityRulesSubtitle → PL: "Poznaj reguły ruchu z IO" / EN: "Learn the rules of movement with IR"
- activityPatternsTitle → PL: "Wzorce i postęp" / EN: "Patterns & progress"
- activityPatternsSubtitle → PL: "Porównaj strategie treningowe" / EN: "Compare training strategies"
- activityDecisionsTitle → PL: "Codzienne decyzje" / EN: "Daily decisions"
- activityDecisionsSubtitle → PL: "Mikro-decyzje ruchowe" / EN: "Movement micro-decisions"

Diet Section:
- dietHubTitle → PL: "Dieta & Wzorce" / EN: "Diet & Patterns"
- dietCompositionTitle → PL: "Kompozycja posiłku" / EN: "Meal composition"
- dietCompositionSubtitle → PL: "Buduj posiłek z IO" / EN: "Build a meal with IR"
- dietImproveTitle → PL: "Ulepsz, nie eliminuj" / EN: "Improve, don't restrict"
- dietImproveSubtitle → PL: "Zamień 1 składnik" / EN: "Swap 1 ingredient"
- dietExamplesTitle → PL: "Przykłady posiłków" / EN: "Meal examples"
- dietExamplesSubtitle → PL: "Edukacyjne zestawy 3-7 dni" / EN: "Educational sets 3-7 days"

Feedback strings:
- scenarioRecommended → PL: "Przy IO ten wzorzec daje lepsze wyniki" / EN: "With IR, this pattern gives better results"
- scenarioAlternative → PL: "Ten wybór też jest możliwy, ale..." / EN: "This choice is also possible, but..."
- mealStabilityGood → PL: "Ta kompozycja wspiera stabilną glikemię" / EN: "This composition supports stable glycemia"
- mealAddFiber → PL: "Dodanie błonnika zmniejszy skok cukru" / EN: "Adding fiber will reduce sugar spike"
- moduleCompleted → PL: "Moduł ukończony!" / EN: "Module completed!"

RULES:
- Follow existing ARB file format exactly
- Add @description annotations for each key
- Do NOT modify any existing keys
- Sort alphabetically within the file (or at the end)

OUTPUT: Show the exact JSON entries to add to both app_pl.arb and app_en.arb
```

---

### PROMPT #2 (T0.3) — Router (Codex)

```
TASK: Extend GoRouter in Asystent IO Flutter app with Knowledge Hub routes.

CONTEXT:
- File: lib/core/router/app_router.dart
- Existing route: GoRoute(path: '/quiz', ...) — DO NOT MODIFY
- Architecture: flat route list (no ShellRoute)
- Imports needed for new screens

INSTRUCTIONS:
1. Add import for KnowledgeHubScreen
2. Add import for ActivityHubScreen, TrainingRulesScreen, TrainingPatternsScreen, DailyActivityScreen
3. Add import for DietHubScreen, MealCompositionScreen, ImproveNotRestrictScreen, MealExamplesScreen
4. Add GoRoute entries for:
   - /knowledge → KnowledgeHubScreen
   - /knowledge/activity → ActivityHubScreen
   - /knowledge/activity/rules → TrainingRulesScreen
   - /knowledge/activity/patterns → TrainingPatternsScreen
   - /knowledge/activity/decisions → DailyActivityScreen
   - /knowledge/diet → DietHubScreen
   - /knowledge/diet/composition → MealCompositionScreen
   - /knowledge/diet/improve → ImproveNotRestrictScreen
   - /knowledge/diet/examples → MealExamplesScreen
5. Keep /quiz route UNCHANGED

RULES:
- Follow existing code patterns exactly
- Each route is a separate GoRoute (flat, not nested)
- const constructors for all screens
- Name format: 'knowledge-activity-rules' (kebab-case)

OUTPUT: Complete updated app_router.dart file
```

---

### PROMPT #3 (T1.1) — KnowledgeHubScreen (Sonnet)

```
TASK: Create KnowledgeHubScreen for Asystent IO Flutter app.

CONTEXT:
- Flutter, Riverpod, Material Design 3, GoRouter
- This screen replaces direct push to /quiz from bottom nav
- It shows 3 selectable blocks: Quiz (existing), Activity (new), Diet (new)
- App color: darkGreen #2E7D52
- Uses AppLocalizations for all strings
- Uses material_symbols_icons for icons

EXISTING PATTERNS TO FOLLOW:
- QuizScreen has AppBar with close button (Icons.close → Navigator.pop)
- Cards use RoundedRectangleBorder with borderRadius 16
- Body uses SingleChildScrollView or ListView with padding 20

SCREEN DESIGN:
- AppBar with close button + title "Wiedza IO" (l10n.quizTitle)
- 3 KnowledgeBlockCard widgets in a vertical list
- Each card has: icon, title, subtitle, color, onTap → push route
- Cards:
  1. Quiz: icon=Symbols.neurology, color=#2E7D52, route=/quiz
  2. Activity: icon=Symbols.directions_run, color=#1565C0, route=/knowledge/activity
  3. Diet: icon=Symbols.restaurant, color=#E65100, route=/knowledge/diet

FILE: lib/features/knowledge/knowledge_hub_screen.dart

IMPORTS: flutter/material, go_router, material_symbols_icons,
         app_localizations, knowledge_block_card

RULES:
- StatelessWidget (no state needed)
- All strings from l10n
- const constructor
- Follow project patterns (check existing screens for style)
- DO NOT touch QuizScreen or any quiz files

OUTPUT: Complete Dart file
```

---

### PROMPT #4 (T1.2) — KnowledgeBlockCard (Codex)

```
TASK: Create reusable KnowledgeBlockCard widget used across Knowledge Hub screens.

FILE TO CREATE:
- lib/features/knowledge/widgets/knowledge_block_card.dart

REQUIREMENTS:
- Props: icon, title, subtitle, color, onTap
- Material 3 card style, rounded corners (radius 16)
- Visual structure: leading icon container, title/subtitle text, trailing chevron
- Touch feedback with InkWell and matching border radius
- const constructor and required fields

RULES:
- Modify only this file.
- No hardcoded business text (title/subtitle passed via props).
- Keep widget reusable for Quiz/Activity/Diet hubs.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #5 (T1.3) — Bottom Nav zmiana (Codex)

```
TASK: Update bottom navigation in 3 files to point to /knowledge instead of /quiz.

FILES TO MODIFY:
1. lib/features/home/home_screen.dart
2. lib/features/history/history_screen.dart
3. lib/features/settings/settings_screen.dart

CHANGE (in each file):
In _buildBottomNavigation method, find case 1 and change:
  context.push('/quiz')  →  context.go('/knowledge')

RULES:
- Only change the navigation target
- Do NOT change icons, labels, colors or any other code
- Do NOT modify any other cases (0, 2, 3)
- Preserve exact formatting

OUTPUT: Show the exact diff for each file (minimal change)
```

---

### PROMPT #6 (T2.1) — Domain models: Activity (Opus)

```
TASK: Create domain models for the Activity & Training educational section
of Asystent IO — a Flutter app for people with insulin resistance (IO/IR).

CONTEXT:
- Architecture: lib/domain/ contains business logic, NO Flutter imports
- Existing models follow immutable pattern with const constructors
- Models are plain Dart classes (no code generation)
- App supports PL and EN via l10n keys (models store keys, not strings)

CREATE THESE MODELS:

1. TrainingRule (lib/domain/knowledge/models/training_rule.dart)
   - id: String
   - titleKey: String (l10n key)
   - descriptionKey: String (l10n key)
   - category: TrainingRuleCategory enum
   - iconEmoji: String
   
   TrainingRuleCategory enum: intensity, recovery, strength, movement, stress

2. Scenario (lib/domain/knowledge/models/scenario.dart)
   - id: String
   - titleKey: String
   - contextKey: String (situation description l10n key)
   - choices: List<ScenarioChoice>
   - category: String ('activity' | 'diet')
   
   ScenarioChoice:
   - labelKey: String
   - feedbackKey: String
   - isRecommended: bool (pattern-aligned, NOT "correct/incorrect")

3. WeekPattern (lib/domain/knowledge/models/week_pattern.dart)
   - id: String
   - nameKey: String
   - days: List<DayActivity>
   - stressLevel: PatternLevel enum (low, medium, high)
   - progressLevel: PatternLevel enum
   - descriptionKey: String
   
   DayActivity:
   - dayKey: String
   - activityType: ActivityType enum (strength, walk, hiit, yoga, rest)
   - intensityKey: String

4. LearningModule (lib/domain/knowledge/models/learning_module.dart)
   - id: String
   - titleKey: String
   - subtitleKey: String
   - iconEmoji: String
   - section: LearningSection enum (activity, diet)
   - route: String (GoRouter path)

RULES:
- All classes immutable with const constructors
- No Flutter imports (pure Dart)
- No code generation (no freezed, no json_serializable)
- Comprehensive dartdoc comments in English
- copyWith methods where useful
- toString, == and hashCode overrides

OUTPUT: Complete Dart files, one per model
```

---

### PROMPT #7 (T2.2) — Domain models: Diet (Opus)

```
TASK: Create domain models for the Diet & Eating Patterns educational section
of Asystent IO — a Flutter app for people with insulin resistance (IO/IR).

CONTEXT:
- Same architecture as PROMPT T2.1 (see above)
- These models support interactive meal composition and improvement modules

CREATE THESE MODELS:

1. MealComponent (lib/domain/knowledge/models/meal_component.dart)
   - id: String
   - nameKey: String (l10n key)
   - type: MealComponentType enum (protein, fiber, carbs, fats)
   - iconEmoji: String
   - stabilityImpact: StabilityImpact enum (positive, neutral, negative)
   - descriptionKey: String (why this component matters for IR)

2. MealExample (lib/domain/knowledge/models/meal_example.dart)
   - id: String
   - mealType: MealType enum (breakfast, lunch, dinner, snack)
   - nameKey: String
   - components: List<String> (component IDs)
   - patternKey: String (e.g. "BWT" = Białko-Warzywa-Tłuszcz)
   - lessonKey: String (what this meal teaches)
   - dayIndex: int (1-7 for weekly view)

3. MealImprovement (lib/domain/knowledge/models/meal_improvement.dart)
   - id: String
   - originalMealKey: String (l10n key: "Tost z białym pieczywem i dżemem")
   - swapOptions: List<SwapOption>
   
   SwapOption:
   - originalKey: String (what to replace)
   - replacementKey: String (what to replace with)
   - explanationKey: String (why this helps with IR)
   - improvementType: ImprovementType enum (addFiber, reduceGI, addProtein, reduceSugar)

4. LearningProgress (lib/domain/knowledge/models/learning_progress.dart)
   - completedModules: Map<String, bool>
   - scenariosExplored: Map<String, int>
   - mealsBuilt: int
   - improvementsMade: int
   - copyWith method
   - totalCompleted getter

RULES:
- Same rules as PROMPT T2.1
- No calorie values anywhere — only structural patterns
- No "good/bad" language in enum names or keys

OUTPUT: Complete Dart files, one per model
```

---

### PROMPT #8 (T2.3) — Dane: zasady aktywności (Opus)

```
TASK: Create educational content data for "Activity & Training with IR" section.
This is a DATA FILE with hardcoded content for the Asystent IO Flutter app.

CONTEXT:
- App helps people with insulin resistance (IO/IR)
- This data feeds interactive learning modules
- Pattern: similar to quiz_questions_data.dart (const list of model objects)
- Must support PL and EN (use l10n keys that reference ARB files)

CONTENT REQUIREMENTS:
- Educational, not medical advice
- Neutral tone, no guilt, no "good/bad"
- Pattern-based: rules → consequences → informed choice
- Focus: training with IR works DIFFERENTLY, not "harder = better"

CREATE: lib/domain/knowledge/data/activity_rules_data.dart

Include 10-15 TrainingRule objects covering:
1. Walking after meals reduces glucose gently (no cortisol spike)
2. HIIT on empty stomach can increase stress and block progress with IR
3. Strength training improves insulin sensitivity long-term
4. Recovery is part of training (not laziness)
5. Consistency > intensity for IR
6. Cortisol from overtraining blocks weight loss with IR
7. 10-15 min walk after meal is more effective than 1h cardio session
8. Sleep quality directly affects insulin resistance
9. Light movement every day > intense sessions 2x/week
10. Stretching and yoga reduce cortisol (support IR management)
11. Progressive overload in strength training (slow, steady)
12. Rest days are adaptation days (muscles grow during rest)

Also CREATE: lib/domain/knowledge/data/activity_scenarios_data.dart

Include 8-10 Scenario objects with 2-3 choices each:
1. Monday morning, 30 minutes: HIIT vs walk + stretch
2. After heavy lunch: sit vs 10-min walk
3. Tired after work: force gym vs light yoga vs rest
4. Weekend: 2h intense run vs strength + walk combo
5. Stressed: intense cardio vs calm walk
6. No progress in 2 weeks: train harder vs add recovery
7. Morning choice: fasted cardio vs breakfast + walk
8. Evening: heavy weights vs gentle movement + early sleep

Each scenario must have:
- Situation description
- 2-3 choices (never "wrong", but one is "recommended pattern for IR")
- Educational feedback for EACH choice (explaining WHY in context of IR)

RULES:
- Pure Dart (no Flutter imports)
- Const lists
- Use l10n key pattern: 'activityRule_walking_title', 'activityScenario_morning_context'
- All user-facing strings must be l10n keys (no hardcoded MVP strings)
- Comprehensive dartdoc

OUTPUT: Two complete Dart files with all data
```

---

### PROMPT #9 (T2.5 + T2.6) — Dane: dieta (Opus)

```
TASK: Create educational content data for "Diet & Eating Patterns with IR" section.

CONTEXT:
- Asystent IO Flutter app for insulin resistance
- Data for interactive meal composition and improvement modules
- NO calorie counting, NO rigid diets, NO "good/bad" food labels

CREATE FILE 1: lib/domain/knowledge/data/diet_meals_data.dart

MealComponent objects (20-25 items):
Protein: chicken, fish, eggs, tofu, cottage cheese, greek yogurt
Fiber: broccoli, spinach, salad, tomatoes, peppers, zucchini
Carbs: whole grain bread, brown rice, buckwheat, oats, sweet potato
Fats: olive oil, avocado, nuts, seeds, butter

Each component has:
- type (protein/fiber/carbs/fats)
- stabilityImpact (how it affects glycemic stability)
- descriptionKey (WHY it matters for IR)

MealExample objects (14-21 items for 3-7 day example sets):
- 7 breakfasts, 7 lunches, 7 dinners (or 3-day set)
- Each meal is a PATTERN (e.g., "BWT" = Białko-Warzywa-Tłuszcz)
- Each meal teaches ONE specific principle

CREATE FILE 2: lib/domain/knowledge/data/diet_improvements_data.dart

MealImprovement objects (8-12 items):
1. White toast + jam → whole grain + nut butter
2. Sweetened yogurt → plain yogurt + berries
3. White rice + breaded meat → brown rice + grilled meat + vegetables
4. Pasta with ketchup → pasta al dente + olive oil + vegetables
5. Cornflakes + milk → oats + seeds + nuts
6. Sandwich with processed cheese → sandwich with cottage cheese + veggies
7. Fruit juice → whole fruit
8. Sweet coffee + cookie → coffee no sugar + dark chocolate piece
9. White bread with honey → whole grain with avocado
10. Instant noodles → buckwheat with vegetables and egg

Each improvement has:
- Original meal description
- 1-3 swap options (user picks one)
- Explanation of WHY the swap helps (in terms of glycemic structure)
- No calorie numbers, no guilt language

TONE RULES:
- "This composition is more stable" NOT "this is healthier"
- "Fiber slows down sugar absorption" NOT "white bread is bad"
- "Swap" NOT "eliminate"
- "Pattern" NOT "diet plan"

OUTPUT: Two complete Dart files
```

---

### PROMPT #11 (T3.1) — ActivityHubScreen (Opus/Sonnet)

```
TASK: Create ActivityHubScreen for Asystent IO Flutter app.

CONTEXT:
- Flutter, Material Design 3, GoRouter
- This is the entry screen for /knowledge/activity
- It lists 3 modules from Activity section:
  1) /knowledge/activity/rules
  2) /knowledge/activity/patterns
  3) /knowledge/activity/decisions
- Use AppLocalizations for all visible strings
- Use existing KnowledgeBlockCard style/pattern for consistency

FILE TO CREATE:
- lib/features/knowledge/activity/activity_hub_screen.dart

SCREEN DESIGN:
1. AppBar with back button and title: l10n.activityHubTitle
2. Intro subtitle text (short, neutral educational tone)
3. 3 tappable module cards:
   - activityRulesTitle + activityRulesSubtitle -> /knowledge/activity/rules
   - activityPatternsTitle + activityPatternsSubtitle -> /knowledge/activity/patterns
   - activityDecisionsTitle + activityDecisionsSubtitle -> /knowledge/activity/decisions
4. Vertical layout, spacing and rounded cards aligned with app patterns

IMPORTS:
- flutter/material.dart
- go_router.dart
- material_symbols_icons/symbols.dart
- app_localizations.dart

RULES:
- Modify only the file listed above.
- StatelessWidget with const constructor.
- No hardcoded user-facing strings (l10n only).
- Keep UI production-ready and consistent with Material 3 app style.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #12 (T3.2) — TrainingRulesScreen (Opus)

```
TASK: Create TrainingRulesScreen — interactive rule exploration for IR training.

CONTEXT:
- Asystent IO, Flutter/Dart, Riverpod, Material Design 3
- This screen shows training rules as explorable cards
- User taps a rule card → it expands/flips to show details + scenario
- No quiz mechanics (no scoring), just exploration and learning
- Color theme: blue #1565C0 for activity section
- App color: darkGreen #2E7D52

SCREEN DESIGN:
1. AppBar with back button + title from l10n
2. Short intro text (1-2 lines, neutral tone)
3. List of TrainingRule cards (from activity_rules_data.dart)
4. Each card:
   - Collapsed: emoji + title + tap hint
   - Expanded: description + mini-scenario (if available)
   - Smooth expand/collapse animation (AnimatedCrossFade or AnimatedContainer)
5. Bottom: progress indicator ("Explored 3/12 rules")

WIDGET STRUCTURE:
- ConsumerStatefulWidget (needs to track which rules have been explored)
- Uses Riverpod provider for data
- Each rule tap marks it as "explored" in local state
- SharedPreferences persistence via LearningProgressService

UI PATTERNS (follow existing app):
- Card with RoundedRectangleBorder, borderRadius 16
- Padding 20 on body
- Theme colors from Theme.of(context)
- l10n for ALL visible strings

FILE: lib/features/knowledge/activity/modules/training_rules_screen.dart

IMPORTS: flutter/material, flutter_riverpod, app_localizations,
         training_rule model, activity_rules_data

RULES:
- Smooth, polished UI (Material 3)
- No "good/bad" framing
- Educational feedback on every interaction
- Animations: subtle (300ms max)

OUTPUT: Complete Dart file with all methods
```

---

### PROMPT #13 (T3.3) — TrainingPatternsScreen (Opus)

```
TASK: Create TrainingPatternsScreen — weekly pattern comparison module for IR.

CONTEXT:
- Asystent IO, Flutter/Dart, Riverpod, Material Design 3
- Screen compares two weekly approaches:
  A) high intensity / low recovery
  B) balanced intensity / planned recovery
- Goal: teach that with IR, adaptation depends on stress + recovery balance
- Use existing models: WeekPattern, DayActivity, PatternLevel
- Data source can be local const examples in screen (temporary) or provider-ready structure
- Color theme: blue #1565C0 (activity section)

FILE TO CREATE:
- lib/features/knowledge/activity/modules/training_patterns_screen.dart

SCREEN DESIGN:
1. AppBar with title from l10n (activityPatternsTitle)
2. Intro text from l10n (activityPatternsSubtitle)
3. Pattern switcher (A/B) with smooth transition
4. Visual week timeline (Mon-Sun) with activity icons per day
5. Stress level indicator + progress/adaptation indicator
6. Educational explanation panel ("why this pattern works differently with IR")

INTERACTIONS:
- User toggles between pattern A and pattern B
- UI animates timeline + indicators (200-300ms)
- No scoring, no "wrong answers"

RULES:
- Modify only this file.
- ConsumerStatefulWidget.
- Use Material 3 patterns and app spacing conventions.
- No hardcoded user-facing strings (l10n keys or existing l10n getters only).
- Keep tone neutral, educational, pattern-based.
- Production-ready quality (responsive, accessible, clean widget composition).

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #14 (T3.4) — DailyActivityScreen (Opus/Sonnet)

```
TASK: Create DailyActivityScreen — micro-decisions module for daily movement with IR.

FILE TO CREATE:
- lib/features/knowledge/activity/modules/daily_activity_screen.dart

CONTEXT:
- Flutter/Dart, Riverpod, Material 3
- User goes through short daily movement scenarios (2-option or 3-option cards)
- No scoring; educational feedback after each decision
- Neutral tone, pattern-based explanations

REQUIREMENTS:
- AppBar title from l10n: activityDecisionsTitle
- Intro subtitle from l10n: activityDecisionsSubtitle
- Reuse Scenario model/data from activity_scenarios_data.dart
- Show feedback banner after choice
- Track local progress (how many scenarios explored)
- Production-ready UI quality (responsive + accessible)

RULES:
- Modify only this file.
- ConsumerStatefulWidget.
- No hardcoded user-facing strings.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #16 (T3.6) — ActivityController (Codex)

```
TASK: Create ActivityController for Knowledge Activity modules.

FILE TO CREATE:
- lib/features/knowledge/activity/activity_controller.dart

CONTEXT:
- Flutter Riverpod StateNotifier pattern
- Handles lightweight UI state for activity modules
- Integrates with LearningProgressService where needed

STATE SHOULD COVER:
- exploredRulesCount
- exploredScenariosCount
- selectedPatternId (for patterns module)
- completion flags by module

RULES:
- Keep logic simple and testable.
- No UI code in controller.
- Follow project Riverpod style.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #17 (T4.1) — DietHubScreen (Opus/Sonnet)

```
TASK: Create DietHubScreen for Asystent IO Flutter app.

FILE TO CREATE:
- lib/features/knowledge/diet/diet_hub_screen.dart

CONTEXT:
- Entry screen for /knowledge/diet
- Shows 3 module cards:
  1) /knowledge/diet/composition
  2) /knowledge/diet/improve
  3) /knowledge/diet/examples
- Use KnowledgeBlockCard style for visual consistency

REQUIREMENTS:
- AppBar title from l10n: dietHubTitle
- Card titles/subtitles from l10n:
  - dietCompositionTitle / dietCompositionSubtitle
  - dietImproveTitle / dietImproveSubtitle
  - dietExamplesTitle / dietExamplesSubtitle
- Color accent: orange #E65100
- Material 3, responsive layout, no hardcoded user-facing strings

RULES:
- Modify only this file.
- StatelessWidget with const constructor.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #18 (T4.2) — MealCompositionScreen (Opus)

```
TASK: Create MealCompositionScreen — interactive meal builder for IR diet education.

CONTEXT:
- Asystent IO, Flutter/Dart, Riverpod, Material Design 3
- Users build a meal by selecting components from 4 categories
- System shows real-time feedback on glycemic stability pattern
- NO calorie counting — only structural composition matters
- Color theme: orange #E65100 for diet section

SCREEN DESIGN:
1. AppBar with back button + title "Kompozycja posiłku" (l10n)
2. Plate visualization (circular or grid showing selected components)
3. Component picker: 4 tabs or sections (Protein, Fiber, Carbs, Fats)
4. Each component is a tappable chip/card
5. Real-time feedback panel:
   - Shows composition balance (% of each type)
   - Shows stability feedback messages
   - Changes color based on composition (green=stable, yellow=ok, orange=needs work)
6. "Why this works" expandable section after building

INTERACTION FLOW:
1. Start with empty plate
2. Tap components to add (toggle on/off)
3. Plate visualization updates live
4. Feedback text changes based on composition:
   - No protein? → "Adding protein slows absorption"
   - No fiber? → "Vegetables add fiber for stability"
   - Only carbs? → "This composition may cause a sugar spike"
   - Good balance? → "This composition supports stable glycemia"
5. Optional: "Build another" button to clear and retry

VISUAL DESIGN:
- Plate as a rounded card with 4 quadrants
- Components as FilterChip or ChoiceChip with emoji
- Feedback as an animated Card that slides in
- Progress tracked: meals built counter

TECHNICAL:
- ConsumerStatefulWidget
- Local state for selected components
- MealCompositionController (Riverpod StateNotifier):
  - selectedComponents: Set<String>
  - stabilityFeedback: String (computed from selection)
  - compositionBalance: Map<MealComponentType, double>
- Uses MealComponent model from domain
- Uses diet_meals_data.dart for available components

FILE: lib/features/knowledge/diet/modules/meal_composition_screen.dart

RULES:
- Beautiful, interactive UI
- Animations on component add/remove (300ms)
- No calories, no grams, no numbers
- Only patterns and proportions
- All strings from l10n
- Follow existing app patterns

OUTPUT: Complete Dart file
```

---

### PROMPT #19 (T4.3) — ImproveNotRestrictScreen (Opus)

```
TASK: Create ImproveNotRestrictScreen — meal improvement learning module for IR.

CONTEXT:
- Asystent IO, Flutter/Dart, Riverpod, Material Design 3
- Users see a common meal and can swap 1-2 ingredients
- System explains WHY the swap helps with insulin resistance
- Core message: "Replace instead of eliminate"
- Color theme: orange #E65100

SCREEN DESIGN:
1. AppBar + title "Ulepsz, nie eliminuj" (l10n)
2. Current meal card (large, prominent):
   - Meal name and description
   - Visual representation (emoji components)
3. Swap options as tappable cards below:
   - Each shows: "Zamień [original] → [replacement]"
   - Tap to apply swap
4. After swap:
   - Meal card updates with new ingredient highlighted (green)
   - Explanation banner slides in: WHY this helps with IR
   - "Before → After" structural comparison
5. "Next meal" button to cycle through examples
6. Progress: "Improved 3/10 meals"

INTERACTION:
- User sees meal → picks ONE swap → sees result + explanation
- Can undo swap to try a different one
- Each meal has 2-3 swap options
- After all swaps explored for one meal → "Next meal" available

DATA SOURCE: diet_improvements_data.dart (MealImprovement objects)

WIDGET STRUCTURE:
- PageView or manual index for cycling through meals
- AnimatedSwitcher for swap transitions
- Each swap option = GestureDetector card

TONE:
- "Fiber from whole grain slows sugar absorption"
- NOT "white bread is unhealthy"
- Always explain the MECHANISM, not judge the food

FILE: lib/features/knowledge/diet/modules/improve_not_restrict_screen.dart

OUTPUT: Complete Dart file
```

---

### PROMPT #20 (T4.4) — MealExamplesScreen (Opus/Sonnet)

```
TASK: Create MealExamplesScreen — educational 3-7 day meal pattern viewer.

FILE TO CREATE:
- lib/features/knowledge/diet/modules/meal_examples_screen.dart

CONTEXT:
- Uses MealExample data from diet_meals_data.dart
- Educational patterns, not strict diet plans
- Shows day-based meal cards with explanation: pattern + lesson

REQUIREMENTS:
- AppBar title from l10n: dietExamplesTitle
- Intro subtitle from l10n: dietExamplesSubtitle
- List or tabs by day with breakfast/lunch/dinner cards
- Each card shows: meal name, pattern label, lesson text
- Smooth UX, Material 3, responsive layout

RULES:
- Modify only this file.
- No hardcoded user-facing strings.

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #21 (T4.5) — Widgety Diet (Codex)

```
TASK: Create reusable diet widgets for knowledge modules.

FILES TO CREATE:
1. lib/features/knowledge/diet/widgets/meal_builder_widget.dart
2. lib/features/knowledge/diet/widgets/meal_improvement_card.dart
3. lib/features/knowledge/diet/widgets/meal_plan_card.dart

REQUIREMENTS:
- Material 3 styling consistent with app
- Reusable APIs (props-driven, minimal coupling)
- Support l10n-driven text from parent
- const constructors where possible

OUTPUT:
- Three complete Dart files.
```

---

### PROMPT #22 (T4.6) — DietController (Codex)

```
TASK: Create DietController for diet knowledge modules.

FILE TO CREATE:
- lib/features/knowledge/diet/diet_controller.dart

STATE SHOULD COVER:
- selected meal components
- built meals counter
- improvements made counter
- currently selected meal example/day index

RULES:
- Riverpod StateNotifier style
- No UI code
- Integrate with LearningProgressService where applicable

OUTPUT:
- Complete Dart file.
```

---

### PROMPT #23 (T5.1-5.3) — Shared Widgets (Codex)

```
TASK: Create shared reusable widgets for knowledge modules.

FILES TO CREATE:
1. lib/features/knowledge/shared/learning_progress_bar.dart
2. lib/features/knowledge/shared/interactive_choice_card.dart
3. lib/features/knowledge/shared/feedback_banner.dart

REQUIREMENTS:
- Generic, reusable across Activity and Diet modules
- Material 3 visuals and animations (subtle 200-300ms)
- Props-based API, no business logic coupling

OUTPUT:
- Three complete Dart files.
```

---

### PROMPT #10 (T2.7) — LearningProgressService (Codex)

```
TASK: Create LearningProgressService for persisting learning progress
in Asystent IO Flutter app.

CONTEXT:
- Uses SharedPreferences (same as existing StreakService)
- Pattern: same as lib/domain/gamification/streak_service.dart
- Tracks which modules user has explored, scenarios completed, meals built

SERVICE: lib/domain/knowledge/services/learning_progress_service.dart

METHODS:
1. Future<LearningProgress> loadProgress()
2. Future<void> markModuleCompleted(String moduleId)
3. Future<void> incrementScenariosExplored(String moduleId)
4. Future<void> incrementMealsBuilt()
5. Future<void> incrementImprovementsMade()
6. Future<void> resetProgress()

SHARED PREFERENCES KEYS:
- knowledge_completed_modules (JSON string of Map<String, bool>)
- knowledge_scenarios_explored (JSON string of Map<String, int>)
- knowledge_meals_built (int)
- knowledge_improvements_made (int)

RULES:
- Follow StreakService patterns exactly
- Pure Dart + SharedPreferences
- Defensive coding (handle missing keys, corrupted data)
- dartdoc comments
- No Flutter imports except SharedPreferences

OUTPUT: Complete Dart file
```

---

### PROMPT #15 (T3.5) — Shared Activity Widgets (Codex)

```
TASK: Create reusable widgets for Activity & Training section.

CONTEXT:
- Asystent IO, Flutter/Dart, Material Design 3
- Blue theme #1565C0 for activity section
- Used in TrainingRulesScreen, TrainingPatternsScreen, DailyActivityScreen

CREATE 3 WIDGETS:

1. ScenarioCard (lib/features/knowledge/activity/widgets/scenario_card.dart)
   - Props: title, context, choices, onChoiceSelected, selectedIndex
   - Shows scenario description + 2-3 choice buttons
   - Selected choice shows feedback with slide animation
   - Recommended choice gets green border, others neutral

2. ComparisonWidget (lib/features/knowledge/activity/widgets/comparison_widget.dart)
   - Props: weekPatternA, weekPatternB, activePattern (A or B)
   - Toggle between two week patterns
   - Shows visual timeline: Mon-Sun with activity icons
   - Shows stress level bar + progress bar for each pattern
   - Smooth animation when switching

3. MicroDecisionCard (lib/features/knowledge/activity/widgets/micro_decision_card.dart)
   - Props: situation, optionA, optionB, feedbackA, feedbackB, onDismiss
   - Swipeable card (left = A, right = B) or two tappable halves
   - After choice: shows feedback banner
   - "Next" button after feedback read

RULES:
- StatelessWidget or StatefulWidget as needed
- All strings via l10n keys or passed as props
- Material 3 design tokens
- Smooth animations (200-400ms)
- const constructors where possible
- Reusable across modules

OUTPUT: Three complete Dart files
```

---

### PROMPT #24 (T5.4) — Testy jednostkowe (Codex)

```
TASK: Create unit tests for Knowledge domain models and services.

CONTEXT:
- Asystent IO Flutter app
- Test framework: flutter_test
- Existing test patterns: see test/domain/gamification/

CREATE TESTS:

1. test/domain/knowledge/models/scenario_test.dart
   - Test Scenario construction
   - Test ScenarioChoice.isRecommended
   - Test equality and hashCode

2. test/domain/knowledge/models/meal_component_test.dart
   - Test MealComponent construction
   - Test MealComponentType enum values
   - Test StabilityImpact enum

3. test/domain/knowledge/models/learning_progress_test.dart
   - Test LearningProgress default values
   - Test copyWith
   - Test totalCompleted getter
   - Test markModule completed logic

4. test/domain/knowledge/services/learning_progress_service_test.dart
   - Mock SharedPreferences
   - Test loadProgress returns empty on first run
   - Test markModuleCompleted persists
   - Test incrementScenariosExplored
   - Test incrementMealsBuilt
   - Test resetProgress clears all keys
   - Test corrupted data handling

RULES:
- Follow existing test patterns (group/test structure)
- Use setUp/tearDown
- SharedPreferences.setMockInitialValues({}) for tests
- Descriptive test names
- At least 5 tests per file

OUTPUT: Four complete test files
```

---

### PROMPT #25 (T5.5) — Testy widget (Codex)

```
TASK: Create widget tests for key Knowledge screens and shared widgets.

FILES TO CREATE:
- test/features/knowledge/knowledge_hub_screen_test.dart
- test/features/knowledge/activity/activity_hub_screen_test.dart
- test/features/knowledge/activity/training_rules_screen_test.dart
- test/features/knowledge/diet/diet_hub_screen_test.dart

REQUIREMENTS:
- Cover basic rendering
- Cover navigation taps where applicable
- Cover key interaction states (expand/collapse, progress visibility)
- Use existing flutter_test style from project

OUTPUT:
- Complete test files with passing baseline assertions.
```

---

### PROMPT MASTER — Kompletna sesja implementacji (Opus)

```
TASK: You are implementing the Knowledge Hub extension for Asystent IO,
a Flutter app for insulin resistance.

CRITICAL CONSTRAINTS:
1. The existing Quiz module MUST remain EXACTLY as it is.
   Do NOT modify: QuizScreen, QuizController, QuizService,
   quiz_questions_data.dart, quiz_questions_data_en.dart
2. This is an EXTENSION, not a redesign
3. Follow existing architecture: features/ for UI, domain/ for logic
4. Use Riverpod for state management
5. Use GoRouter for navigation
6. Use AppLocalizations (ARB files) for all strings
7. Use Material Design 3 with app color #2E7D52
8. Offline-first (no backend calls)
9. SharedPreferences for progress persistence

IMPLEMENTATION ORDER:
1. Domain models (pure Dart, no Flutter)
2. Data files (hardcoded educational content)
3. Services (LearningProgressService)
4. Router updates (new routes)
5. KnowledgeHubScreen (entry point)
6. Activity section screens
7. Diet section screens
8. Bottom nav update (3 files)
9. l10n keys (PL + EN)
10. Tests

CURRENT STATE:
- Bottom nav "Wiedza" pushes directly to /quiz
- Must now push to /knowledge (new KnowledgeHubScreen)
- KnowledgeHubScreen shows 3 blocks: Quiz, Activity, Diet
- Quiz block pushes to /quiz (unchanged)

EDUCATIONAL CONTENT DIRECTION:
- Activity: "Training with IR works differently. Rules, not motivation."
- Diet: "Composition over calories. Replace, don't eliminate."
- Tone: Neutral, no guilt, pattern-based, educational

For each file you create, add the path as a dartdoc comment at the top.
Follow ALL existing code patterns (check QuizScreen for UI style reference).
```

---

## Podsumowanie

| Metryka | Wartość |
|---------|---------|
| Nowych plików | ~30 |
| Modyfikowanych plików | 4 (router, 3x bottom nav) |
| Plików quizu zmienionych | **0** |
| Estymacja pracy | 18-20h |
| Faz implementacji | 6 (0-5) |
| Promptów LLM | 13 |
| Modeli domeny | 8 |
| Ekranów UI | 9 |
| Modułów interaktywnych | 6 |

---

**Dokument przygotowany:** 2026-02-10  
**Następny krok:** Rozpoczęcie od Fazy 0 (struktura katalogów + l10n)

