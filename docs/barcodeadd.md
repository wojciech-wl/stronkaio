# Analiza: Dodawanie produktów do Open Food Facts

## 1. Obecny stan implementacji

### 1.1 Flow skanowania kodu kreskowego

```
CameraScreen (tryb barcode)
    │
    ├─ Auto-scan co 1.2s (ML Kit BarcodeScanner)
    │
    ▼
ProductDataRepository.getProductData(barcode)
    │
    ├─ Cache lokalny (Drift, TTL 7 dni)
    └─ OFF API: GET /api/v2/product/{barcode}.json
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ ProductDataResult                                   │
├─────────────────────────────────────────────────────┤
│ error: none        → ReviewScreen (sukces)          │
│ error: notFound    → Overlay "Nie znaleziono"       │
│ error: incomplete  → Overlay "Nie znaleziono"       │
│ error: noNetwork   → Overlay "Nie znaleziono"       │
└─────────────────────────────────────────────────────┘
```

### 1.2 Obecny UI "Nie znaleziono produktu"

**Plik:** `lib/features/scan/camera_screen.dart` (linie 916-948)

Obecne opcje:
1. **"Skanuj etykietę (OCR)"** - przejście do trybu OCR
2. **"Anuluj"** - powrót do auto-scan

### 1.3 Kluczowe pliki

| Plik | Odpowiedzialność |
|------|------------------|
| `lib/data/datasources/off_datasource.dart` | Komunikacja z OFF API (GET) |
| `lib/data/repositories/product_data_repository.dart` | Orchestracja cache + API |
| `lib/features/scan/camera_screen.dart` | UI skanowania + overlay |
| `lib/features/scan/scan_controller.dart` | Stan UI (BarcodeProcessingStatus) |
| `lib/domain/nutrition/nutrition_facts.dart` | Model wartości odżywczych |
| `lib/core/router/app_router.dart` | Routing GoRouter |

---

## 2. Open Food Facts Write API

### 2.1 Endpoint

```
POST https://world.openfoodfacts.org/cgi/product_jqm2.pl
```

### 2.2 Wymagane parametry

| Parametr | Opis | Wymagany |
|----------|------|----------|
| `code` | Kod kreskowy (EAN-13/EAN-8) | TAK |
| `user_id` | Nazwa użytkownika OFF | TAK |
| `password` | Hasło użytkownika OFF | TAK |
| `product_name` | Nazwa produktu | NIE (zalecane) |

### 2.3 Parametry wartości odżywczych (per 100g)

| Parametr OFF | Pole w aplikacji | Jednostka |
|--------------|------------------|-----------|
| `nutriment_energy-kcal_100g` | energyKcal | kcal |
| `nutriment_proteins_100g` | protein | g |
| `nutriment_carbohydrates_100g` | carbohydrates | g |
| `nutriment_sugars_100g` | sugars | g |
| `nutriment_fat_100g` | fat | g |
| `nutriment_saturated-fat_100g` | saturatedFat | g |
| `nutriment_fiber_100g` | fiber | g |
| `nutriment_salt_100g` | salt | g |
| `ingredients_text_pl` | ingredientsText | tekst, przecinki |

### 2.4 Zalecane parametry aplikacji

```
app_name=AsystentIO
app_version=1.0.0
app_uuid={random_uuid_per_device}
```

### 2.5 Uwierzytelnianie

**Opcja A (wybrana):** Globalne konto aplikacji
- Jedna para user_id/password dla wszystkich użytkowników
- Użytkownik nie musi zakładać konta OFF
- `app_uuid` identyfikuje urządzenie (do moderacji)

**Opcja B:** Indywidualne konta
- Każdy użytkownik zakłada konto OFF
- Większa odpowiedzialność użytkownika
- Więcej friction w UX

**Rekomendacja:** Opcja A - globalne konto aplikacji

### 2.6 Rate limits

- **Brak limitu** na zapisy (write)
- 100 req/min na odczyty (read)

---

## 3. Proponowany flow

### 3.1 Nowy UI "Nie znaleziono produktu"

```
┌─────────────────────────────────────────┐
│         ℹ️  Nie znaleziono produktu      │
│                                         │
│   Kod: 5901234123457                    │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ➕ Dodaj produkt do bazy       │   │  ← NOWY PRZYCISK
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  📷 Skanuj etykietę (OCR)       │   │
│   └─────────────────────────────────┘   │
│                                         │
│            [ Anuluj ]                   │
└─────────────────────────────────────────┘
```

### 3.2 Ekran dodawania produktu

```
┌─────────────────────────────────────────┐
│  ←  Dodaj produkt                       │
├─────────────────────────────────────────┤
│                                         │
│  Kod kreskowy                           │
│  ┌─────────────────────────────────┐   │
│  │ 5901234123457          [SCAN]   │   │  ← Prefilled, możliwość rescan
│  └─────────────────────────────────┘   │
│                                         │
│  Nazwa produktu                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ═══════════════════════════════════   │
│  Wartości odżywcze (na 100g)            │
│  ═══════════════════════════════════   │
│                                         │
│  Energia (kcal) *                       │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Białko (g) *                           │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Węglowodany (g) *                      │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  - w tym cukry (g) *                    │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Tłuszcz (g) *                          │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  - w tym nasycone (g)                   │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Błonnik (g)                            │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sól (g)                                │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Skład (rozdziel przecinkami)           │
│  ┌─────────────────────────────────┐   │
│  │ mąka pszenna, cukier, olej...   │   │
│  └─────────────────────────────────┘   │
│  ℹ️ Skład wpływa na indeks glikemiczny  │
│                                         │
│  * pola wymagane                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     ✓ Dodaj i oceń produkt      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 3.3 Pola formularza

| Pole | Wymagane | Walidacja |
|------|----------|-----------|
| Kod kreskowy | TAK | 8-13 cyfr, prefilled |
| Nazwa produktu | NIE | max 200 znaków |
| Energia (kcal) | TAK | 0-900 |
| Białko (g) | TAK | 0-100 |
| Węglowodany (g) | TAK | 0-100 |
| Cukry (g) | TAK | 0-100, <= węglowodany |
| Tłuszcz (g) | TAK | 0-100 |
| Tłuszcz nasycony (g) | NIE | 0-100, <= tłuszcz |
| Błonnik (g) | NIE | 0-100 |
| Sól (g) | NIE | 0-100 |
| Skład | NIE | rozdzielony przecinkami, max 2000 znaków |

**Uwagi:**
- Wymagane pola odpowiadają minimum do obliczenia scoringu w aplikacji
- Pole "Skład" ma wpływ na obliczanie Indeksu Glikemicznego (IG) - składniki jak błonnik, białko, tłuszcz wpływają na IG produktu

### 3.4 Flow po submit

```
Submit formularza
    │
    ▼
Walidacja lokalna
    │
    ├─ Błąd → Pokaż komunikaty walidacji
    │
    ▼
POST do OFF API
    │
    ├─ Sukces (status 1) →
    │       │
    │       ├─ Zapisz do lokalnego cache
    │       ├─ Pokaż SnackBar sukcesu
    │       └─ Nawiguj do ReviewScreen z danymi
    │
    ├─ Błąd sieci →
    │       │
    │       ├─ Zapisz lokalnie (opcjonalnie: offline queue)
    │       ├─ Pokaż komunikat o braku sieci
    │       └─ Nawiguj do ReviewScreen z danymi
    │
    └─ Błąd API →
            │
            └─ Pokaż komunikat błędu
```

---

## 4. Architektura implementacji

### 4.1 Nowe pliki

```
lib/
├── core/
│   └── security/
│       └── off_credentials.dart               # Obfuskacja credentials + app_uuid
├── data/
│   └── datasources/
│       └── off_write_datasource.dart          # POST do OFF API
├── domain/
│   └── barcode/
│       └── off_product_submission.dart        # Model danych do wysłania
├── features/
│   └── scan/
│       └── add_product_screen.dart            # Nowy ekran formularza
│       └── add_product_controller.dart        # Stan formularza (Riverpod)
└── l10n/
    ├── app_pl.arb                             # Nowe stringi PL
    └── app_en.arb                             # Nowe stringi EN

tools/
└── encrypt_off_password.dart                  # Narzędzie offline (NIE w APK)
```

### 4.2 Modyfikowane pliki

```
lib/
├── core/
│   └── router/
│       └── app_router.dart                    # Nowa route /scan/add-product
├── data/
│   └── datasources/
│       └── off_datasource.dart                # Opcjonalnie: shared http client
├── features/
│   └── scan/
│       └── camera_screen.dart                 # Nowy przycisk w overlay
└── l10n/
    ├── app_pl.arb                             # Modyfikacja stringów
    └── app_en.arb                             # Modyfikacja stringów
```

### 4.3 Zależności

Nowe pakiety (do pubspec.yaml):
```yaml
dependencies:
  encrypt: ^5.0.3      # AES-256 do obfuskacji credentials
  crypto: ^3.0.3       # SHA-256 do derivacji klucza
  uuid: ^4.2.1         # UUID v4 dla app_uuid
  # http - już masz
  # shared_preferences - już masz
```

---

## 5. Lokalizacja (nowe stringi)

### Polski (app_pl.arb)

```json
{
  "addProductTitle": "Dodaj produkt",
  "addProductBarcode": "Kod kreskowy",
  "addProductName": "Nazwa produktu",
  "addProductNutritionHeader": "Wartości odżywcze (na 100g)",
  "addProductEnergy": "Energia (kcal)",
  "addProductProtein": "Białko (g)",
  "addProductCarbs": "Węglowodany (g)",
  "addProductSugars": "- w tym cukry (g)",
  "addProductFat": "Tłuszcz (g)",
  "addProductSaturatedFat": "- w tym nasycone (g)",
  "addProductFiber": "Błonnik (g)",
  "addProductSalt": "Sól (g)",
  "addProductIngredients": "Skład",
  "addProductIngredientsHint": "rozdziel przecinkami",
  "addProductIngredientsHelper": "Skład wpływa na indeks glikemiczny",
  "addProductRequired": "* pola wymagane",
  "addProductSubmit": "Dodaj i oceń produkt",
  "addProductSuccess": "Produkt dodany do bazy",
  "addProductError": "Nie udało się dodać produktu",
  "addProductNetworkError": "Brak połączenia - produkt zapisany lokalnie",
  "addProductValidationError": "Wypełnij wszystkie wymagane pola",
  "scanCameraBarcodeAddProduct": "Dodaj produkt do bazy"
}
```

### Angielski (app_en.arb)

```json
{
  "addProductTitle": "Add product",
  "addProductBarcode": "Barcode",
  "addProductName": "Product name",
  "addProductNutritionHeader": "Nutrition facts (per 100g)",
  "addProductEnergy": "Energy (kcal)",
  "addProductProtein": "Protein (g)",
  "addProductCarbs": "Carbohydrates (g)",
  "addProductSugars": "- of which sugars (g)",
  "addProductFat": "Fat (g)",
  "addProductSaturatedFat": "- of which saturates (g)",
  "addProductFiber": "Fiber (g)",
  "addProductSalt": "Salt (g)",
  "addProductIngredients": "Ingredients",
  "addProductIngredientsHint": "separate with commas",
  "addProductIngredientsHelper": "Ingredients affect glycemic index",
  "addProductRequired": "* required fields",
  "addProductSubmit": "Add and rate product",
  "addProductSuccess": "Product added to database",
  "addProductError": "Failed to add product",
  "addProductNetworkError": "No connection - product saved locally",
  "addProductValidationError": "Please fill all required fields",
  "scanCameraBarcodeAddProduct": "Add product to database"
}
```

---

## 6. Kwestie bezpieczeństwa

### 6.1 Przechowywanie kredek OFF - Opcja C (obfuskacja)

**Problem:** Credentials hardcoded w APK można wyciągnąć w 5 minut przez `apktool` + `grep`.

**Rozwiązanie:** Obfuskacja AES - nie jest idealna, ale odrzuca 95% atakujących (script kiddies, ciekawscy). Profesjonalny reverse engineer złamie to w 2-4h, ale:
- Konto OFF nie ma wartości finansowej
- Brak danych osobowych do kradzieży
- OFF ma moderację i może banować per `app_uuid`

**Schemat:**

```
┌─────────────────────────────────────────────────────────────┐
│ BUILD TIME (offline, jednorazowo)                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Wygeneruj losowy SALT (32 znaki hex)                     │
│ 2. Stwórz klucz: SHA256(SALT + "asystent-io-secret-2024")   │
│ 3. Zaszyfruj hasło OFF: AES-256-CBC(password, klucz)        │
│ 4. Zapisz w kodzie: SALT + zaszyfrowane hasło (base64)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ RUNTIME (w aplikacji)                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Odczytaj SALT i zaszyfrowane hasło z kodu                │
│ 2. Odtwórz klucz: SHA256(SALT + "asystent-io-secret-2024")  │
│ 3. Odszyfruj hasło: AES-256-CBC-decrypt(encrypted, klucz)   │
│ 4. Użyj hasła do POST do OFF API                            │
└─────────────────────────────────────────────────────────────┘
```

**Dlaczego to utrudnia reverse engineering:**
- Hasło nie występuje jako plaintext w binarce
- Klucz nie jest przechowywany - jest derivowany runtime
- Atakujący musi znaleźć: SALT, zaszyfrowane hasło, algorytm, secret phrase
- Wymaga analizy kodu Dart/natywnego, nie wystarczy `strings`

### 6.2 App UUID

Identyfikator urządzenia wysyłany do OFF - pozwala moderatorom banować konkretne urządzenie bez banowania całej aplikacji.

```dart
// Generowanie unikalnego UUID per urządzenie (raz, przy pierwszym dodaniu produktu)
// Zapisywane w SharedPreferences
final appUuid = await _getOrCreateAppUuid();
```

### 6.3 Co gdy credentials wyciekną?

| Scenariusz | Reakcja |
|------------|---------|
| Ktoś spamuje przez Twoje konto | OFF banuje `app_uuid`, Ty zmieniasz hasło i wypuszczasz update |
| OFF skasuje konto | Produkty w bazie zostają, zakładasz nowe konto |
| Masowy abuse | OFF kontaktuje się z Tobą (mają email z User-Agent) |

**Ważne:** OFF to społeczność open source. Nie zbanują Twojej apki bez ostrzeżenia. Moderacja usuwa spam, historia zmian pozwala rollback.

### 6.4 Walidacja danych

- Walidacja po stronie klienta przed wysłaniem
- OFF API ma własną walidację
- Nie przechowujemy danych personalnych użytkownika

---

## 7. Ocena trudności implementacji

### Skala: 0-10

| Komponent | Trudność | Uzasadnienie |
|-----------|----------|--------------|
| OFF Write DataSource | 3/10 | Prosty POST, znany format |
| Model danych submission | 2/10 | Prosta klasa z mapowaniem |
| Ekran formularza | 4/10 | Standardowy formularz Flutter |
| Walidacja | 3/10 | Proste reguły |
| Integracja z flow | 4/10 | Modyfikacja istniejącego overlay |
| Routing | 2/10 | Jedna nowa route |
| Lokalizacja | 2/10 | Dodanie stringów |
| Obsługa błędów | 3/10 | Standardowa obsługa |
| Testy | 4/10 | Unit + widget tests |

### **Ogólna ocena: 4/10** (Średnia trudność)

**Uzasadnienie:**
- Brak skomplikowanej logiki biznesowej
- Wykorzystanie istniejącej architektury
- Brak nowych zależności
- Standardowe wzorce Flutter/Riverpod
- Dobrze udokumentowane API OFF

**Szacowany czas:** 1-2 dni robocze dla doświadczonego developera Flutter

---

## 8. Prompty implementacyjne

### PROMPT 0: Obfuskacja credentials OFF + App UUID (Opus 4.5 / Sonnet 4)

```
Kontekst: Aplikacja Flutter "Asystent IO" będzie wysyłać produkty do Open Food Facts API. Potrzebuję bezpiecznego przechowywania credentials (user_id, password) oraz generowania unikalnego app_uuid per urządzenie.

Wymagania:
- Credentials NIE mogą być plaintext w kodzie
- Użyj AES-256-CBC do szyfrowania hasła
- Klucz derivowany runtime przez SHA-256
- app_uuid generowany raz i zapisywany w SharedPreferences

Zadanie: Stwórz plik `lib/core/security/off_credentials.dart`:

1. Dodaj dependency do pubspec.yaml:
   - encrypt: ^5.0.3

2. Stałe (te wartości są PRZYKŁADOWE - wygeneruj własne):
   ```dart
   // Te wartości wygenerujesz offline przed buildem:
   // 1. SALT: 32 losowe znaki hex (np. przez: openssl rand -hex 16)
   // 2. SECRET_PHRASE: stały string znany tylko Tobie
   // 3. ENCRYPTED_PASSWORD: zaszyfrowane hasło OFF (instrukcja niżej)
   // 4. USER_ID: nazwa użytkownika OFF (ta może być plaintext)

   const _salt = 'a1b2c3d4e5f6...'; // 32 znaki hex
   const _secretPhrase = 'asystent-io-secret-2024';
   const _encryptedPassword = 'base64string...'; // AES encrypted
   const _userId = 'asystent-io-app';
   ```

3. Klasa OffCredentials:
   ```dart
   class OffCredentials {
     static final OffCredentials _instance = OffCredentials._();
     factory OffCredentials() => _instance;
     OffCredentials._();

     String get userId => _userId;

     String get password {
       // 1. Derive key: SHA256(salt + secretPhrase), weź pierwsze 32 bajty
       // 2. IV: pierwsze 16 bajtów z tego samego hasha (lub osobny stały IV)
       // 3. Decrypt AES-256-CBC
       // 4. Return plaintext password
     }

     // App UUID - generowany raz per urządzenie
     Future<String> getAppUuid() async {
       final prefs = await SharedPreferences.getInstance();
       var uuid = prefs.getString('off_app_uuid');
       if (uuid == null) {
         uuid = const Uuid().v4();
         await prefs.setString('off_app_uuid', uuid);
       }
       return uuid;
     }
   }
   ```

4. Stwórz OSOBNY plik `tools/encrypt_off_password.dart` (NIE w lib/, to narzędzie offline):
   ```dart
   // Uruchamiasz to RAZ lokalnie: dart run tools/encrypt_off_password.dart
   // Wynik (encrypted password) wklejasz do off_credentials.dart

   void main() {
     const salt = 'a1b2c3d4e5f6...'; // ten sam co w off_credentials.dart
     const secretPhrase = 'asystent-io-secret-2024';
     const plainPassword = 'TWOJE_PRAWDZIWE_HASLO_OFF'; // TO USUWASZ PO UZYCIU

     // 1. Derive key
     // 2. Encrypt AES-256-CBC
     // 3. Print base64 result
     print('Encrypted password (wklej do off_credentials.dart):');
     print(encryptedBase64);
   }
   ```

5. Dodaj `tools/encrypt_off_password.dart` do .gitignore (WAŻNE!)

Użyj pakietów:
- encrypt: ^5.0.3 (AES)
- crypto: ^3.0.3 (SHA-256)
- uuid: ^4.2.1 (UUID v4)
- shared_preferences (już masz w projekcie)

WAŻNE:
- Plik tools/ NIE trafia do APK
- Po wygenerowaniu encrypted password USUŃ plaintext z narzędzia
- SALT i SECRET_PHRASE mogą być w kodzie (to część algorytmu, nie sam sekret)
- Prawdziwe hasło OFF nigdy nie jest w git ani w kodzie produkcyjnym

NIE modyfikuj żadnych istniejących plików poza pubspec.yaml.
```

---

### PROMPT 1: Model i DataSource (Sonnet 4)

```
Kontekst: Aplikacja Flutter "Asystent IO" używa Open Food Facts API do pobierania danych produktów. Potrzebuję dodać możliwość WYSYŁANIA nowych produktów do OFF.

Zadanie: Stwórz dwa pliki:

1. `lib/domain/barcode/off_product_submission.dart` - model danych do wysłania:
   - Klasa OffProductSubmission z polami: barcode, productName (nullable), energyKcal, protein, carbohydrates, sugars, fat, saturatedFat (nullable), fiber (nullable), salt (nullable), ingredientsText (nullable)
   - Metoda toFormData() zwracająca Map<String, String> z kluczami OFF API:
     - code, product_name, nutriment_energy-kcal_100g, nutriment_proteins_100g, nutriment_carbohydrates_100g, nutriment_sugars_100g, nutriment_fat_100g, nutriment_saturated-fat_100g, nutriment_fiber_100g, nutriment_salt_100g, ingredients_text_pl
   - Metoda toNutritionFacts() konwertująca na istniejący model NutritionFacts
   - Getter ingredientsText zwraca skład (do przekazania dalej w flow)

2. `lib/data/datasources/off_write_datasource.dart` - wysyłanie do OFF:
   - Klasa OffWriteDataSource z http.Client i OffCredentials
   - Endpoint: POST https://world.openfoodfacts.org/cgi/product_jqm2.pl
   - Metoda submitProduct(OffProductSubmission) zwracająca sealed class OffSubmitResult:
     - OffSubmitSuccess
     - OffSubmitError(String message)
     - OffSubmitNetworkError(String? message)
   - Credentials pobieraj z OffCredentials() (userId, password, appUuid)
   - Dodaj parametry: app_name=AsystentIO, app_version=1.0.0, app_uuid z OffCredentials
   - Timeout: 15 sekund

Wzoruj się na istniejącym pliku: lib/data/datasources/off_datasource.dart

NIE modyfikuj żadnych istniejących plików. Tylko stwórz nowe.
```

### PROMPT 2: Ekran formularza - UI (Opus 4.5)

```
Kontekst: Aplikacja Flutter "Asystent IO" potrzebuje ekranu do dodawania produktów do Open Food Facts.

Zadanie: Stwórz plik `lib/features/scan/add_product_screen.dart`:

1. StatefulWidget AddProductScreen przyjmujący parametr: String barcode (prefilled)

2. Formularz z polami (TextFormField):
   - Kod kreskowy (readonly, z ikoną barcode)
   - Nazwa produktu (opcjonalne)
   - Sekcja "Wartości odżywcze (na 100g)" z Divider
   - Energia kcal (wymagane, keyboardType: number)
   - Białko g (wymagane)
   - Węglowodany g (wymagane)
   - Cukry g (wymagane, indent wizualny "- w tym")
   - Tłuszcz g (wymagane)
   - Tłuszcz nasycony g (opcjonalne, indent)
   - Błonnik g (opcjonalne)
   - Sól g (opcjonalne)
   - Skład (opcjonalne, multiline, hint: "rozdziel przecinkami", helper text: "Skład wpływa na indeks glikemiczny")

3. Walidacja:
   - Wymagane pola nie mogą być puste
   - Wartości numeryczne 0-999
   - Cukry <= węglowodany
   - Tłuszcz nasycony <= tłuszcz

4. Przycisk "Dodaj i oceń produkt" (FilledButton, pełna szerokość)

5. AppBar z tytułem "Dodaj produkt" i przyciskiem back

6. Użyj Material 3, Theme.of(context)

7. Na razie onSubmit tylko print() - logikę dodamy później

Stringi hardcoded po polsku (potem dodamy l10n).
Nie używaj żadnych zewnętrznych pakietów poza standardowym Flutter.
```

### PROMPT 3: Controller i logika submit (Sonnet 4)

```
Kontekst: Mam ekran AddProductScreen i OffWriteDataSource. Potrzebuję kontrolera Riverpod do zarządzania stanem i wysyłania danych.

Zadanie: Stwórz plik `lib/features/scan/add_product_controller.dart`:

1. Enum AddProductStatus: idle, submitting, success, error

2. Klasa AddProductState z polami:
   - status: AddProductStatus
   - errorMessage: String?
   - submittedNutrition: NutritionFacts? (do przekazania do ReviewScreen)

3. StateNotifier AddProductController:
   - Zależność: OffWriteDataSource
   - Metoda submit(OffProductSubmission):
     - Ustaw status = submitting
     - Wywołaj datasource.submitProduct()
     - Na sukces: status = success, zapisz nutrition
     - Na błąd: status = error, zapisz message
   - Metoda reset()

4. Provider:
   - offWriteDataSourceProvider
   - addProductControllerProvider (StateNotifierProvider)

Wzoruj się na istniejącym: lib/features/scan/scan_controller.dart
```

### PROMPT 4: Integracja z AddProductScreen (Sonnet 4)

```
Kontekst: Mam AddProductScreen (UI) i AddProductController (logika). Trzeba je połączyć.

Zadanie: Zmodyfikuj `lib/features/scan/add_product_screen.dart`:

1. Dodaj ConsumerStatefulWidget (Riverpod)

2. W onSubmit:
   - Zbuduj OffProductSubmission z pól formularza
   - Wywołaj controller.submit()

3. Listener na stan kontrolera:
   - submitting: pokaż CircularProgressIndicator na przycisku, zablokuj formularz
   - success:
     - Pokaż SnackBar "Produkt dodany do bazy"
     - Nawiguj do /scan/review z danymi (nutrition, barcode, source: 'off-user')
   - error: pokaż SnackBar z błędem

4. Dodaj ref.watch(addProductControllerProvider)

5. Dispose: controller.reset()
```

### PROMPT 5: Modyfikacja overlay "Nie znaleziono" (Sonnet 4)

```
Kontekst: W pliku lib/features/scan/camera_screen.dart jest widget _BarcodeProcessingOverlay który pokazuje się gdy produkt nie został znaleziony w OFF. Trzeba dodać nowy przycisk.

Zadanie: Zmodyfikuj _BarcodeProcessingOverlay w camera_screen.dart:

1. Znajdź sekcję else (linie ~916-948) gdzie jest status fallbackRequired

2. PRZED przyciskiem "Skanuj etykietę (OCR)" dodaj nowy przycisk:
   - OutlinedButton.icon (nie FilledButton - to dla OCR)
   - Ikona: Icons.add_circle_outline
   - Tekst: "Dodaj produkt do bazy"
   - onPressed: nowy callback onAddProduct

3. Dodaj parametr do _BarcodeProcessingOverlay:
   - final VoidCallback? onAddProduct

4. W miejscu gdzie tworzysz _BarcodeProcessingOverlay, dodaj:
   - onAddProduct: () => context.push('/scan/add-product', extra: detectedBarcode)

5. Zachowaj istniejący układ - nowy przycisk między tytułem a przyciskiem OCR

NIE zmieniaj niczego innego w tym pliku.
```

### PROMPT 6: Routing (Sonnet 4)

```
Kontekst: Trzeba dodać nową route dla ekranu AddProductScreen.

Zadanie: Zmodyfikuj `lib/core/router/app_router.dart`:

1. Dodaj import: import '../../features/scan/add_product_screen.dart';

2. Dodaj nową GoRoute po /scan/review:

GoRoute(
  path: '/scan/add-product',
  name: 'scan-add-product',
  builder: (context, state) {
    final barcode = state.extra as String?;
    if (barcode == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/scan/camera');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return AddProductScreen(barcode: barcode);
  },
),

NIE zmieniaj niczego innego.
```

### PROMPT 7: Lokalizacja (Haiku)

```
Zadanie: Dodaj nowe stringi lokalizacyjne.

1. W `lib/l10n/app_pl.arb` dodaj po "scanCameraBarcodeFallbackOcr":

  "scanCameraBarcodeAddProduct": "Dodaj produkt do bazy",
  "addProductTitle": "Dodaj produkt",
  "addProductBarcode": "Kod kreskowy",
  "addProductName": "Nazwa produktu",
  "addProductNutritionHeader": "Wartości odżywcze (na 100g)",
  "addProductEnergy": "Energia (kcal)",
  "addProductProtein": "Białko (g)",
  "addProductCarbs": "Węglowodany (g)",
  "addProductSugars": "- w tym cukry (g)",
  "addProductFat": "Tłuszcz (g)",
  "addProductSaturatedFat": "- w tym nasycone (g)",
  "addProductFiber": "Błonnik (g)",
  "addProductSalt": "Sól (g)",
  "addProductRequired": "* pola wymagane",
  "addProductSubmit": "Dodaj i oceń produkt",
  "addProductSuccess": "Produkt dodany do bazy",
  "addProductError": "Nie udało się dodać produktu",

2. W `lib/l10n/app_en.arb` dodaj odpowiedniki po angielsku.

Po dodaniu uruchom: flutter gen-l10n
```

### PROMPT 8: Zamiana hardcoded stringów na l10n (Haiku)

```
Zadanie: W pliku lib/features/scan/add_product_screen.dart zamień wszystkie hardcoded polskie stringi na odwołania do lokalizacji.

1. Dodaj import: import '../../l10n/app_localizations.dart';

2. W metodzie build dodaj: final l10n = AppLocalizations.of(context)!;

3. Zamień stringi:
   - "Dodaj produkt" → l10n.addProductTitle
   - "Kod kreskowy" → l10n.addProductBarcode
   - "Nazwa produktu" → l10n.addProductName
   - itd. dla wszystkich pól

4. Zamień też stringi w SnackBar.
```

### PROMPT 9: Testy jednostkowe (Sonnet 4)

```
Kontekst: Potrzebuję testów dla nowej funkcjonalności dodawania produktów do OFF.

Zadanie: Stwórz plik `test/data/datasources/off_write_datasource_test.dart`:

1. Testy dla OffWriteDataSource:
   - test sukcesu (mock response status: 1)
   - test błędu API (mock response status: 0)
   - test błędu sieci (mock SocketException)
   - test timeout

2. Użyj mocktail do mockowania http.Client

3. Sprawdź czy request zawiera wszystkie wymagane pola:
   - code, user_id, password
   - nutriment_* fields

Wzoruj się na istniejących testach w projekcie.
```

### PROMPT 10: Test widgetowy ekranu (Sonnet 4)

```
Zadanie: Stwórz plik `test/features/scan/add_product_screen_test.dart`:

1. Testy dla AddProductScreen:
   - renderuje wszystkie pola formularza
   - walidacja wymaganych pól
   - walidacja cukry <= węglowodany
   - przycisk submit jest disabled gdy formularz niepoprawny
   - pokazuje loading indicator podczas submit

2. Użyj ProviderScope z mockami

3. Sprawdź czy barcode jest prefilled i readonly
```

---

## 9. Kolejność implementacji

```
FAZA 0: Bezpieczeństwo (Prompt 0) ⚠️ NAJPIERW
├── OffCredentials (obfuskacja AES)
├── App UUID generator
└── Narzędzie offline do szyfrowania hasła

FAZA 1: Fundament (Prompty 1-2)
├── Model OffProductSubmission
├── OffWriteDataSource (używa OffCredentials)
└── AddProductScreen (UI only)

FAZA 2: Logika (Prompty 3-4)
├── AddProductController
└── Integracja UI + Controller

FAZA 3: Integracja (Prompty 5-6)
├── Modyfikacja overlay
└── Routing

FAZA 4: Polish (Prompty 7-8)
├── Lokalizacja
└── Zamiana stringów

FAZA 5: Testy (Prompty 9-10)
├── Unit tests
└── Widget tests
```

**WAŻNE:** Po FAZIE 0 musisz ręcznie:
1. Założyć konto na openfoodfacts.org (user: asystent-io-app lub podobne)
2. Uruchomić `dart run tools/encrypt_off_password.dart` z prawdziwym hasłem
3. Wkleić wynik do `off_credentials.dart`
4. USUNĄĆ plaintext hasło z narzędzia
5. Dodać `tools/encrypt_off_password.dart` do `.gitignore`

---

## 10. Ryzyka i mitygacja

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|--------|-------------------|-------|-----------|
| OFF API zmieni format | Niskie | Średni | Wersjonowanie API, monitoring |
| Spam/abuse | Średnie | Wysoki | app_uuid, rate limiting client-side |
| Niepoprawne dane od użytkowników | Wysokie | Niski | Walidacja, OFF ma własną moderację |
| Brak sieci przy submit | Średnie | Średni | Zapisz lokalnie, sync później |
| Kredki wyciekną z APK | Średnie | Średni | Opcja B (secure storage) w przyszłości |

---

## 11. Podsumowanie

**Co zyskujemy:**
- Użytkownicy mogą dodawać brakujące produkty
- Społecznościowe budowanie bazy OFF
- Lepsza konwersja (mniej "nie znaleziono")
- Brak dodatkowych kosztów (OFF jest darmowe)

**Koszty:**
- ~1-2 dni implementacji
- Utrzymanie globalnego konta OFF
- Potencjalna moderacja nadużyć

**Rekomendacja:** Implementować. Stosunek korzyści do kosztów jest bardzo korzystny.

---

## 12. Źródła

- [Open Food Facts API Documentation](https://openfoodfacts.github.io/openfoodfacts-server/api/)
- [Open Food Facts API Tutorial](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/)
- [Open Food Facts Data & SDKs](https://world.openfoodfacts.org/data)
- [openfoodfacts-dart package](https://pub.dev/packages/openfoodfacts)
