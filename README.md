# LifeOS Cloud — istruzioni

1. Esegui `schema-cloud.sql` nel SQL Editor Supabase. Lo schema `lifeos` deve essere in **Exposed schemas**.
2. In Supabase → Project Settings → API Keys / Connect, copia Project URL e **publishable key** in `config.js`. Mai service_role, secret key o password DB.
3. In Authentication → Providers abilita Email e la conferma email. In URL Configuration imposta Site URL sull’indirizzo GitHub Pages quando disponibile.
4. Crea un repository GitHub pubblico **lifeos-app** (non inserire dati personali nei file). Carica i file di questa cartella nella radice del repository. Settings → Pages → Deploy from a branch → main / root → Save.
5. Apri `https://TUO-USERNAME.github.io/lifeos-app/`, crea l’account e conferma l’email. Poi accedi. Su iPhone apri lo stesso URL con Safari e usa Condividi → Aggiungi alla schermata Home.
6. Al primo accesso dal Mac, se ci sono dati locali precedenti, puoi scegliere di importarli. Esegui sempre prima un backup JSON della vecchia versione.

## Avvertenze
- La sincronizzazione usa un singolo documento JSON per utente: se modifichi contemporaneamente su due dispositivi, l’ultimo salvataggio può sovrascrivere il precedente. Evita modifiche contemporanee.
- Il browser salva una copia locale; se il cloud è offline, lo stato mostra l’errore. Non considerare sincronizzati i dati finché non vedi “Salvato online”.
- Il repository GitHub Pages deve essere pubblico sul piano gratuito, quindi pubblica solo codice e configurazione pubblica, mai dati personali o segreti.
- La pubblicazione non viene eseguita automaticamente da questo pacchetto: devi effettuare i passaggi su GitHub.
- Le notifiche push non sono incluse.
