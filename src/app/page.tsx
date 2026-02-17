// Root page - middleware handles locale redirect based on host
// This file exists as a fallback but should never be reached
// because middleware redirects / to /{locale}
export default function RootPage() {
    return null;
}
