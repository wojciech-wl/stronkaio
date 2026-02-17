# Grywalizacja – Implementacja 2.1 & 2.3

> **Zakres:** Daily Streak + Quiz Wiedzy IO
> **Pominięte:** 2.2 Odznaki/Achievementy

---

## 1. Analiza zależności

### Graf zależności

```
                    ┌─────────────────────┐
                    │  SharedPreferences  │
                    │     (istniejący)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  GamificationState  │  ◄── wspólny model
                    │  (nowy model)       │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────▼─────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│   StreakService   │ │ QuizService     │ │ QuizQuestions   │
│   (2.1)           │ │ (2.3)           │ │ Data (const)    │
└─────────┬─────────┘ └────────┬────────┘ └────────┬────────┘
          │                    │                    │
          │           ┌────────▼────────┐          │
          │           │ QuizController  │◄─────────┘
          │           │ (Riverpod)      │
          │           └────────┬────────┘
          │                    │
┌─────────▼─────────┐ ┌────────▼────────┐
│  StreakWidget     │ │  QuizScreen     │
│  (Home Screen)    │ │  (/quiz)        │
└─────────┬─────────┘ └────────┬────────┘
          │                    │
          └────────┬───────────┘
                   │
          ┌────────▼────────┐
          │  app_router.dart│  (modyfikacja)
          │  home_screen.dart│  (modyfikacja)
          └─────────────────┘
```

### Kolejność implementacji (krytyczna ścieżka)

1. **Warstwa 0:** Modele danych (GamificationState, QuizQuestion)
2. **Warstwa 1:** Serwisy (StreakService, QuizService, quiz_questions_data)
3. **Warstwa 2:** Kontrolery Riverpod
4. **Warstwa 3:** Widgety UI
5. **Warstwa 4:** Integracja (routing, home_screen)

---

## 2. Estymacja pracochłonności (Claude 4.5)

| Prompt | Opis | Pliki | Złożoność | ~Tokeny |
|--------|------|-------|-----------|---------|
| 1 | Struktura + modele | 3 | Niska | ~800 |
| 2 | StreakService | 1 | Średnia | ~600 |
| 3 | QuizQuestion + data | 2 | Średnia (treść) | ~2000 |
| 4 | QuizService | 1 | Średnia | ~700 |
| 5 | GamificationController | 1 | Średnia | ~600 |
| 6 | StreakWidget | 1 | Niska | ~400 |
| 7 | QuizController | 1 | Niska | ~500 |
| 8 | QuizScreen UI | 1 | Średnia | ~800 |
| 9 | Integracja + routing | 2 (mod) | Niska | ~400 |
| 10 | Testy (opcjonalne) | 2 | Średnia | ~1000 |

**Łącznie:** ~13 plików (10 nowych + 3 modyfikacje)

**Szacowany czas (przy zatwierdzaniu każdego promptu):** 10 promptów × ~2-3 min = 20-30 minut

---

## 3. Prompty implementacyjne

---

### PROMPT 1: Struktura folderów i modele

```
Utwórz strukturę dla grywalizacji (tylko 2.1 Streak + 2.3 Quiz, BEZ odznak):

lib/domain/gamification/
├── gamification_state.dart
├── quiz_question.dart
└── quiz_category.dart

lib/features/gamification/
├── widgets/
└── quiz/

Modele do stworzenia:

1. QuizCategory (enum): basics, diet, products, myths, science

2. QuizQuestion (immutable class):
   - String question
   - List<String> answers (4 elementy)
   - int correctIndex (0-3)
   - QuizCategory category

3. GamificationState:
   - int currentStreak
   - int bestStreak
   - int quizBestRun
   - String currentTitle (computed getter na podstawie quizBestRun)

Progi tytułów:
0-4: Początkujący, 5-9: Uczeń IO, 10-14: Znawca IO,
15-19: Mistrz IO, 20-24: Guru IO, 25+: Legenda IO

Użyj prostych klas Dart (bez freezed). Dodaj copyWith i == jeśli potrzebne.
```

---

### PROMPT 2: StreakService

```
Zaimplementuj lib/domain/gamification/streak_service.dart

Klasa StreakService z metodą:
  Future<StreakResult> checkAndUpdateStreak(SharedPreferences prefs)

Logika:
- Pobierz lastOpenDate z prefs (klucz: 'gamification_last_open_date', format YYYY-MM-DD)
- Pobierz currentStreak (klucz: 'gamification_current_streak', default 0)
- Pobierz bestStreak (klucz: 'gamification_best_streak', default 0)

Warunki:
- lastOpenDate == today → return bez zmian (wasUpdated: false)
- lastOpenDate == yesterday → streak++
- lastOpenDate < yesterday OR null → streak = 1 (reset/start)

Po aktualizacji:
- Zapisz nowy currentStreak i lastOpenDate
- Jeśli currentStreak > bestStreak → zapisz bestStreak

StreakResult:
  - int currentStreak
  - int bestStreak
  - bool wasUpdated

Użyj DateFormat z intl lub ręcznego formatowania YYYY-MM-DD.
Metody pomocnicze: _isToday(String?), _isYesterday(String?), _todayString()
```

---

### PROMPT 3: Quiz Questions Data

```
Utwórz lib/domain/gamification/quiz_questions_data.dart

const List<QuizQuestion> quizQuestions z MINIMUM 50 pytań.

Kategorie i proporcje:
- basics (10): definicje IO, IG, ŁG, glukoza, insulina
- diet (15): zasady żywienia przy IO, posiłki, nawyki
- products (15): IG konkretnych produktów, porównania
- myths (5): obalanie mitów (miód, owoce, "zdrowe" produkty)
- science (5): mechanizmy, badania, fizjologia

Zasady pytań:
- Język polski
- 4 odpowiedzi, jedna poprawna (correctIndex 0-3)
- Unikaj stwierdzeń medycznych - trzymaj się faktów o IG/ŁG
- Różnicuj trudność (proste fakty vs. porównania)

Przykładowe tematy:
- IG białego chleba vs. pełnoziarnistego
- Co to maltodekstryna, syrop glukozowo-fruktozowy
- Czy owoce są bezpieczne przy IO
- Wpływ błonnika na IG
- Indeks glikemiczny vs. ładunek glikemiczny
- Najlepsze źródła białka przy IO
```

---

### PROMPT 4: QuizService

```
Zaimplementuj lib/domain/gamification/quiz_service.dart

Klasa QuizService:

Stan wewnętrzny:
- int _currentRun = 0
- Set<int> _usedIndices = {}
- QuizQuestion? _currentQuestion

Metody:

1. void startNewGame()
   - Reset _currentRun = 0
   - Wyczyść _usedIndices
   - Wylosuj pierwsze pytanie

2. QuizQuestion? get currentQuestion

3. int get currentRun

4. QuizAnswerResult submitAnswer(int answerIndex, SharedPreferences prefs)
   - Sprawdź czy odpowiedź poprawna
   - Jeśli TAK: _currentRun++, wylosuj następne pytanie
   - Jeśli NIE: zapisz bestRun do prefs jeśli > poprzedni, zwróć gameOver
   - Zwróć QuizAnswerResult

5. QuizQuestion _getNextQuestion()
   - Losuj index z quizQuestions z pominięciem _usedIndices
   - Dodaj do _usedIndices
   - Jeśli wszystkie użyte → wyczyść i zacznij od nowa

6. static String getTitleForScore(int bestRun)
   - Zwróć tytuł na podstawie progów

QuizAnswerResult:
- bool isCorrect
- int correctIndex
- int newRun
- bool isGameOver
- String? newTitle (jeśli pobity rekord)

Klucze SharedPreferences:
- gamification_quiz_best_run (int)
- gamification_quiz_total_played (int)
```

---

### PROMPT 5: GamificationController (Riverpod)

```
Utwórz lib/features/gamification/gamification_controller.dart

StateNotifier<GamificationState> integrujący Streak i Quiz.

Wymagania:

1. GamificationController extends StateNotifier<GamificationState>
   - Konstruktor przyjmuje SharedPreferences

2. Metody:
   - Future<void> initialize()
     → Wczytaj stan z SharedPreferences
     → Wywołaj StreakService.checkAndUpdateStreak()
     → Zaktualizuj state

   - int get quizBestRun → state.quizBestRun

   - void updateQuizBestRun(int newBest)
     → Zaktualizuj state jeśli newBest > current

3. Provider:
   final gamificationControllerProvider =
     StateNotifierProvider<GamificationController, GamificationState>((ref) {
       final prefs = ref.watch(sharedPreferencesProvider);
       return GamificationController(prefs);
     });

4. Użyj istniejącego sharedPreferencesProvider z settings_controller.dart
   (zaimportuj odpowiedni plik)

Stan początkowy: currentStreak=0, bestStreak=0, quizBestRun=0
```

---

### PROMPT 6: StreakWidget

```
Utwórz lib/features/gamification/widgets/streak_widget.dart

Kompaktowy widget do wyświetlenia na HomeScreen.

Wymagania:
- ConsumerWidget
- Pobiera stan z gamificationControllerProvider

Wygląd:
- Container z lekkim tłem (Colors.green.withOpacity(0.1))
- BorderRadius: 12
- Padding: 12 horizontal, 8 vertical
- Row:
  - Icon(Icons.local_fire_department, color: Colors.orange)
  - SizedBox(width: 8)
  - Text "Seria: X dni" (bold)
  - Spacer()
  - Text "Rekord: Y" (mniejszy, szary)

Edge cases:
- Jeśli currentStreak == 0: "Zacznij swoją serię!"
- Jeśli currentStreak == bestStreak && bestStreak > 0: dodaj "🏆" przy rekordzie

Styl Material 3, bez animacji.
```

---

### PROMPT 7: QuizController

```
Utwórz lib/features/gamification/quiz/quiz_controller.dart

StateNotifier dla ekranu quizu.

QuizGameState:
- QuizQuestion? currentQuestion
- int currentRun
- int bestRun
- bool isGameOver
- bool? lastAnswerCorrect (null = nie odpowiedziano jeszcze)
- int? lastCorrectIndex (do pokazania poprawnej po błędzie)

QuizController extends StateNotifier<QuizGameState>:
- Konstruktor przyjmuje SharedPreferences
- QuizService jako pole prywatne

Metody:
1. void startGame()
   - Wywołaj _quizService.startNewGame()
   - Wczytaj bestRun z prefs
   - Ustaw state: currentQuestion, currentRun=0, isGameOver=false

2. void submitAnswer(int index)
   - Wywołaj _quizService.submitAnswer()
   - Zaktualizuj state na podstawie wyniku
   - Jeśli gameOver: ustaw lastCorrectIndex

3. void playAgain()
   - Wywołaj startGame()

Provider:
final quizControllerProvider =
  StateNotifierProvider<QuizController, QuizGameState>((ref) {
    final prefs = ref.watch(sharedPreferencesProvider);
    return QuizController(prefs);
  });
```

---

### PROMPT 8: QuizScreen UI

```
Utwórz lib/features/gamification/quiz/quiz_screen.dart

ConsumerStatefulWidget z pełnym UI quizu.

Struktura:
1. AppBar: "Wiedza IO" + IconButton(Icons.close) → pop

2. Body (Padding 16):
   A) Nagłówek:
      - Row: "Pytanie ${currentRun + 1}" | "Najlepszy: $bestRun"
      - Tytuł gracza: QuizService.getTitleForScore(bestRun)

   B) Karta pytania:
      - Card z elevation 2
      - Padding 20
      - Text pytania (fontSize 18, fontWeight 500)

   C) Odpowiedzi (4x):
      - SizedBox(height: 12) między każdą
      - OutlinedButton pełnej szerokości
      - Jeśli gameOver:
        - Poprawna: zielone tło
        - Wybrana błędna: czerwone tło
      - Jeśli nie gameOver: normalne przyciski

   D) Po gameOver:
      - Text "Koniec! Zdobyłeś X punktów"
      - Text "Twój tytuł: [tytuł]"
      - ElevatedButton "Zagraj ponownie"

initState: wywołaj controller.startGame()

Brak timera, brak animacji przejść.
```

---

### PROMPT 9: Integracja - Routing i HomeScreen

```
CZĘŚĆ A - Routing:
Zmodyfikuj lib/core/router/app_router.dart

Dodaj route:
GoRoute(
  path: '/quiz',
  builder: (context, state) => const QuizScreen(),
),

Import: quiz_screen.dart

---

CZĘŚĆ B - HomeScreen:
Zmodyfikuj lib/features/home/home_screen.dart

1. W initState (lub przy pierwszym safe frame):
   - ref.read(gamificationControllerProvider.notifier).initialize()

2. W metodzie build, dodaj StreakWidget:
   - Znajdź miejsce między greeting a tip card (lub listą produktów)
   - Dodaj:
     const SizedBox(height: 12),
     const StreakWidget(),
     const SizedBox(height: 12),

3. Dodaj przycisk dostępu do quizu (opcjonalnie w ustawieniach):
   - Lub jako mały IconButton w AppBar

Importy: streak_widget.dart, gamification_controller.dart
```

---

### PROMPT 10 (OPCJONALNY): Testy jednostkowe

```
Utwórz testy w test/domain/gamification/

1. streak_service_test.dart:
   - Test: lastOpenDate == today → nie zmienia streak
   - Test: lastOpenDate == yesterday → streak++
   - Test: lastOpenDate 3 dni temu → streak = 1
   - Test: null lastOpenDate → streak = 1
   - Test: aktualizacja bestStreak

2. quiz_service_test.dart:
   - Test: startNewGame resetuje stan
   - Test: poprawna odpowiedź → currentRun++
   - Test: błędna odpowiedź → gameOver
   - Test: bestRun się aktualizuje
   - Test: brak powtórzeń pytań w serii

Użyj mocktail do mockowania SharedPreferences:
class MockSharedPreferences extends Mock implements SharedPreferences {}

Pamiętaj o when().thenReturn() dla getString, getInt, setString, setInt.
```

---

## 4. Podsumowanie

| Funkcja | Pliki nowe | Pliki mod | Zależności |
|---------|-----------|-----------|------------|
| 2.1 Streak | 4 | 1 | SharedPreferences |
| 2.3 Quiz | 6 | 1 | SharedPreferences, QuizData |
| **Razem** | **10** | **2** | - |

**Krytyczne zależności:**
1. Modele muszą być pierwsze (Prompt 1)
2. Serwisy przed kontrolerami (Prompt 2-4 przed 5,7)
3. Kontrolery przed UI (Prompt 5,7 przed 6,8)
4. Routing na końcu (Prompt 9)

**Ryzyko:** Niskie - nowe pliki, minimalne modyfikacje istniejących.
