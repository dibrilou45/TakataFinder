# Configuration de Google OAuth pour Supabase

Voici les étapes à suivre pour configurer correctement la connexion avec Google :

## 1. Configurer Google Cloud Console

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans "APIs & Services" > "Credentials"
4. Cliquez sur "Create Credentials" et sélectionnez "OAuth client ID"
5. Configurez l'écran de consentement si ce n'est pas déjà fait
6. Pour le type d'application, sélectionnez "Web application"
7. Donnez un nom à votre client OAuth
8. Dans "Authorized JavaScript origins", ajoutez : `http://localhost:3000`
9. Dans "Authorized redirect URIs", ajoutez :
   - `http://localhost:3000/auth/callback`
   - `https://wnxdekiekzlfvkwamgom.supabase.co/auth/v1/callback`
10. Cliquez sur "Create"
11. Notez le "Client ID" et le "Client Secret"

## 2. Configurer Supabase

1. Accédez à votre [dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans "Authentication" > "Providers"
4. Activez "Google"
5. Remplissez les champs :
   - Client ID : celui obtenu de Google Cloud Console
   - Client Secret : celui obtenu de Google Cloud Console
   - Authorized Client Domains : `http://localhost:3000`
6. Sauvegardez les changements

## 3. URL de redirection

Assurez-vous que l'URL de redirection dans le code correspond à celle configurée dans Google Cloud Console :

```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## 4. Vérification de la configuration

1. Redémarrez votre serveur de développement
2. Videz le cache de votre navigateur ou utilisez une fenêtre de navigation privée
3. Essayez de vous connecter à nouveau avec Google

Si vous rencontrez toujours des problèmes, vérifiez les journaux dans la console de développement du navigateur pour identifier les erreurs spécifiques.
